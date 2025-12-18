"use client";

import { useState } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";
import { Card, CardBody, Button, Input, Label } from "@/components/ui";

function diffKeys(a: any, b: any, prefix = ""): Array<{ path: string; from: any; to: any }> {
  const out: Array<{ path: string; from: any; to: any }> = [];
  for (const k of Object.keys(b ?? {})) {
    const p = prefix ? `${prefix}.${k}` : k;
    const bv = b[k];
    const av = a?.[k];
    if (bv && typeof bv === "object" && !Array.isArray(bv)) {
      out.push(...diffKeys(av ?? {}, bv, p));
    } else {
      out.push({ path: p, from: av, to: bv });
    }
  }
  return out;
}

export function PlannerPanel() {
  const st = useInstrumentStore((s) => s.instrumentState);
  const proposal = useInstrumentStore((s) => s.plannerProposal);
  const setProposal = useInstrumentStore((s) => s.setPlannerProposal);
  const accept = useInstrumentStore((s) => s.acceptPlannerProposal);
  const applyPatch = useInstrumentStore((s) => s.applyPatch);

  const [targetPeak, setTargetPeak] = useState(st.planner.targetPeakFamily);
  const [snr, setSnr] = useState(`${st.planner.targetSNR}`);
  const [sat, setSat] = useState(`${st.planner.maxSaturation}`);

  const recommend = async () => {
    // update planner fields in-state (commit but this is not the proposal patch)
    applyPatch(
      { planner: { targetPeakFamily: targetPeak, targetSNR: Number(snr), maxSaturation: Number(sat) } },
      "commit",
      "planner-constraints"
    );

    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ instrumentState: st, constraints: { targetPeak, snr: Number(snr), sat: Number(sat) } })
    });

    if (!res.ok) {
      setProposal({
        patch: {},
        rationale: `planner failed: ${res.status}`,
        createdAt: new Date().toISOString()
      });
      return;
    }

    const data = await res.json();
    setProposal({
      patch: data.recommendedPatch,
      rationale: data.rationale,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <Card>
      <CardBody>
        <div className="text-sm font-medium">Planner</div>
        <p className="mt-1 text-xs text-muted">
          Recommend produces a staged patch. Accept merges and runs simulate once.
        </p>

        <div className="mt-3 space-y-2">
          <Label>Target peak family</Label>
          <Input value={targetPeak} onChange={(e) => setTargetPeak(e.target.value)} placeholder="010" />

          <Label>Target SNR</Label>
          <Input value={snr} onChange={(e) => setSnr(e.target.value)} placeholder="10" />

          <Label>Max saturation</Label>
          <Input value={sat} onChange={(e) => setSat(e.target.value)} placeholder="0.95" />

          <Button variant="primary" onClick={recommend} className="w-full" intent="click">
            Recommend
          </Button>
        </div>

        {proposal ? (
          <div className="mt-4 rounded-xl2 border border-border bg-surface2 p-3">
            <div className="text-xs font-medium text-muted">Proposed changes</div>
            <div className="mt-2 space-y-1">
              {diffKeys(st, proposal.patch).slice(0, 16).map((d) => (
                <div key={d.path} className="text-xs text-muted">
                  <span className="font-mono">{d.path}</span>:{" "}
                  <span className="font-mono">{JSON.stringify(d.from)}</span> →{" "}
                  <span className="font-mono text-ink">{JSON.stringify(d.to)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 text-xs text-muted">{proposal.rationale}</div>

            <div className="mt-3 flex gap-2">
              <Button variant="primary" onClick={accept} className="w-full" intent="click">
                Accept
              </Button>
              <Button variant="default" onClick={() => setProposal(null)} className="w-full" intent="click">
                Dismiss
              </Button>
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
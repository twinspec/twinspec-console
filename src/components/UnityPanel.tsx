"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Card, CardBody } from "@/components/ui";

export function UnityPanel() {
  const unityStatus = useInstrumentStore((s) => s.unityStatus);
  const subset = useInstrumentStore((s) => ({
    datasetId: s.instrumentState.dataset.id,
    sample: s.instrumentState.sample,
    geometry: s.instrumentState.geometry
  }));

  return (
    <div className="h-full w-full rounded-xl2 border border-border bg-surface2 p-3">
      <div className="text-sm text-muted">
        (Placeholder) Unity view would render here. The web app remains authoritative.
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-xl2 border border-border bg-surface p-2">
          <div className="text-xs font-medium text-muted">Last pushed</div>
          <div className="mt-1 font-mono text-xs">{unityStatus.lastPushedAt ?? "—"}</div>
          <div className="mt-1 text-xs text-muted">hash</div>
          <div className="font-mono text-xs">{unityStatus.lastHash ?? "—"}</div>
        </div>

        <div className="rounded-xl2 border border-border bg-surface p-2">
          <div className="text-xs font-medium text-muted">Payload (subset)</div>
          <pre className="mt-2 max-h-[180px] overflow-auto text-[10px] leading-[12px] text-muted">
            {JSON.stringify(subset, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
"use client";

import { Card } from "./Card";
import { useInstrument } from "@/state/InstrumentStateContext";

export function Provenance() {
  const { lastSim } = useInstrument();
  const p = lastSim?.provenance;

  return (
    <Card title="Provenance" subtitle="What produced the current output">
      {p ? (
        <div className="space-y-2 text-sm text-slate-700">
          <div className="flex justify-between"><span className="text-slate-500">Dataset</span><span className="font-medium">{p.datasetId}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Priors</span><span className="font-medium">{p.priorsId}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Engine</span><span className="font-medium">{p.engineVersion}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Timestamp</span><span className="font-medium">{new Date(p.timestampIso).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">State hash</span><span className="font-mono text-xs">{p.stateHash.slice(0, 10)}…</span></div>
        </div>
      ) : (
        <div className="text-sm text-slate-600">No provenance yet.</div>
      )}
    </Card>
  );
}
"use client";

import { Card } from "./Card";
import { useInstrument } from "@/state/InstrumentStateContext";
import { round } from "@/lib/utils";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

export function Metrics() {
  const { lastSim } = useInstrument();

  const m = lastSim?.metrics;
  return (
    <Card title="Metrics" subtitle="Quality + constraints">
      <div className="grid grid-cols-2 gap-3">
        <Metric label="SNR (target)" value={m ? String(round(m.snrTargetPeak, 1)) : "—"} />
        <Metric label="Saturation (%)" value={m ? String(round(m.saturationPct, 1)) : "—"} />
        <Metric label="Occlusion (%)" value={m ? String(round(m.occlusionPct, 1)) : "—"} />
        <Metric label="Time (ms)" value={m ? String(round(m.acquisitionTimeMs, 0)) : "—"} />
      </div>
    </Card>
  );
}
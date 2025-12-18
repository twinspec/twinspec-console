"use client";

import { Card } from "./Card";
import { useInstrument } from "@/state/InstrumentStateContext";

export function Warnings() {
  const { warnings } = useInstrument();

  return (
    <Card title="Warnings" subtitle="Limits, occlusion, calibration bounds">
      {warnings.length ? (
        <ul className="space-y-2 text-sm text-slate-700">
          {warnings.map((w, i) => (
            <li key={i} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              {w}
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-slate-600">No warnings.</div>
      )}
    </Card>
  );
}
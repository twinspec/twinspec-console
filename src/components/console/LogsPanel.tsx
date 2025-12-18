"use client";

import { Card } from "./Card";
import { useInstrument } from "@/state/InstrumentStateContext";

export function LogsPanel() {
  const { logs } = useInstrument();

  return (
    <Card title="Logs" subtitle="Simulation + guard messages">
      <div className="max-h-[220px] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
        {logs.length ? (
          <ul className="space-y-2 text-xs text-slate-700">
            {logs.map((l, i) => (
              <li key={i} className="leading-relaxed">
                {l}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-slate-500">No logs yet.</div>
        )}
      </div>
    </Card>
  );
}
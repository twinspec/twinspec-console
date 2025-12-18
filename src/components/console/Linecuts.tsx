"use client";

import { Card } from "./Card";
import { useInstrument } from "@/state/InstrumentStateContext";

function MiniTable({ rows }: { rows: Array<{ a: number; b: number }> }) {
  return (
    <div className="max-h-[160px] overflow-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-slate-600">x</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-600">I</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 60).map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="px-3 py-2 text-slate-700">{r.a.toFixed(3)}</td>
              <td className="px-3 py-2 text-slate-700">{r.b.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Linecuts() {
  const { lastSim } = useInstrument();

  const iq = (lastSim?.iq ?? []).map((p) => ({ a: p.q, b: p.intensity }));
  const ichi = (lastSim?.ichi ?? []).map((p) => ({ a: p.chi, b: p.intensity }));

  return (
    <Card title="Linecuts" subtitle="I(q) + I(χ) (minimal demo)">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">I(q)</div>
          {iq.length ? <MiniTable rows={iq} /> : <div className="text-sm text-slate-500">No data.</div>}
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">I(χ)</div>
          {ichi.length ? <MiniTable rows={ichi} /> : <div className="text-sm text-slate-500">No data.</div>}
        </div>
      </div>
    </Card>
  );
}
"use client";

import { useEffect } from "react";
import { useInstrument } from "@/state/InstrumentStateContext";
import { StatusChips } from "./StatusChips";

export function Topbar() {
  const { priors, state, setDataset, resetState, runSimulate } = useInstrument();

  // first simulation (once priors arrive)
  useEffect(() => {
    if (!priors) return;
    runSimulate("immediate");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priors]);

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">GIWAXS Lab Console</div>
          <div className="text-xs text-slate-500">Dataset-aware instrument + data twin</div>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden md:block">
            <StatusChips />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Dataset</label>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={state.datasetId}
              onChange={(e) => setDataset(e.target.value)}
            >
              {(priors?.datasets ?? []).map((ds) => (
                <option key={ds.id} value={ds.id}>
                  {ds.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={resetState}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
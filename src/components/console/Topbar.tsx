"use client";

import { useEffect } from "react";
import { useInstrument } from "@/state/InstrumentStateContext";
import { StatusChips } from "./StatusChips";

export function Topbar() {
  const { priors, state, setDataset, resetState, runSimulate } = useInstrument();

  // Run initial simulation once priors are available
  useEffect(() => {
    if (!priors) return;
    runSimulate("immediate");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priors]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        {/* Left: instrument identity */}
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight">
            GIWAXS Lab Console
          </div>
          <div className="text-xs text-slate-500">
            Combined visual + data digital twin
          </div>
        </div>

        {/* Right: status + controls */}
        <div className="flex min-w-0 items-center gap-4">
          {/* Status chips */}
          <div className="hidden lg:block">
            <StatusChips />
          </div>

          {/* Dataset selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600">
              Dataset
            </label>
            <select
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
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

          {/* Reset */}
          <button
            onClick={resetState}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>
    </header>
  );
}
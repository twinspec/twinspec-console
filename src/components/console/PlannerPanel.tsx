"use client";

import { Card } from "./Card";
import { useInstrument, applyRecommended } from "@/state/InstrumentStateContext";
import { round } from "@/lib/utils";

function diffLine(label: string, from: string | number, to: string | number) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-medium text-slate-900">
        <span className="text-slate-500">{from}</span> <span className="text-slate-400">→</span> {to}
      </span>
    </div>
  );
}

export function PlannerPanel() {
  const { state, setState, setRecommendedPatch, recommendedPatch, runSimulate, lastSim, logs } = useInstrument();

  const propose = () => {
    // Mock planner: propose a simple patch that changes a few knobs
    const patch = {
      geometry: {
        alphaIDeg: state.geometry.alphaIDeg < 0.12 ? 0.12 : state.geometry.alphaIDeg,
        detectorDistancePreset: "far" as const,
      },
      acquisition: {
        exposureMs: Math.min(800, Math.max(300, state.acquisition.exposureMs + 150)),
        binning: (state.acquisition.binning === 1 ? 2 : state.acquisition.binning) as 1 | 2 | 4,
      },
    };
    setRecommendedPatch(patch);
  };

  const accept = () => {
    if (!recommendedPatch) return;
    setState((s) => applyRecommended(s, recommendedPatch));
    setRecommendedPatch(null);
    runSimulate("immediate");
  };

  return (
    <Card
      title="Planner"
      subtitle="Recommend instrument settings under constraints"
      right={
        <button
          onClick={propose}
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-800"
        >
          Recommend
        </button>
      }
    >
      <div className="space-y-4">
        <div className="text-sm text-slate-600">
          Current metrics (latest):{" "}
          <span className="font-medium text-slate-900">
            SNR {lastSim ? round(lastSim.metrics.snrTargetPeak, 1) : "—"}
          </span>
          , Sat {lastSim ? round(lastSim.metrics.saturationPct, 1) : "—"}%, Occ{" "}
          {lastSim ? round(lastSim.metrics.occlusionPct, 1) : "—"}%
        </div>

        {recommendedPatch ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Proposed changes
            </div>
            <div className="mt-3 space-y-2">
              {recommendedPatch.geometry?.alphaIDeg !== undefined
                ? diffLine("αᵢ (deg)", round(state.geometry.alphaIDeg, 2), round(recommendedPatch.geometry.alphaIDeg, 2))
                : null}
              {recommendedPatch.geometry?.detectorDistancePreset
                ? diffLine("Distance", state.geometry.detectorDistancePreset, recommendedPatch.geometry.detectorDistancePreset)
                : null}
              {recommendedPatch.acquisition?.exposureMs !== undefined
                ? diffLine("Exposure (ms)", state.acquisition.exposureMs, recommendedPatch.acquisition.exposureMs)
                : null}
              {recommendedPatch.acquisition?.binning !== undefined
                ? diffLine("Binning", `${state.acquisition.binning}×`, `${recommendedPatch.acquisition.binning}×`)
                : null}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={accept}
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
              >
                Accept
              </button>
              <button
                onClick={() => setRecommendedPatch(null)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600">
            Click <span className="font-medium text-slate-900">Recommend</span> to generate a proposed configuration.
          </div>
        )}

        <div className="text-xs text-slate-500">
          Planner is mocked here. Swap this for <code>POST /plan</code> later.
        </div>
      </div>
    </Card>
  );
}
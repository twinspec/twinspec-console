"use client";

import { Card } from "./Card";
import { useInstrument } from "@/state/InstrumentStateContext";
import { clamp, round } from "@/lib/utils";

export function ControlsPanel() {
  const { priors, state, setState, runSimulate } = useInstrument();

  const cls = priors?.classes.find((c) => c.id === state.sample.materialClass);

  const setAlpha = (v: number) => {
    setState((s) => ({ ...s, geometry: { ...s.geometry, alphaIDeg: v } }));
    runSimulate("immediate");
  };

  return (
    <Card
      title="Controls"
      subtitle="Instrument + acquisition parameters"
      right={
        <button
          onClick={() => runSimulate("immediate")}
          className="rounded-xl bg-slate-900 px-3 py-2 text-xs text-white hover:bg-slate-800"
        >
          Simulate
        </button>
      }
    >
      <div className="space-y-5">
        {/* Sample */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dataset</div>
          <div className="mt-2 grid gap-3">
            <div>
              <label className="text-xs text-slate-600">Material class</label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                value={state.sample.materialClass}
                onChange={(e) => {
                  const materialClass = e.target.value as any;
                  setState((s) => ({ ...s, sample: { ...s.sample, materialClass } }));
                  runSimulate("immediate");
                }}
              >
                {(priors?.classes ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              {cls ? (
                <div className="mt-2 text-xs text-slate-500">
                  Limits: αᵢ {cls.limits.alphaIDegMin}–{cls.limits.alphaIDegMax}°, tilt |{cls.limits.detectorTiltAbsMaxDeg}°|,
                  exposure {cls.limits.exposureMsMin}–{cls.limits.exposureMsMax} ms
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-600">Thickness</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={state.sample.thicknessTag}
                  onChange={(e) => {
                    const thicknessTag = e.target.value as any;
                    setState((s) => ({ ...s, sample: { ...s.sample, thicknessTag } }));
                    runSimulate("immediate");
                  }}
                >
                  <option value="thin">thin</option>
                  <option value="medium">medium</option>
                  <option value="thick">thick</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600">Process</label>
                <select
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={state.sample.processTag}
                  onChange={(e) => {
                    const processTag = e.target.value as any;
                    setState((s) => ({ ...s, sample: { ...s.sample, processTag } }));
                    runSimulate("immediate");
                  }}
                >
                  <option value="as_cast">as-cast</option>
                  <option value="annealed">annealed</option>
                  <option value="aligned">aligned</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Geometry */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Geometry</div>

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Incidence angle αᵢ (deg)</div>
              <div className="text-sm text-slate-600">{round(state.geometry.alphaIDeg, 3)}</div>
            </div>
            <div className="mt-2 flex gap-2">
              {[0.08, 0.12, 0.2].map((v) => (
                <button
                  key={v}
                  className={[
                    "rounded-xl px-3 py-2 text-sm",
                    Math.abs(state.geometry.alphaIDeg - v) < 1e-6
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  ].join(" ")}
                  onClick={() => setAlpha(v)}
                >
                  {v.toFixed(2)}°
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">φ rotation (deg)</div>
              <div className="text-sm text-slate-600">{round(state.geometry.phiDeg, 1)}</div>
            </div>
            <input
              className="mt-2 w-full"
              type="range"
              min={-30}
              max={30}
              step={0.5}
              value={state.geometry.phiDeg}
              onChange={(e) => {
                const v = Number(e.target.value);
                setState((s) => ({ ...s, geometry: { ...s.geometry, phiDeg: v } }));
                // Unity should update live; simulate on release (debounced)
                runSimulate("debounced");
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-medium">Detector distance</div>
              <div className="mt-2 flex gap-2">
                {(["near", "far"] as const).map((p) => (
                  <button
                    key={p}
                    className={[
                      "flex-1 rounded-xl px-3 py-2 text-sm capitalize",
                      state.geometry.detectorDistancePreset === p
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    ].join(" ")}
                    onClick={() => {
                      setState((s) => ({ ...s, geometry: { ...s.geometry, detectorDistancePreset: p } }));
                      runSimulate("immediate");
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Tilt (deg)</div>
                <div className="text-sm text-slate-600">{round(state.geometry.detectorTiltDeg, 2)}</div>
              </div>
              <input
                className="mt-2 w-full"
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={state.geometry.detectorTiltDeg}
                onChange={(e) => {
                  const v = clamp(Number(e.target.value), -5, 5);
                  setState((s) => ({ ...s, geometry: { ...s.geometry, detectorTiltDeg: v } }));
                  runSimulate("debounced");
                }}
              />
            </div>
          </div>
        </div>

        {/* Acquisition */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Acquisition</div>

          <div className="mt-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Exposure (ms)</div>
              <div className="text-sm text-slate-600">{round(state.acquisition.exposureMs, 0)}</div>
            </div>
            <input
              className="mt-2 w-full"
              type="range"
              min={50}
              max={1200}
              step={10}
              value={state.acquisition.exposureMs}
              onChange={(e) => {
                const v = Number(e.target.value);
                setState((s) => ({ ...s, acquisition: { ...s.acquisition, exposureMs: v } }));
                runSimulate("debounced");
              }}
            />
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium">Binning</div>
            <div className="mt-2 flex gap-2">
              {([1, 2, 4] as const).map((b) => (
                <button
                  key={b}
                  className={[
                    "rounded-xl px-3 py-2 text-sm",
                    state.acquisition.binning === b ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  ].join(" ")}
                  onClick={() => {
                    setState((s) => ({ ...s, acquisition: { ...s.acquisition, binning: b } }));
                    runSimulate("immediate");
                  }}
                >
                  {b}×
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Frames: {state.acquisition.frames} (fixed for demo)
          </div>
        </div>
      </div>
    </Card>
  );
}
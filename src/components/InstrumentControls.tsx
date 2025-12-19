"use client";

import { useMemo, useState } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";
import { Button, Label } from "@/components/ui";
import { clamp } from "@/lib/utils";

export function InstrumentControls({ mode }: { mode: "A" | "C" }) {
  const priors = useInstrumentStore((s) => s.priors);
  const st = useInstrumentStore((s) => s.instrumentState);
  const applyPatch = useInstrumentStore((s) => s.applyPatch);

  const datasetPrior = useMemo(
    () => priors?.datasets.find((d) => d.id === st.dataset.id),
    [priors, st.dataset.id]
  );

  const bounds = datasetPrior?.bounds ?? {
    ai_deg: [0.05, 0.25] as [number, number],
    phi_deg: [-45, 45] as [number, number],
    detDist_mm: [100, 400] as [number, number],
    detTilt_deg: [-10, 10] as [number, number],
  };

  const [phiLocal, setPhiLocal] = useState(st.geometry.phi_deg);
  const [tiltLocal, setTiltLocal] = useState(st.geometry.detTilt_deg);

  return (
    <div className="space-y-4">
      {/* Sample */}
      <section>
        <div className="text-sm font-medium">Sample</div>

        <div className="mt-3 space-y-3">
          <ControlRow label="Thickness (nm)">
            <Stepper
              value={st.sample.thickness_nm}
              min={10}
              max={2000}
              step={10}
              onClick={(v) =>
                applyPatch({ sample: { thickness_nm: v } }, "click", "sample.thickness")
              }
            />
          </ControlRow>

          <ControlRow label="Process tag">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={st.sample.processTag === "spincoat" ? "primary" : "default"}
                onClick={() =>
                  applyPatch({ sample: { processTag: "spincoat" } }, "click", "sample.process")
                }
              >
                Spincoat
              </Button>
              <Button
                variant={st.sample.processTag === "aligned-coating" ? "primary" : "default"}
                onClick={() =>
                  applyPatch(
                    { sample: { processTag: "aligned-coating" } },
                    "click",
                    "sample.process"
                  )
                }
              >
                Aligned
              </Button>
            </div>
          </ControlRow>
        </div>
      </section>

      {/* Geometry */}
      <section>
        <div className="text-sm font-medium">Geometry</div>

        <div className="mt-3">
          <Label>αᵢ presets (deg)</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {[0.08, 0.10, 0.12, 0.16, 0.20].map((v) => (
              <Button
                key={v}
                variant={Math.abs(st.geometry.ai_deg - v) < 1e-6 ? "primary" : "default"}
                onClick={() => applyPatch({ geometry: { ai_deg: v } }, "click", "geom.ai")}
              >
                {v.toFixed(2)}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <Label>φ (deg)</Label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={bounds.phi_deg[0]}
              max={bounds.phi_deg[1]}
              step={0.5}
              value={phiLocal}
              onChange={(e) => {
                const v = Number(e.target.value);
                setPhiLocal(v);
                applyPatch({ geometry: { phi_deg: v } }, "live", "geom.phi-live");
              }}
              onPointerUp={() => {
                applyPatch({ geometry: { phi_deg: phiLocal } }, "commit", "geom.phi-commit");
              }}
              className="w-full min-w-0"
            />
            <div className="w-[72px] shrink-0 text-right font-mono text-sm">
              {phiLocal.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Label>Detector distance (mm)</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {[150, 200, 250, 300].map((v) => (
              <Button
                key={v}
                variant={st.geometry.detDist_mm === v ? "primary" : "default"}
                onClick={() => applyPatch({ geometry: { detDist_mm: v } }, "click", "geom.dist")}
              >
                {v}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <Label>Detector tilt (deg)</Label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={bounds.detTilt_deg[0]}
              max={bounds.detTilt_deg[1]}
              step={0.25}
              value={tiltLocal}
              onChange={(e) => {
                const v = Number(e.target.value);
                setTiltLocal(v);
                applyPatch({ geometry: { detTilt_deg: v } }, "live", "geom.tilt-live");
              }}
              onPointerUp={() => {
                applyPatch(
                  { geometry: { detTilt_deg: tiltLocal } },
                  "commit",
                  "geom.tilt-commit"
                );
              }}
              className="w-full min-w-0"
            />
            <div className="w-[72px] shrink-0 text-right font-mono text-sm">
              {tiltLocal.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Label>Beam center (px)</Label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Stepper
              value={st.geometry.beamCenter_x}
              min={0}
              max={512}
              step={4}
              onClick={(v) => applyPatch({ geometry: { beamCenter_x: v } }, "click", "geom.bc-x")}
            />
            <Stepper
              value={st.geometry.beamCenter_y}
              min={0}
              max={512}
              step={4}
              onClick={(v) => applyPatch({ geometry: { beamCenter_y: v } }, "click", "geom.bc-y")}
            />
          </div>
          <div className="mt-2 text-xs text-muted">
            Beam-center drag on 2D viewer can be added later; commit-on-release semantics already
            supported.
          </div>
        </div>

        <div className="mt-3">
          <Label>Beamstop</Label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              variant={st.geometry.beamstopEnabled ? "primary" : "default"}
              onClick={() =>
                applyPatch(
                  { geometry: { beamstopEnabled: !st.geometry.beamstopEnabled } },
                  "click",
                  "geom.beamstopEnabled"
                )
              }
            >
              {st.geometry.beamstopEnabled ? "Enabled" : "Disabled"}
            </Button>
            <Stepper
              value={st.geometry.beamstopRadius_px}
              min={5}
              max={80}
              step={1}
              onClick={(v) =>
                applyPatch({ geometry: { beamstopRadius_px: v } }, "click", "geom.beamstopRadius")
              }
            />
          </div>
        </div>
      </section>

      {/* Acquisition */}
      <section>
        <div className="text-sm font-medium">Acquisition</div>

        <div className="mt-3 space-y-3">
          <ControlRow label="Exposure (s)">
            <Stepper
              value={st.acquisition.exposure_s}
              min={0.1}
              max={120}
              step={0.1}
              precision={1}
              onClick={(v) => applyPatch({ acquisition: { exposure_s: v } }, "click", "acq.exposure")}
            />
          </ControlRow>

          <ControlRow label="Binning">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 4].map((b) => (
                <Button
                  key={b}
                  variant={st.acquisition.binning === b ? "primary" : "default"}
                  onClick={() =>
                    applyPatch({ acquisition: { binning: b as 1 | 2 | 4 } }, "click", "acq.binning")
                  }
                >
                  {b}×
                </Button>
              ))}
            </div>
          </ControlRow>

          <ControlRow label="Frames">
            <Stepper
              value={st.acquisition.frames}
              min={1}
              max={200}
              step={1}
              onClick={(v) => applyPatch({ acquisition: { frames: v } }, "click", "acq.frames")}
            />
          </ControlRow>
        </div>
      </section>

      {mode === "C" ? (
        <div className="rounded-xl2 border border-border bg-surface2 p-3 text-xs text-muted">
          Mode C exposes the full “instrument” layout and guardrails. Use Planner below to stage
          patches.
        </div>
      ) : null}
    </div>
  );
}

/**
 * Key change:
 * - Stack on small widths (label above control)
 * - Switch to 2 columns only when there's room
 */
function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center">
      <div className="min-w-0">
        <Label>{label}</Label>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function Stepper({
  value,
  min,
  max,
  step,
  onClick,
  precision,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onClick: (v: number) => void;
  precision?: number;
}) {
  const fmt = (v: number) => (precision != null ? v.toFixed(precision) : `${v}`);

  return (
    <div className="flex w-full items-center justify-end gap-2">
      <button
        type="button"
        className="shrink-0 rounded-xl2 border border-border bg-surface2 px-2 py-1 text-sm"
        onClick={() => onClick(clamp(Number((value - step).toFixed(6)), min, max))}
      >
        −
      </button>
      <div className="min-w-[72px] shrink-0 text-right font-mono text-sm">{fmt(value)}</div>
      <button
        type="button"
        className="shrink-0 rounded-xl2 border border-border bg-surface2 px-2 py-1 text-sm"
        onClick={() => onClick(clamp(Number((value + step).toFixed(6)), min, max))}
      >
        +
      </button>
    </div>
  );
}
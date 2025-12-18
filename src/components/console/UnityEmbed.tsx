"use client";

import { Card } from "./Card";
import { useInstrument } from "@/state/InstrumentStateContext";
import { round } from "@/lib/utils";

export function UnityEmbed() {
  const { state, status } = useInstrument();

  return (
    <Card
      title="Visual twin"
      subtitle="Unity WebGL embed (placeholder)"
      right={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
          {status === "simulating" ? "Updating…" : "Live"}
        </span>
      }
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            αᵢ={round(state.geometry.alphaIDeg, 3)}° • φ={round(state.geometry.phiDeg, 1)}° • dist=
            {state.geometry.detectorDistancePreset} • tilt={round(state.geometry.detectorTiltDeg, 2)}°
          </span>
          <span className="text-slate-500">Replace with Unity canvas</span>
        </div>

        <div className="mt-4 flex h-[340px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
          <div className="text-center">
            <div className="text-sm font-semibold">Unity WebGL Viewport</div>
            <div className="mt-1 text-xs text-slate-500">Bind SetGeometryState(state.geometry) later</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
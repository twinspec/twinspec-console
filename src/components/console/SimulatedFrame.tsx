"use client";

import { Card } from "./Card";
import { useInstrument } from "@/state/InstrumentStateContext";

export function SimulatedFrame() {
  const { lastSim, status, runSimulate } = useInstrument();

  return (
    <Card
      title="Simulated GIWAXS frame"
      subtitle="Data twin output"
      right={
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
          {status === "simulating" ? "Simulating…" : "Ready"}
        </span>
      }
    >
      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
          {lastSim?.imagePngB64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="Simulated detector frame"
              src={`data:image/png;base64,${lastSim.imagePngB64}`}
              className="h-auto w-full"
            />
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-slate-300">
              No simulated frame yet.
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500">
          While simulating, keep last valid image and show badge (instrument-like behavior).
        </div>

        {!lastSim ? (
          <button
            onClick={() => runSimulate("immediate")}
            className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
          >
            Run first simulation
          </button>
        ) : null}
      </div>
    </Card>
  );
}
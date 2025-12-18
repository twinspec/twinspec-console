import { NextResponse } from "next/server";
import { InstrumentState, SimulateResponse } from "@/lib/types";

export const runtime = "nodejs";

function makePngB64Placeholder(): string {
  // A tiny 1x1 transparent PNG to keep things valid.
  // You will replace this with real GIWAXS rendering output (512x512 PNG).
  return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y2yZp8AAAAASUVORK5CYII=";
}

function linspace(n: number, a: number, b: number) {
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(a + (b - a) * (i / (n - 1)));
  return out;
}

export async function POST(req: Request) {
  const state = (await req.json()) as InstrumentState;

  // Mock metrics that respond to knobs (so UI feels real)
  const alpha = state.geometry.alphaIDeg;
  const exp = state.acquisition.exposureMs;
  const bin = state.acquisition.binning;

  const snr = Math.max(3, (exp / 60) * (bin / 1) * (0.6 + alpha * 2.0));
  const saturation = Math.min(25, (exp / 1200) * 18 + Math.max(0, alpha - 0.2) * 40);
  const occlusion = Math.max(0, 0.6 - alpha * 2.5) * (state.geometry.detectorDistancePreset === "near" ? 1.2 : 0.8);

  const warnings: string[] = [];
  if (alpha < 0.06) warnings.push("αᵢ below typical calibrated range (demo guard).");
  if (alpha > 0.30) warnings.push("αᵢ above typical calibrated range (demo guard).");
  if (saturation > 5) warnings.push("Saturation risk: consider lowering exposure or increasing binning.");
  if (occlusion > 0.8) warnings.push("Beamstop/occlusion risk: ROI may be blocked at low αᵢ.");

  const qs = linspace(80, 0.02, 2.5);
  const iq = qs.map((q) => ({ q, intensity: 100 / (1 + (q - 0.35) ** 2 * 30) + 40 / (1 + (q - 1.7) ** 2 * 80) }));
  const chis = linspace(60, -90, 90);
  const ichi = chis.map((chi) => ({ chi, intensity: 40 + 25 * Math.cos((chi * Math.PI) / 180) ** 2 }));

  const res: SimulateResponse = {
    imagePngB64: makePngB64Placeholder(),
    iq,
    ichi,
    metrics: {
      snrTargetPeak: snr,
      saturationPct: saturation,
      occlusionPct: occlusion,
      acquisitionTimeMs: exp * state.acquisition.frames,
    },
    warnings,
    logs: [
      `simulate: dataset=${state.datasetId}`,
      `alpha_i=${alpha.toFixed(3)}°, phi=${state.geometry.phiDeg.toFixed(1)}°`,
      `exposure=${exp} ms, binning=${bin}×, dist=${state.geometry.detectorDistancePreset}`,
    ],
    provenance: {
      datasetId: state.datasetId,
      priorsId: `priors:${state.sample.materialClass}`,
      engineVersion: "mock-0.1",
      timestampIso: new Date().toISOString(),
      stateHash: "server-hash-placeholder",
    },
  };

  return NextResponse.json(res);
}
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const st = body.instrumentState ?? {};
  const constraints = body.constraints ?? {};

  // Minimal “planner”: recommend patch to increase SNR and lower saturation risk
  const exposure = Number(st?.acquisition?.exposure_s ?? 1);
  const frames = Number(st?.acquisition?.frames ?? 1);

  const wantSNR = Number(constraints?.snr ?? 10);

  // heuristic: bump frames if SNR low, reduce exposure if too high
  let nextFrames = frames;
  let nextExposure = exposure;

  if (wantSNR >= 12) nextFrames = Math.min(20, frames + 2);
  if (wantSNR <= 8) nextFrames = Math.max(1, frames);

  if (Number(constraints?.sat ?? 0.95) < 0.9) nextExposure = Math.max(0.2, exposure - 0.2);

  const recommendedPatch = {
    acquisition: { exposure_s: nextExposure, frames: nextFrames },
    geometry: { ai_deg: Math.min(0.20, Number(st?.geometry?.ai_deg ?? 0.12) + 0.02) }
  };

  const rationale = `Planner (stub): adjust acquisition for targetSNR=${wantSNR}, satLimit=${constraints?.sat}. Suggest small αᵢ increase for signal + mild acquisition tuning.`;

  return NextResponse.json({ recommendedPatch, rationale, pareto: [] });
}
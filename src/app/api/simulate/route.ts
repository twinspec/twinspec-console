import { NextResponse } from "next/server";
import { createHash } from "crypto";

export const runtime = "nodejs";

type Body = { instrumentState?: any };

async function safeJson(req: Request): Promise<Body | null> {
  // Avoid req.json() throwing on empty/truncated bodies
  const text = await req.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Body;
  } catch {
    return null;
  }
}

function randDeterministic(seed: string) {
  const h = createHash("sha256").update(seed).digest();
  let i = 0;
  return () => {
    i = (i + 1) % h.length;
    return h[i] / 255;
  };
}

function makePattern(instrumentState: any, seed: string, w = 512, h = 512) {
  const r = randDeterministic(seed);
  const pixels = new Array<number>(w * h);

  // synthetic “peaks” controlled by geometry knobs
  const ai = Number(instrumentState?.geometry?.ai_deg ?? 0.12);
  const phi = Number(instrumentState?.geometry?.phi_deg ?? 0);
  const tilt = Number(instrumentState?.geometry?.detTilt_deg ?? 0);
  const dist = Number(instrumentState?.geometry?.detDist_mm ?? 200);

  const cx = 256 + Math.round(phi * 0.7);
  const cy = 256 + Math.round(tilt * 4);

  const ringR = 80 + Math.round((200 - dist) * 0.15);
  const sigma = 10 + Math.round(ai * 40);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const rr = Math.sqrt(dx * dx + dy * dy);

      const ring = Math.exp(-((rr - ringR) * (rr - ringR)) / (2 * sigma * sigma));
      const peak = Math.exp(
        -((dx - 35) * (dx - 35) + (dy + 20) * (dy + 20)) /
          (2 * (sigma * 0.7) * (sigma * 0.7))
      );
      const noise = 0.08 * (r() - 0.5);

      let v = 0.15 + 0.75 * ring + 0.55 * peak + noise;
      v = Math.max(0, Math.min(1, v));
      pixels[y * w + x] = v;
    }
  }

  return { width: w, height: h, pixels, note: "Synthetic stub; replace with real GIWAXS simulator." };
}

function makeLinecuts(instrumentState: any, seed: string) {
  const r = randDeterministic(seed);
  const n = 200;
  const q: number[] = [];
  const inPlane: number[] = [];
  const outOfPlane: number[] = [];

  // emulate a few peaks with shift linked to ai/phi
  const ai = Number(instrumentState?.geometry?.ai_deg ?? 0.12);
  const phi = Number(instrumentState?.geometry?.phi_deg ?? 0);

  const p1 = 0.30 + ai * 0.6;
  const p2 = 0.85 + Math.abs(phi) * 0.002;

  for (let i = 0; i < n; i++) {
    const qq = 0.02 + (2.0 - 0.02) * (i / (n - 1));
    q.push(qq);

    const g1 = Math.exp(-((qq - p1) * (qq - p1)) / (2 * 0.03 * 0.03));
    const g2 = Math.exp(-((qq - p2) * (qq - p2)) / (2 * 0.05 * 0.05));
    const nz = 0.04 * (r() - 0.5);

    inPlane.push(Math.max(0, 0.2 + 0.9 * g1 + 0.6 * g2 + nz));
    outOfPlane.push(Math.max(0, 0.15 + 0.8 * g2 + 0.35 * g1 + nz));
  }

  return { q, inPlane, outOfPlane };
}

export async function POST(req: Request) {
  const body = await safeJson(req);

  // If the client aborted or sent an empty body, don't throw—respond cleanly.
  if (!body || body.instrumentState == null) {
    return NextResponse.json(
      { error: "Missing or invalid JSON body. Expected { instrumentState: {...} }" },
      { status: 400 }
    );
  }

  const instrumentState = body.instrumentState ?? {};
  const seed = JSON.stringify(instrumentState);

  const hash = createHash("sha256").update(seed).digest("hex").slice(0, 12);

  // compute warnings/metrics “instrument feel”
  const ai = Number(instrumentState?.geometry?.ai_deg ?? 0.12);
  const exposure = Number(instrumentState?.acquisition?.exposure_s ?? 1);
  const frames = Number(instrumentState?.acquisition?.frames ?? 1);
  const binning = Number(instrumentState?.acquisition?.binning ?? 1);

  const snrProxy = (exposure * frames) / Math.max(1e-9, binning);
  const satProxy = Math.min(0.999, 0.6 + 0.08 * exposure + 0.02 * frames);

  const warnings: Array<{ code: string; level: "warn" | "danger" | "info"; message: string }> = [];

  if (ai < 0.07) warnings.push({ code: "AI_LOW", level: "warn", message: "αᵢ is low; grazing condition may reduce signal and increase footprint effects." });
  if (snrProxy < 0.8) warnings.push({ code: "SNR_LOW", level: "warn", message: "SNR proxy is low; consider increasing exposure or frames." });
  if (satProxy > 0.95) warnings.push({ code: "SAT_RISK", level: "danger", message: "Saturation proxy is high; reduce exposure/frames or increase binning." });

  warnings.push({
    code: "INTERP_CAVEAT",
    level: "info",
    message: "Synthetic output reflects model priors; treat orientation/CCL inferences as conditional on calibration + mask + background assumptions."
  });

  const metrics: Record<string, number> = {
    snr_proxy: snrProxy,
    sat_proxy: satProxy,
    ai_deg: ai,
    phi_deg: Number(instrumentState?.geometry?.phi_deg ?? 0)
  };

  const logs = [
    { ts: new Date().toISOString(), level: "info" as const, message: `simulate: dataset=${instrumentState?.dataset?.id ?? "unknown"} hash=${hash}` }
  ];

  const result = {
    pattern2d: makePattern(instrumentState, seed),
    linecuts: makeLinecuts(instrumentState, seed),
    metrics,
    warnings,
    provenance: {
      simId: `sim_${hash}`,
      ts: new Date().toISOString(),
      model: "twinspec-stub-sim/v0",
      datasetId: instrumentState?.dataset?.id ?? "unknown",
      hash
    },
    logs
  };

  return NextResponse.json(result);
}
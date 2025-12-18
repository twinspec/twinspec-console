import { NextResponse } from "next/server";
import { createHash } from "crypto";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

type Body = { instrumentState?: any };

async function safeJson(req: Request): Promise<Body | null> {
  const text = await req.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as Body;
  } catch {
    return null;
  }
}

function lakehouseRoot() {
  return process.env.TWINSPEC_LAKEHOUSE_ROOT
    ? path.resolve(process.env.TWINSPEC_LAKEHOUSE_ROOT)
    : path.resolve(process.cwd(), "..", "twinspec-lakehouse");
}

function resolveFromLakehouse(rootAbs: string, relPath: string) {
  // Normalize slashes and strip any leading slash so path.resolve doesn't jump roots.
  const cleaned = String(relPath).replace(/\\/g, "/").replace(/^\/+/, "");
  return path.resolve(rootAbs, cleaned);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function toNumber(x: any, fallback = 0) {
  const v = Number(x);
  return Number.isFinite(v) ? v : fallback;
}

function quantile(sorted: number[], q: number) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const a = sorted[base] ?? sorted[sorted.length - 1];
  const b = sorted[base + 1] ?? a;
  return a + rest * (b - a);
}

async function readMaybeJSON(absPath: string) {
  try {
    const txt = await fs.readFile(absPath, "utf-8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

type CorePoint = { qz: number; qxy: number; intensity: number };

async function loadCoreCSV(absPath: string): Promise<CorePoint[]> {
  const text = await fs.readFile(absPath, "utf-8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((s) => s.trim());
  const iQz = header.indexOf("qz");
  const iQxy = header.indexOf("qxy");
  const iI = header.indexOf("intensity");
  if (iQz < 0 || iQxy < 0 || iI < 0) {
    throw new Error(`core csv missing required headers (need qz,qxy,intensity): ${absPath}`);
  }

  const pts: CorePoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    const qz = toNumber(parts[iQz], NaN);
    const qxy = toNumber(parts[iQxy], NaN);
    const intensity = toNumber(parts[iI], NaN);
    if (!Number.isFinite(qz) || !Number.isFinite(qxy) || !Number.isFinite(intensity)) continue;
    pts.push({ qz, qxy, intensity });
  }
  return pts;
}

function binToGrid(
  pts: CorePoint[],
  w: number,
  h: number,
  qzMin: number,
  qzMax: number,
  qxyMin: number,
  qxyMax: number
) {
  const sum = new Float64Array(w * h);
  const cnt = new Uint32Array(w * h);

  const dz = (qzMax - qzMin) / (h - 1);
  const dxy = (qxyMax - qxyMin) / (w - 1);

  for (const p of pts) {
    const x = Math.round((p.qxy - qxyMin) / dxy);
    const y = Math.round((p.qz - qzMin) / dz);
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const idx = y * w + x;
    sum[idx] += p.intensity;
    cnt[idx] += 1;
  }

  const raw = new Float64Array(w * h);
  for (let i = 0; i < raw.length; i++) raw[i] = cnt[i] ? sum[i] / cnt[i] : 0;

  return { raw, cnt };
}

function normalizeGrid(raw: Float64Array, clipLoQ = 0.01, clipHiQ = 0.99) {
  const values: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    const v = raw[i];
    if (v > 0 && Number.isFinite(v)) values.push(v);
  }
  values.sort((a, b) => a - b);

  const lo = values.length ? quantile(values, clipLoQ) : 0;
  const hi = values.length ? quantile(values, clipHiQ) : 1;
  const denom = Math.max(1e-12, hi - lo);

  const pixels: number[] = new Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    const v = raw[i];
    const n = (v - lo) / denom;
    pixels[i] = clamp(n, 0, 1);
  }

  return { pixels, lo, hi };
}

export async function POST(req: Request) {
  const body = await safeJson(req);

  if (!body || body.instrumentState == null) {
    return NextResponse.json(
      { error: "Missing or invalid JSON body. Expected { instrumentState: {...} }" },
      { status: 400 }
    );
  }

  const instrumentState = body.instrumentState ?? {};
  const seed = JSON.stringify(instrumentState);
  const hash = createHash("sha256").update(seed).digest("hex").slice(0, 12);

  const datasetId = instrumentState?.dataset?.id ?? "unknown";
  const binding = instrumentState?.dataset?.lakehouse ?? null;

  const warnings: Array<{ code: string; level: "warn" | "danger" | "info"; message: string }> = [];
  const logs: Array<{ ts: string; level: "info" | "warn" | "error"; message: string }> = [
    { ts: new Date().toISOString(), level: "info", message: `simulate: dataset=${datasetId} hash=${hash}` }
  ];

  // Defaults (your representative JSON confirms 0..2, 1/nm)
  let qzMin = 0, qzMax = 2, qxyMin = 0, qxyMax = 2;
  let qUnits = "1/nm";

  let charMeta: any = null;

  try {
    const root = lakehouseRoot();

    if (!binding?.characterization_json_path && !binding?.giwaxs2d_core_path) {
      warnings.push({
        code: "NO_LAKEHOUSE_BINDING",
        level: "warn",
        message: "Dataset has no lakehouse binding; cannot resolve characterization JSON or core CSV."
      });

      return NextResponse.json({
        pattern2d: { width: 512, height: 512, pixels: new Array(512 * 512).fill(0), note: "No lakehouse binding." },
        linecuts: { q: [], inPlane: [], outOfPlane: [] },
        metrics: { ai_deg: toNumber(instrumentState?.geometry?.ai_deg, 0.12) },
        warnings,
        provenance: { simId: `sim_${hash}`, ts: new Date().toISOString(), model: "twinspec-data-twin/v0", datasetId, hash },
        logs
      });
    }

    // 1) Load characterization JSON if we have it (authoritative for q_mapping + digitized CSV path)
    const charAbs = binding.characterization_json_path
      ? resolveFromLakehouse(root, binding.characterization_json_path)
      : null;

    if (charAbs) {
      charMeta = await readMaybeJSON(charAbs);
      const qm = charMeta?.q_mapping;
      if (qm) {
        qzMin = toNumber(qm.qz_min, qzMin);
        qzMax = toNumber(qm.qz_max, qzMax);
        qxyMin = toNumber(qm.qxy_min, qxyMin);
        qxyMax = toNumber(qm.qxy_max, qxyMax);
        qUnits = String(qm.units || qUnits);
      }
    }

    // 2) Resolve core CSV path
    const coreRelFromChar =
      charMeta?.digitization?.outputs?.digitized_2d_csv_path
        ? String(charMeta.digitization.outputs.digitized_2d_csv_path)
        : null;

    const coreRelFallback =
      binding?.giwaxs2d_core_path ? String(binding.giwaxs2d_core_path) : null;

    const coreRel = coreRelFromChar ?? coreRelFallback;

    if (!coreRel) {
      throw new Error(
        "Could not resolve GIWAXS core CSV path. Missing charMeta.digitization.outputs.digitized_2d_csv_path and binding.giwaxs2d_core_path."
      );
    }

    const coreAbs = resolveFromLakehouse(root, coreRel);

    // Fail early with a clear path if the file doesn't exist
    try {
      await fs.access(coreAbs);
    } catch {
      throw new Error(
        `ENOENT: no such file or directory, open '${coreAbs}'. Resolved from ${
          coreRelFromChar ? "characterization JSON digitized_2d_csv_path" : "dataset binding giwaxs2d_core_path"
        }.`
      );
    }

    const pts = await loadCoreCSV(coreAbs);

    const W = 512;
    const H = 512;

    const { raw, cnt } = binToGrid(pts, W, H, qzMin, qzMax, qxyMin, qxyMax);
    const { pixels, lo, hi } = normalizeGrid(raw, 0.01, 0.99);

    const nonzeroBins = (() => {
      let nz = 0;
      for (let i = 0; i < cnt.length; i++) if (cnt[i] > 0) nz++;
      return nz;
    })();

    const ai = toNumber(instrumentState?.geometry?.ai_deg, 0.12);
    const exposure = toNumber(instrumentState?.acquisition?.exposure_s, 1);
    const frames = toNumber(instrumentState?.acquisition?.frames, 1);
    const binning = toNumber(instrumentState?.acquisition?.binning, 1);

    const snrProxy = (exposure * frames) / Math.max(1e-9, binning);
    const satProxy = Math.min(0.999, 0.6 + 0.08 * exposure + 0.02 * frames);

    if (ai < 0.07) warnings.push({ code: "AI_LOW", level: "warn", message: "αᵢ is low; grazing condition may reduce signal and increase footprint effects." });
    if (snrProxy < 0.8) warnings.push({ code: "SNR_LOW", level: "warn", message: "SNR proxy is low; consider increasing exposure or frames." });
    if (satProxy > 0.95) warnings.push({ code: "SAT_RISK", level: "danger", message: "Saturation proxy is high; reduce exposure/frames or increase binning." });

    warnings.push({
      code: "DIGITIZATION_CAVEAT",
      level: "info",
      message: "Pattern is digitized from literature figures (not raw detector counts). Treat intensity-derived comparisons as qualitative unless calibrated."
    });

    const inst = charMeta?.instrument ?? null;
    if (charMeta?.masks_and_artifacts?.missing_wedge_present) {
      warnings.push({
        code: "MISSING_WEDGE",
        level: "info",
        message: "Missing wedge present; some azimuthal regions are not observed in the source figure."
      });
    }

    const metrics: Record<string, number> = {
      ai_deg: ai,
      snr_proxy: snrProxy,
      sat_proxy: satProxy,
      qz_min: qzMin,
      qz_max: qzMax,
      qxy_min: qxyMin,
      qxy_max: qxyMax,
      nonzero_bins: nonzeroBins,
      clip_lo: lo,
      clip_hi: hi
    };

    const linecuts = { q: [], inPlane: [], outOfPlane: [] };

    const provenanceExtra: Record<string, any> = {
      q_units: qUnits,
      paper_id: binding.paper_id ?? "",
      reference_doi: binding.reference_doi ?? "",
      anneal_temp_C: binding.anneal_temp_C ?? null,
      solvent: binding.solvent ?? "",
      facility: inst?.facility ?? "",
      beam_energy_keV: inst?.beam_energy_keV ?? null,
      wavelength_A: inst?.wavelength_A ?? null,
      incident_angle_deg_nominal: inst?.incident_angle_deg ?? null,
      characterization_id: charMeta?.characterization_id ?? "",
      core_points: pts.length,
      core_csv_abs: coreAbs,
      core_csv_rel: coreRel,
      core_path_source: coreRelFromChar ? "characterization.digitization.outputs.digitized_2d_csv_path" : "dataset.lakehouse.giwaxs2d_core_path"
    };

    const result = {
      pattern2d: {
        width: W,
        height: H,
        pixels,
        note: `Data twin: binned from lakehouse core (qz/qxy ${qzMin}–${qzMax}, ${qxyMin}–${qxyMax} ${qUnits}).`
      },
      linecuts,
      metrics,
      warnings,
      provenance: {
        simId: `sim_${hash}`,
        ts: new Date().toISOString(),
        model: "twinspec-data-twin/v0",
        datasetId,
        hash,
        extra: provenanceExtra
      },
      logs
    };

    return NextResponse.json(result);
  } catch (e: any) {
    logs.push({ ts: new Date().toISOString(), level: "error", message: `simulate error: ${e?.message ?? "unknown"}` });
    return NextResponse.json(
      {
        error: e?.message ?? "simulate error",
        warnings: [{ code: "SIM_ERROR", level: "danger", message: "Simulation failed; check lakehouse paths and CSV schema." }],
        logs
      },
      { status: 500 }
    );
  }
}
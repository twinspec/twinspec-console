import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";

type ExperimentRow = Record<string, string>;

function lakehouseRoot() {
  return process.env.TWINSPEC_LAKEHOUSE_ROOT
    ? path.resolve(process.env.TWINSPEC_LAKEHOUSE_ROOT)
    : path.resolve(process.cwd(), "..", "twinspec-lakehouse");
}

function parseCSV(text: string): ExperimentRow[] {
  // Minimal CSV parser: supports quoted fields with commas and double quotes.
  // Sufficient for your current experiments.csv structure.
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = splitCSVLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = splitCSVLine(line);
    const row: ExperimentRow = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = (cols[i] ?? "").trim();
    return row;
  });
}

function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // handle escaped quote
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }
  out.push(cur);
  return out;
}

function toNumber(x: string, fallback = 0) {
  const v = Number(String(x ?? "").trim());
  return Number.isFinite(v) ? v : fallback;
}

function safeJsonParse<T>(s: string, fallback: T): T {
  try {
    if (!s || !String(s).trim()) return fallback;
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export async function GET() {
  const root = lakehouseRoot();
  const experimentsPath = path.join(root, "curated", "experiments", "experiments.csv");

  try {
    const csv = await fs.readFile(experimentsPath, "utf-8");
    const rows = parseCSV(csv);

    // Keep only GIWAXS experiments with a 2D core path
    const usable = rows
      .filter((r) => (r["characterization_type"] || "").toUpperCase() === "GIWAXS")
      .filter((r) => String(r["giwaxs_2d_path"] || "").trim().length > 0);

    // Sort by anneal temp if present, otherwise stable by id
    usable.sort((a, b) => {
      const ta = toNumber(a["anneal_temp_C"], Number.POSITIVE_INFINITY);
      const tb = toNumber(b["anneal_temp_C"], Number.POSITIVE_INFINITY);
      if (ta !== tb) return ta - tb;
      return String(a["experiment_id"]).localeCompare(String(b["experiment_id"]));
    });

    const datasets = usable.map((r) => {
      const experimentId = r["experiment_id"];
      const materialId = r["material_id"] || "unknown";
      const annealTemp = r["anneal_temp_C"] || "";

      const labelBits = [
        materialId,
        r["solvent"] ? `(${r["solvent"]})` : "",
        annealTemp ? `${annealTemp}C` : "",
        r["casting_method"] ? r["casting_method"] : "",
      ].filter(Boolean);

      // Note: experiments.csv uses backslashes in paths in your paste.
      // Normalize to platform path separators.
      const giwaxs2dRel = String(r["giwaxs_2d_path"]).replace(/\\/g, "/");
      const charJsonRel = String(r["characterization_json_path"] || "").replace(/\\/g, "/");
      const expJsonRel = String(r["experiment_json_path"] || "").replace(/\\/g, "/");
      const methodJsonRel = String(r["method_json_path"] || "").replace(/\\/g, "/");

      const castingParams = safeJsonParse<Record<string, any>>(r["casting_parameters_json"], {});
      const peaks = safeJsonParse<Record<string, number>>(r["peaks_json"], {});
      const dspacing = safeJsonParse<Record<string, number>>(r["dspacing_json"], {});

      const thickness = toNumber(r["film_thickness_nominal_nm"], 100);

      return {
        id: experimentId, // datasetId == experimentId (simplest + stable)
        label: labelBits.join(" "),
        materialClass: "conjugated-polymer", // you can later map this from material tables
        tags: [
          "GIWAXS",
          r["orientation_label"] ? r["orientation_label"] : "",
          r["reference_type"] ? r["reference_type"] : "",
        ].filter(Boolean),

        // New: data-twin binding fields
        lakehouse: {
          giwaxs2d_core_path: giwaxs2dRel,
          characterization_json_path: charJsonRel,
          experiment_json_path: expJsonRel,
          method_json_path: methodJsonRel,
          paper_id: r["paper_id"] || "",
          reference_doi: r["reference_doi"] || "",
          anneal_temp_C: annealTemp ? toNumber(annealTemp, 0) : null,
          solvent: r["solvent"] || "",
          thickness_nominal_nm: thickness,
          peaks_json: peaks,
          dspacing_json: dspacing,
          casting_parameters_json: castingParams
        },

        // Defaults: seed instrument controls from experiment (and your current console schema)
        defaults: {
          geometry: {
            ai_deg: 0.12,
            phi_deg: 0,
            detDist_mm: 200,
            detTilt_deg: 0,
            beamCenter_x: 256,
            beamCenter_y: 256
          },
          acquisition: { exposure_s: 1.0, binning: 1, frames: 1 },
          sample: {
            thickness_nm: thickness,
            processTag: r["casting_method"] || "spincoat"
          }
        },

        // Bounds: conservative “demo-safe” ranges
        bounds: {
          ai_deg: [0.05, 0.25],
          phi_deg: [-60, 60],
          detDist_mm: [120, 420],
          detTilt_deg: [-12, 12]
        }
      };
    });

    const priors = {
      defaultDatasetId: datasets[0]?.id ?? "unknown",
      datasets
    };

    return NextResponse.json(priors);
  } catch (e: any) {
    // Fallback: your original hardcoded priors if lakehouse not available
    const priors = {
      defaultDatasetId: "ds_pndi2odt2_001",
      datasets: [
        {
          id: "ds_pndi2odt2_001",
          label: "P(NDI2OD-T2) aligned series",
          materialClass: "conjugated-polymer",
          tags: ["GIWAXS", "aligned", "solution-processed"],
          lakehouse: null,
          defaults: {
            geometry: { ai_deg: 0.12, phi_deg: 0, detDist_mm: 200, detTilt_deg: 0, beamCenter_x: 256, beamCenter_y: 256 },
            acquisition: { exposure_s: 1.0, binning: 1, frames: 1 },
            sample: { thickness_nm: 80, processTag: "aligned-coating" }
          },
          bounds: { ai_deg: [0.05, 0.25], phi_deg: [-45, 45], detDist_mm: [120, 380], detTilt_deg: [-8, 8] }
        }
      ]
    };

    return NextResponse.json(priors, {
      status: 200,
      headers: { "x-twinspec-priors-fallback": "1", "x-twinspec-priors-error": String(e?.message ?? "unknown") }
    });
  }
}
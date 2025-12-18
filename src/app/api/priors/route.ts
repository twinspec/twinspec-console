import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  // Hackathon priors: minimal but sufficient
  const priors = {
    defaultDatasetId: "ds_pndi2odt2_001",
    datasets: [
      {
        id: "ds_pndi2odt2_001",
        label: "P(NDI2OD-T2) aligned series",
        materialClass: "conjugated-polymer",
        tags: ["GIWAXS", "aligned", "solution-processed"],
        defaults: {
          geometry: { ai_deg: 0.12, phi_deg: 0, detDist_mm: 200, detTilt_deg: 0, beamCenter_x: 256, beamCenter_y: 256 },
          acquisition: { exposure_s: 1.0, binning: 1, frames: 1 },
          sample: { thickness_nm: 80, processTag: "aligned-coating" }
        },
        bounds: { ai_deg: [0.05, 0.25], phi_deg: [-45, 45], detDist_mm: [120, 380], detTilt_deg: [-8, 8] }
      },
      {
        id: "ds_p3ht_001",
        label: "P3HT reference",
        materialClass: "conjugated-polymer",
        tags: ["GIWAXS", "reference"],
        defaults: {
          geometry: { ai_deg: 0.10, phi_deg: 0, detDist_mm: 220, detTilt_deg: 0, beamCenter_x: 256, beamCenter_y: 256 },
          acquisition: { exposure_s: 0.8, binning: 2, frames: 2 },
          sample: { thickness_nm: 120, processTag: "spincoat" }
        },
        bounds: { ai_deg: [0.05, 0.25], phi_deg: [-60, 60], detDist_mm: [120, 420], detTilt_deg: [-10, 10] }
      },
      {
        id: "ds_generic_oxide_001",
        label: "Metal oxide thin film",
        materialClass: "inorganic-oxide",
        tags: ["GIWAXS", "polycrystalline"],
        defaults: {
          geometry: { ai_deg: 0.14, phi_deg: 0, detDist_mm: 180, detTilt_deg: 1.5, beamCenter_x: 256, beamCenter_y: 256 },
          acquisition: { exposure_s: 1.5, binning: 1, frames: 1 },
          sample: { thickness_nm: 40, processTag: "sputter" }
        },
        bounds: { ai_deg: [0.05, 0.30], phi_deg: [-90, 90], detDist_mm: [100, 350], detTilt_deg: [-12, 12] }
      }
    ]
  };

  return NextResponse.json(priors);
}
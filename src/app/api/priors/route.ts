import { NextResponse } from "next/server";
import { PriorsResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const priors: PriorsResponse = {
    classes: [
      {
        id: "polymer_face_on",
        label: "Polymer (face-on)",
        defaultTargetPeakFamily: "pi_pi",
        peakSummary: [
          { family: "100", q: 0.30 },
          { family: "010", q: 1.70 },
        ],
        limits: {
          alphaIDegMin: 0.06,
          alphaIDegMax: 0.30,
          detectorTiltAbsMaxDeg: 1.0,
          exposureMsMin: 50,
          exposureMsMax: 1200,
        },
      },
      {
        id: "polymer_edge_on",
        label: "Polymer (edge-on)",
        defaultTargetPeakFamily: "lamellar",
        peakSummary: [
          { family: "100", q: 0.28 },
          { family: "010", q: 1.75 },
        ],
        limits: {
          alphaIDegMin: 0.06,
          alphaIDegMax: 0.30,
          detectorTiltAbsMaxDeg: 1.0,
          exposureMsMin: 50,
          exposureMsMax: 1200,
        },
      },
      {
        id: "amorphous",
        label: "Amorphous halo",
        defaultTargetPeakFamily: "backbone",
        peakSummary: [{ family: "halo", q: 1.30 }],
        limits: {
          alphaIDegMin: 0.08,
          alphaIDegMax: 0.40,
          detectorTiltAbsMaxDeg: 1.5,
          exposureMsMin: 50,
          exposureMsMax: 1500,
        },
      },
      {
        id: "oxide_textured",
        label: "Metal oxide (textured)",
        defaultTargetPeakFamily: "backbone",
        peakSummary: [
          { family: "111", q: 2.10 },
          { family: "200", q: 2.45 },
        ],
        limits: {
          alphaIDegMin: 0.05,
          alphaIDegMax: 0.25,
          detectorTiltAbsMaxDeg: 1.0,
          exposureMsMin: 20,
          exposureMsMax: 800,
        },
      },
    ],
    datasets: [
      { id: "ds_polymer_a", label: "Polymer A (example)", materialClass: "polymer_face_on" },
      { id: "ds_polymer_b", label: "Polymer B (example)", materialClass: "polymer_edge_on" },
      { id: "ds_amorphous_c", label: "Amorphous C (example)", materialClass: "amorphous" },
      { id: "ds_oxide_d", label: "Oxide D (example)", materialClass: "oxide_textured" },
    ],
  };

  return NextResponse.json(priors);
}
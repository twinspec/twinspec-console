export type MaterialClassId =
  | "polymer_face_on"
  | "polymer_edge_on"
  | "amorphous"
  | "oxide_textured";

export type DetectorDistancePreset = "near" | "far";

export type InstrumentState = {
  datasetId: string;
  sample: {
    materialClass: MaterialClassId;
    thicknessTag: "thin" | "medium" | "thick";
    processTag: "as_cast" | "annealed" | "aligned";
  };
  geometry: {
    alphaIDeg: number; // incidence angle
    phiDeg: number; // azimuth rotation
    detectorDistancePreset: DetectorDistancePreset;
    detectorTiltDeg: number;
    beamCenter01: { x: number; y: number }; // normalized 0..1
    beamstopRadiusPx: number;
    beamstopOffsetPx: { dx: number; dy: number };
  };
  acquisition: {
    exposureMs: number;
    binning: 1 | 2 | 4;
    frames: number;
  };
};

export type PriorsClass = {
  id: MaterialClassId;
  label: string;
  defaultTargetPeakFamily: "lamellar" | "pi_pi" | "backbone";
  peakSummary: Array<{ family: string; q: number }>;
  limits: {
    alphaIDegMin: number;
    alphaIDegMax: number;
    detectorTiltAbsMaxDeg: number;
    exposureMsMin: number;
    exposureMsMax: number;
  };
};

export type PriorsResponse = {
  classes: PriorsClass[];
  datasets: Array<{ id: string; label: string; materialClass: MaterialClassId }>;
};

export type SimulateResponse = {
  imagePngB64: string;
  iq: Array<{ q: number; intensity: number }>;
  ichi: Array<{ chi: number; intensity: number }>;
  metrics: {
    snrTargetPeak: number;
    saturationPct: number;
    occlusionPct: number;
    acquisitionTimeMs: number;
  };
  warnings: string[];
  logs: string[];
  provenance: {
    datasetId: string;
    priorsId: string;
    engineVersion: string;
    timestampIso: string;
    stateHash: string;
  };
};
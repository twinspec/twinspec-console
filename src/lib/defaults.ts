import { InstrumentState } from "./types";

export const DEFAULT_DATASET_ID = "ds_polymer_a";

export const defaultInstrumentState = (datasetId = DEFAULT_DATASET_ID): InstrumentState => ({
  datasetId,
  sample: {
    materialClass: "polymer_face_on",
    thicknessTag: "thin",
    processTag: "as_cast",
  },
  geometry: {
    alphaIDeg: 0.12,
    phiDeg: 0,
    detectorDistancePreset: "near",
    detectorTiltDeg: 0,
    beamCenter01: { x: 0.5, y: 0.52 },
    beamstopRadiusPx: 18,
    beamstopOffsetPx: { dx: 0, dy: 0 },
  },
  acquisition: {
    exposureMs: 220,
    binning: 1,
    frames: 1,
  },
});
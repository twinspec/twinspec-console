"use client";

import { create } from "zustand";
import { nowISO } from "@/lib/utils";

export type InteractionIntent = "live" | "commit" | "click";

export type DatasetPrior = {
  id: string;
  label: string;
  materialClass: string;
  tags: string[];
  defaults: {
    geometry: { ai_deg: number; phi_deg: number; detDist_mm: number; detTilt_deg: number; beamCenter_x: number; beamCenter_y: number };
    acquisition: { exposure_s: number; binning: 1 | 2 | 4; frames: number };
    sample: { thickness_nm: number; processTag: string };
  };
  bounds: {
    ai_deg: [number, number];
    phi_deg: [number, number];
    detDist_mm: [number, number];
    detTilt_deg: [number, number];
  };
};

export type PriorsResponse = {
  defaultDatasetId: string;
  datasets: DatasetPrior[];
};

export type SimResult = {
  pattern2d: { width: number; height: number; pixels: number[]; note?: string };
  linecuts: {
    q: number[];
    inPlane: number[];
    outOfPlane: number[];
  };
  metrics: Record<string, number>;
  warnings: Array<{ code: string; level: "warn" | "danger" | "info"; message: string }>;
  provenance: { simId: string; ts: string; model: string; datasetId: string; hash: string };
  logs: Array<{ ts: string; level: "info" | "warn" | "error"; message: string }>;
};

export type InstrumentState = {
  dataset: {
    id: string;
    label: string;
    materialClass: string;
    tags: string[];
  };
  sample: {
    thickness_nm: number;
    processTag: string;
  };
  geometry: {
    ai_deg: number;
    phi_deg: number;
    detDist_mm: number;
    detTilt_deg: number;
    beamCenter_x: number;
    beamCenter_y: number;
    beamstopEnabled: boolean;
    beamstopRadius_px: number;
  };
  acquisition: {
    exposure_s: number;
    binning: 1 | 2 | 4;
    frames: number;
  };
  planner: {
    targetPeakFamily: string;
    targetSNR: number;
    maxSaturation: number;
  };
  derived: {
    lastSimOkAt?: string;
  };
};

type LastInteraction = { intent: InteractionIntent; at: number; source: string };

type PlannerProposal = {
  patch: Partial<InstrumentState>;
  rationale: string;
  createdAt: string;
};

type Store = {
  priors: PriorsResponse | null;
  priorsStatus: "idle" | "loading" | "ready" | "error";
  priorsError?: string;

  instrumentState: InstrumentState;

  lastInteraction: LastInteraction | null;
  setLastInteraction: (x: { intent: InteractionIntent; source: string }) => void;

  simStatus: "idle" | "simulating" | "ok" | "error";
  simError?: string;
  lastSimResult: SimResult | null;

  unityStatus: { lastPushedAt?: string; lastHash?: string };

  plannerProposal: PlannerProposal | null;

  // actions
  setPriors: (priors: PriorsResponse) => void;
  setPriorsStatus: (s: Store["priorsStatus"], err?: string) => void;

  setDataset: (datasetId: string) => void;
  applyPatch: (patch: Partial<InstrumentState>, intent?: InteractionIntent, source?: string) => void;

  persistCurrentDataset: () => void;
  hydrateDataset: (datasetId: string) => void;

  setSimStatus: (s: Store["simStatus"], err?: string) => void;
  setSimResult: (r: SimResult) => void;
  appendLogs: (items: SimResult["logs"]) => void;
  clearError: () => void;

  setUnityStatus: (x: Store["unityStatus"]) => void;

  setPlannerProposal: (p: PlannerProposal | null) => void;
  acceptPlannerProposal: () => void;

  applyChemicalLens: (identifier: string) => void;
};

function storageKey(datasetId: string) {
  return `twinspec:instrumentState:${datasetId}`;
}

function defaultState(): InstrumentState {
  return {
    dataset: { id: "unknown", label: "Unknown", materialClass: "unknown", tags: [] },
    sample: { thickness_nm: 100, processTag: "spincoat" },
    geometry: {
      ai_deg: 0.12,
      phi_deg: 0,
      detDist_mm: 200,
      detTilt_deg: 0,
      beamCenter_x: 256,
      beamCenter_y: 256,
      beamstopEnabled: true,
      beamstopRadius_px: 18
    },
    acquisition: { exposure_s: 1.0, binning: 1, frames: 1 },
    planner: { targetPeakFamily: "010", targetSNR: 10, maxSaturation: 0.95 },
    derived: {}
  };
}

function buildDefaultForDataset(priors: PriorsResponse, datasetId: string): InstrumentState {
  const d = priors.datasets.find((x) => x.id === datasetId);
  if (!d) return defaultState();

  return {
    dataset: { id: d.id, label: d.label, materialClass: d.materialClass, tags: d.tags },
    sample: { ...d.defaults.sample },
    geometry: {
      ...d.defaults.geometry,
      beamstopEnabled: true,
      beamstopRadius_px: 18
    },
    acquisition: { ...d.defaults.acquisition },
    planner: { targetPeakFamily: "010", targetSNR: 10, maxSaturation: 0.95 },
    derived: {}
  };
}

export const useInstrumentStore = create<Store>((set, get) => ({
  priors: null,
  priorsStatus: "idle",

  instrumentState: defaultState(),

  lastInteraction: null,
  setLastInteraction: ({ intent, source }) => set({ lastInteraction: { intent, at: Date.now(), source } }),

  simStatus: "idle",
  lastSimResult: null,

  unityStatus: {},

  plannerProposal: null,

  setPriors: (priors) => {
    set({ priors });
    // if we haven't got a real dataset yet, initialize to default
    const currentId = get().instrumentState.dataset.id;
    if (currentId === "unknown") {
      get().setDataset(priors.defaultDatasetId);
    }
  },

  setPriorsStatus: (s, err) => set({ priorsStatus: s, priorsError: err }),

  setDataset: (datasetId) => {
    const priors = get().priors;
    if (!priors) return;

    // persist current
    get().persistCurrentDataset();

    // hydrate new dataset (persisted or default)
    get().hydrateDataset(datasetId);

    // mark interaction as commit (dataset switch should simulate)
    get().setLastInteraction({ intent: "commit", source: "dataset" });
  },

  applyPatch: (patch, intent = "commit", source = "patch") => {
    set((s) => ({
      instrumentState: deepMerge(s.instrumentState, patch),
      lastInteraction: { intent, at: Date.now(), source }
    }));
    // persist after state mutation (dataset-aware)
    get().persistCurrentDataset();
  },

  persistCurrentDataset: () => {
    if (typeof window === "undefined") return;
    const st = get().instrumentState;
    if (!st.dataset.id || st.dataset.id === "unknown") return;
    try {
      window.localStorage.setItem(storageKey(st.dataset.id), JSON.stringify(st));
    } catch {
      // ignore
    }
  },

  hydrateDataset: (datasetId) => {
    if (typeof window === "undefined") return;
    const priors = get().priors;
    if (!priors) return;

    try {
      const raw = window.localStorage.getItem(storageKey(datasetId));
      if (raw) {
        const parsed = JSON.parse(raw) as InstrumentState;
        set({ instrumentState: parsed });
        return;
      }
    } catch {
      // fall through to defaults
    }

    const next = buildDefaultForDataset(priors, datasetId);
    set({ instrumentState: next });
    try {
      window.localStorage.setItem(storageKey(datasetId), JSON.stringify(next));
    } catch {
      // ignore
    }
  },

  setSimStatus: (s, err) => set({ simStatus: s, simError: err }),

  setSimResult: (r) =>
    set((s) => ({
      lastSimResult: r,
      simStatus: "ok",
      simError: undefined,
      instrumentState: {
        ...s.instrumentState,
        derived: { ...s.instrumentState.derived, lastSimOkAt: nowISO() }
      }
    })),

  appendLogs: (items) =>
    set((s) => {
      if (!s.lastSimResult) return {};
      return { lastSimResult: { ...s.lastSimResult, logs: [...s.lastSimResult.logs, ...items] } };
    }),

  clearError: () => set({ simError: undefined, priorsError: undefined }),

  setUnityStatus: (x) => set((s) => ({ unityStatus: { ...s.unityStatus, ...x } })),

  setPlannerProposal: (p) => set({ plannerProposal: p }),

  acceptPlannerProposal: () => {
    const prop = get().plannerProposal;
    if (!prop) return;

    // merge patch into state, and force one simulate
    get().applyPatch(prop.patch, "click", "planner-accept");
    set({ plannerProposal: null });
  },

  applyChemicalLens: (identifier) => {
    // Minimal hackathon mapping: treat certain substrings as “classes”
    const lower = identifier.toLowerCase();
    const inferred =
      lower.includes("ndi") || lower.includes("t2") || lower.includes("donor") ? "conjugated-polymer" : "generic-organic";

    get().applyPatch(
      {
        sample: { processTag: inferred === "conjugated-polymer" ? "aligned-coating" : "spincoat" }
      },
      "click",
      "chemical-lens"
    );
  }
}));

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function deepMerge<T>(base: T, patch: Partial<T>): T {
  const out: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };
  for (const [k, v] of Object.entries(patch as any)) {
    if (isObject(v) && isObject((out as any)[k])) {
      (out as any)[k] = deepMerge((out as any)[k], v as any);
    } else {
      (out as any)[k] = v;
    }
  }
  return out as T;
}
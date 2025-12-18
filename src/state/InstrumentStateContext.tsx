"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { InstrumentState, PriorsResponse, SimulateResponse } from "@/lib/types";
import { defaultInstrumentState } from "@/lib/defaults";
import { fetchPriors, simulate } from "@/lib/api";
import { loadState, saveState } from "@/lib/storage";
import { sha256Hex } from "@/lib/utils";

type ConsoleStatus = "idle" | "simulating" | "error" | "ready";

type Ctx = {
  priors: PriorsResponse | null;
  state: InstrumentState;
  setState: React.Dispatch<React.SetStateAction<InstrumentState>>;
  status: ConsoleStatus;
  lastSim: SimulateResponse | null;
  logs: string[];
  warnings: string[];
  recommendedPatch: Partial<InstrumentState> | null;
  setRecommendedPatch: (patch: Partial<InstrumentState> | null) => void;

  // actions
  setDataset: (datasetId: string) => void;
  runSimulate: (mode?: "immediate" | "debounced") => void;
  resetState: () => void;
};

const InstrumentCtx = createContext<Ctx | null>(null);

function applyPatch<T extends object>(base: T, patch: Partial<T>): T {
  // shallow merge with nested objects merged where present
  const out: any = { ...(base as any) };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = { ...(out[k] ?? {}), ...(v as any) };
    } else {
      out[k] = v;
    }
  }
  return out as T;
}

export function InstrumentStateProvider({ children }: { children: React.ReactNode }) {
  const [priors, setPriors] = useState<PriorsResponse | null>(null);
  const [state, setState] = useState<InstrumentState>(() => defaultInstrumentState());
  const [status, setStatus] = useState<ConsoleStatus>("idle");
  const [lastSim, setLastSim] = useState<SimulateResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [recommendedPatch, setRecommendedPatch] = useState<Partial<InstrumentState> | null>(null);

  const debounceTimer = useRef<number | null>(null);

  // Load priors once
  useEffect(() => {
    let alive = true;
    fetchPriors()
      .then((p) => {
        if (!alive) return;
        setPriors(p);

        // If stored state exists for default dataset, restore it
        const stored = loadState(state.datasetId);
        if (stored) setState(stored);
      })
      .catch(() => {
        // keep priors null
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);

  const setDataset = (datasetId: string) => {
    const stored = loadState(datasetId);
    if (stored) {
      setState(stored);
    } else {
      setState(defaultInstrumentState(datasetId));
    }
    setRecommendedPatch(null);
    setLastSim(null);
    setWarnings([]);
    setLogs((prev) => [`Dataset switched → ${datasetId}`, ...prev].slice(0, 60));
    // kick a simulation on dataset switch
    setTimeout(() => runSimulate("immediate"), 0);
  };

  const resetState = () => {
    setState(defaultInstrumentState(state.datasetId));
    setRecommendedPatch(null);
    setLogs((prev) => [`State reset for dataset ${state.datasetId}`, ...prev].slice(0, 60));
    setTimeout(() => runSimulate("immediate"), 0);
  };

  const runSimulate = (mode: "immediate" | "debounced" = "debounced") => {
    if (mode === "debounced") {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
      debounceTimer.current = window.setTimeout(() => {
        runSimulate("immediate");
      }, 180);
      return;
    }

    setStatus("simulating");
    simulate(state)
      .then(async (res) => {
        // attach a client-side hash of state as sanity check (also returned by server in mock)
        const hash = await sha256Hex(JSON.stringify(state));
        setLastSim({ ...res, provenance: { ...res.provenance, stateHash: hash } });
        setWarnings(res.warnings ?? []);
        setLogs((prev) => [...(res.logs ?? []), ...prev].slice(0, 60));
        setStatus("ready");
      })
      .catch((e) => {
        setStatus("error");
        setLogs((prev) => [`ERROR: ${String(e?.message ?? e)}`, ...prev].slice(0, 60));
      });
  };

  const value = useMemo<Ctx>(
    () => ({
      priors,
      state,
      setState,
      status,
      lastSim,
      logs,
      warnings,
      recommendedPatch,
      setRecommendedPatch,
      setDataset,
      runSimulate,
      resetState,
    }),
    [priors, state, status, lastSim, logs, warnings, recommendedPatch]
  );

  return <InstrumentCtx.Provider value={value}>{children}</InstrumentCtx.Provider>;
}

export function useInstrument() {
  const ctx = useContext(InstrumentCtx);
  if (!ctx) throw new Error("useInstrument must be used within InstrumentStateProvider");
  return ctx;
}

// helper: apply recommended patch to InstrumentState
export function applyRecommended(state: InstrumentState, patch: Partial<InstrumentState>) {
  return applyPatch(state, patch);
}
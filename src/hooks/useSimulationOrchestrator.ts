"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

function stableHash(obj: unknown) {
  const s = JSON.stringify(obj);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `${h}`;
}

// IMPORTANT: only hash the parts that should drive simulation.
// Exclude derived.lastSimOkAt (and anything else updated *by* simulation).
function selectSimInputState(st: any) {
  return {
    dataset: st.dataset,
    sample: st.sample,
    geometry: st.geometry,
    acquisition: st.acquisition,
    // planner affects /api/plan, not /api/simulate (unless you intend it to)
    // planner: st.planner,
  };
}

export function useSimulationOrchestrator() {
  const priorsStatus = useInstrumentStore((s) => s.priorsStatus);
  const instrumentState = useInstrumentStore((s) => s.instrumentState);
  const lastInteraction = useInstrumentStore((s) => s.lastInteraction);
  const setSimStatus = useInstrumentStore((s) => s.setSimStatus);
  const setSimResult = useInstrumentStore((s) => s.setSimResult);
  const appendLogs = useInstrumentStore((s) => s.appendLogs);

  const lastHashRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const inflightRef = useRef<AbortController | null>(null);

  const simInput = useMemo(() => selectSimInputState(instrumentState), [instrumentState]);
  const stateHash = useMemo(() => stableHash(simInput), [simInput]);

  useEffect(() => {
    if (priorsStatus !== "ready") return;

    // prevent loops on no real changes
    if (lastHashRef.current === stateHash) return;

    const intent = lastInteraction?.intent ?? "commit";

    const doSim = async () => {
      // cancel any inflight request
      if (inflightRef.current) inflightRef.current.abort();
      const ctrl = new AbortController();
      inflightRef.current = ctrl;

      lastHashRef.current = stateHash;
      setSimStatus("simulating");

      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ instrumentState: simInput }),
          signal: ctrl.signal
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`simulate failed: ${res.status}${txt ? ` — ${txt.slice(0, 200)}` : ""}`);
        }

        const data = await res.json();
        setSimResult(data);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        const msg = e?.message ?? "simulate error";
        setSimStatus("error", msg);

        // ensure the UI has an observable signal
        appendLogs([{ ts: new Date().toISOString(), level: "error", message: msg }]);
      } finally {
        inflightRef.current = null;
      }
    };

    // live intent: do not simulate
    if (intent === "live") return;

    // click intent: immediate
    if (intent === "click") {
      void doSim();
      return;
    }

    // commit intent: debounced
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void doSim();
    }, 200);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (inflightRef.current) inflightRef.current.abort();
    };
  }, [
    priorsStatus,
    lastInteraction,
    stateHash,
    simInput,
    setSimResult,
    setSimStatus,
    appendLogs
  ]);
}
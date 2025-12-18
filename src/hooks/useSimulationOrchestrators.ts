"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

function stableHash(obj: unknown) {
  // hackathon-safe: cheap hash, deterministic enough for “changed”
  const s = JSON.stringify(obj);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `${h}`;
}

export function useSimulationOrchestrator() {
  const priorsStatus = useInstrumentStore((s) => s.priorsStatus);
  const instrumentState = useInstrumentStore((s) => s.instrumentState);
  const lastInteraction = useInstrumentStore((s) => s.lastInteraction);
  const setSimStatus = useInstrumentStore((s) => s.setSimStatus);
  const setSimResult = useInstrumentStore((s) => s.setSimResult);

  const lastHashRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const stateHash = useMemo(() => stableHash(instrumentState), [instrumentState]);

  useEffect(() => {
    if (priorsStatus !== "ready") return;

    // prevent loops on no real changes
    if (lastHashRef.current === stateHash) return;

    const intent = lastInteraction?.intent ?? "commit";

    const doSim = async () => {
      lastHashRef.current = stateHash;
      setSimStatus("simulating");
      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ instrumentState })
        });
        if (!res.ok) throw new Error(`simulate failed: ${res.status}`);
        const data = await res.json();
        setSimResult(data);
      } catch (e: any) {
        // keep last valid visible; surface error
        setSimStatus("error", e?.message ?? "simulate error");
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
    };
  }, [instrumentState, priorsStatus, lastInteraction, setSimResult, setSimStatus, stateHash]);
}
"use client";

import { useEffect } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

export function useHydratePriors() {
  const priorsStatus = useInstrumentStore((s) => s.priorsStatus);
  const setPriorsStatus = useInstrumentStore((s) => s.setPriorsStatus);
  const setPriors = useInstrumentStore((s) => s.setPriors);

  useEffect(() => {
    if (priorsStatus !== "idle") return;

    const ac = new AbortController();

    const run = async () => {
      setPriorsStatus("loading");
      try {
        const res = await fetch("/api/priors", { method: "GET", signal: ac.signal });
        if (!res.ok) throw new Error(`priors failed: ${res.status}`);
        const data = await res.json();
        setPriors(data);
        setPriorsStatus("ready");
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setPriorsStatus("error", e?.message ?? "priors error");
      }
    };

    void run();

    return () => ac.abort();
  }, [priorsStatus, setPriors, setPriorsStatus]);
}
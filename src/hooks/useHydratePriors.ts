"use client";

import { useEffect } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

export function useHydratePriors() {
  const priorsStatus = useInstrumentStore((s) => s.priorsStatus);
  const setPriorsStatus = useInstrumentStore((s) => s.setPriorsStatus);
  const setPriors = useInstrumentStore((s) => s.setPriors);

  useEffect(() => {
    if (priorsStatus !== "idle") return;

    const run = async () => {
      setPriorsStatus("loading");
      try {
        const res = await fetch("/api/priors", { method: "GET" });
        if (!res.ok) throw new Error(`priors failed: ${res.status}`);
        const data = await res.json();
        setPriors(data);
        setPriorsStatus("ready");
      } catch (e: any) {
        setPriorsStatus("error", e?.message ?? "priors error");
      }
    };

    run();
  }, [priorsStatus, setPriors, setPriorsStatus]);
}
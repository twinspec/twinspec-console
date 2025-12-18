"use client";

import { useEffect, useMemo } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

function stableHash(obj: unknown) {
  const s = JSON.stringify(obj);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `${h}`;
}

export function useUnitySync() {
  const state = useInstrumentStore((s) => s.instrumentState);
  const setUnityStatus = useInstrumentStore((s) => s.setUnityStatus);

  const subset = useMemo(
    () => ({
      datasetId: state.dataset.id,
      sample: state.sample,
      geometry: state.geometry
    }),
    [state.dataset.id, state.sample, state.geometry]
  );

  useEffect(() => {
    const hash = stableHash(subset);

    // Stub “push to Unity”: if you later have WebGL bridge, replace here.
    // For hackathon: we just record that we would push.
    setUnityStatus({ lastPushedAt: new Date().toISOString(), lastHash: hash });

    // Example future contract:
    // (window as any).unityInstance?.SendMessage("TwinSpecBridge", "OnState", JSON.stringify(subset));
  }, [subset, setUnityStatus]);
}
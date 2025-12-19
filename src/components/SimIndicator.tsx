"use client";

import { useEffect, useMemo, useState } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

function formatTimeLocalSafe(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString();
}

export function SimIndicator() {
  const simStatus = useInstrumentStore((s) => s.simStatus);
  const simError = useInstrumentStore((s) => s.simError);
  const lastOk = useInstrumentStore((s) => s.instrumentState.derived.lastSimOkAt);

  // Prevent SSR/CSR mismatch from locale-dependent time formatting.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const timeLabel = useMemo(() => {
    if (!mounted) return "—";
    return formatTimeLocalSafe(lastOk);
  }, [mounted, lastOk]);

  if (simStatus === "simulating") {
    return (
      <div className="rounded-xl2 border border-border bg-surface2 px-3 py-2 text-sm">
        <span className="text-muted">Simulating…</span>
      </div>
    );
  }

  if (simStatus === "error") {
    return (
      <div className="rounded-xl2 border border-danger/40 bg-surface2 px-3 py-2 text-sm">
        <span className="text-danger">Sim error</span>
        <span className="ml-2 text-xs text-muted">{simError}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl2 border border-border bg-surface2 px-3 py-2 text-sm">
      <span className="text-muted">Last OK:</span>{" "}
      <span className="font-mono text-xs" suppressHydrationWarning>
        {timeLabel}
      </span>
    </div>
  );
}
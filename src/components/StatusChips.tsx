"use client";

import { useInstrument } from "@/state/InstrumentStateContext";

function Chip({ label, tone }: { label: string; tone: "ok" | "warn" | "err" | "idle" }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "warn"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : tone === "err"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return <span className={`rounded-full border px-2 py-1 text-xs ${cls}`}>{label}</span>;
}

export function StatusChips() {
  const { status, warnings } = useInstrument();

  const simTone = status === "ready" ? "ok" : status === "simulating" ? "idle" : status === "error" ? "err" : "idle";
  const warnTone = warnings.length ? "warn" : "ok";

  return (
    <div className="flex items-center gap-2">
      <Chip label={status === "simulating" ? "Simulating…" : status === "ready" ? "Sim OK" : status === "error" ? "Sim Error" : "Idle"} tone={simTone} />
      <Chip label={warnings.length ? `Warnings (${warnings.length})` : "No warnings"} tone={warnTone} />
    </div>
  );
}
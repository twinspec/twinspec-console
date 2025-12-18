"use client";

import { ConsoleShell } from "@/components/ConsoleShell";
import { useHydratePriors } from "@/hooks/useHydratePriors";
import { useSimulationOrchestrator } from "@/hooks/useSimulationOrchestrator";
import { useUnitySync } from "@/hooks/useUnitySync";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  useHydratePriors();
  useSimulationOrchestrator();
  useUnitySync();

  return <ConsoleShell>{children}</ConsoleShell>;
}
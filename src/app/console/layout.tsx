"use client";

import { InstrumentStateProvider } from "@/state/InstrumentStateContext";
import { AppShell } from "@/components/console/AppShell";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <InstrumentStateProvider>
      <AppShell>{children}</AppShell>
    </InstrumentStateProvider>
  );
}
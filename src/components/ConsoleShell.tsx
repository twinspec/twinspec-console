"use client";

import { ConsoleSidebar } from "@/components/ConsoleSidebar";

export function ConsoleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <ConsoleSidebar />
          </div>
          <main className="lg:col-span-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
"use client";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Navigation rail */}
        <Sidebar />

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Instrument status / dataset bar */}
          <Topbar />

          {/* Page content area */}
          <main className="min-w-0 flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
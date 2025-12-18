"use client";

import { Card } from "@/components/console/Card";
import { SimulatedFrame } from "@/components/console/SimulatedFrame";
import { Linecuts } from "@/components/console/Linecuts";
import { Metrics } from "@/components/console/Metrics";
import { Warnings } from "@/components/console/Warnings";
import { Provenance } from "@/components/console/Provenance";

export default function DataViewerPage() {
  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* Main data area */}
      <div className="col-span-12 xl:col-span-8">
        <div className="space-y-4">
          <SimulatedFrame />
          <Linecuts />
        </div>
      </div>

      {/* Context / metadata */}
      <div className="col-span-12 xl:col-span-4">
        <div className="space-y-4">
          <Card title="Dataset context">
            <div className="text-sm text-slate-700">
              <p className="font-medium">Viewer mode</p>
              <p className="mt-2 text-slate-600">
                This page is data-first. Keep controls minimal and emphasize provenance + export.
              </p>
              <div className="mt-3 text-slate-600">
                <ul className="list-disc pl-5">
                  <li>Run selection (future)</li>
                  <li>Overlay toggles (future)</li>
                  <li>Export PNG/CSV/JSON (future)</li>
                </ul>
              </div>
            </div>
          </Card>
          <Metrics />
          <Warnings />
          <Provenance />
        </div>
      </div>
    </div>
  );
}
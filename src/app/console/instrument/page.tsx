"use client";

import { ControlsPanel } from "@/components/console/ControlsPanel";
import { UnityEmbed } from "@/components/console/UnityEmbed";
import { SimulatedFrame } from "@/components/console/SimulatedFrame";
import { Linecuts } from "@/components/console/Linecuts";
import { Metrics } from "@/components/console/Metrics";
import { Warnings } from "@/components/console/Warnings";
import { Provenance } from "@/components/console/Provenance";
import { PlannerPanel } from "@/components/console/PlannerPanel";
import { LogsPanel } from "@/components/console/LogsPanel";
import { Tabs } from "@/components/console/Tabs";
import { Card } from "@/components/console/Card";

export default function InstrumentConsolePage() {
  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      {/* Left rail (controls) */}
      <div className="col-span-12 xl:col-span-3">
        <div className="space-y-4">
          <ControlsPanel />
          <PlannerPanel />
          <LogsPanel />
        </div>
      </div>

      {/* Center: Visual twin + structure */}
      <div className="col-span-12 xl:col-span-5">
        <div className="space-y-4">
          <UnityEmbed />
          <Card title="Material / Structure">
            <Tabs
              tabs={[
                {
                  id: "structure",
                  label: "Structure",
                  content: (
                    <div className="text-sm text-slate-700">
                      <p className="font-medium">Placeholder structure view</p>
                      <p className="mt-2 text-slate-600">
                        Add your polymer/film schematic or a lightweight molecular depiction here.
                      </p>
                    </div>
                  ),
                },
                {
                  id: "notes",
                  label: "Notes",
                  content: (
                    <div className="text-sm text-slate-700">
                      <p className="font-medium">Dataset notes</p>
                      <p className="mt-2 text-slate-600">
                        Use this area for method notes, citations, or processing context.
                      </p>
                    </div>
                  ),
                },
              ]}
              defaultTabId="structure"
            />
          </Card>
        </div>
      </div>

      {/* Right: Data twin outputs */}
      <div className="col-span-12 xl:col-span-4">
        <div className="space-y-4">
          <SimulatedFrame />
          <Linecuts />
          <Metrics />
          <Warnings />
          <Provenance />
        </div>
      </div>
    </div>
  );
}
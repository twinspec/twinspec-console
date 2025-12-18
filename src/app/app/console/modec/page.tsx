"use client";

import { Card, CardBody } from "@/components/ui";
import { DatasetPicker } from "@/components/DatasetPicker";
import { SimIndicator } from "@/components/SimIndicator";
import { UnityPanel } from "@/components/UnityPanel";
import { GiWaxsViewer } from "@/components/GiWaxsViewer";
import { MetricsPanel } from "@/components/MetricsPanel";
import { WarningsPanel } from "@/components/WarningsPanel";
import { ProvenancePanel } from "@/components/ProvenancePanel";
import { LogsPanel } from "@/components/LogsPanel";
import { InstrumentControls } from "@/components/InstrumentControls";
import { PlannerPanel } from "@/components/PlannerPanel";

export default function ModeCPage() {
  return (
    <div className="h-full w-full">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Mode C</h1>
          <p className="mt-1 text-sm text-muted">
            Instrument console (Visual + Data Twin combined, fixed layout).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SimIndicator />
          <DatasetPicker />
        </div>
      </div>

      <div className="grid h-[calc(100vh-190px)] gap-4 lg:grid-cols-12">
        {/* Left fixed: Controls */}
        <Card className="lg:col-span-3">
          <CardBody className="h-full">
            <div className="text-sm font-medium">Controls</div>
            <div className="mt-3 space-y-3">
              <InstrumentControls mode="C" />
              <PlannerPanel />
            </div>
          </CardBody>
        </Card>

        {/* Center fluid: Unity + GIWAXS stacked */}
        <div className="lg:col-span-6 grid h-full grid-rows-2 gap-4">
          <Card className="row-span-1">
            <CardBody className="h-full">
              <div className="text-sm font-medium">Unity Visual Twin</div>
              <div className="mt-2 h-[calc(100%-28px)]">
                <UnityPanel />
              </div>
            </CardBody>
          </Card>

          <Card className="row-span-1">
            <CardBody className="h-full">
              <div className="text-sm font-medium">GIWAXS Data Twin</div>
              <div className="mt-2 grid h-[calc(100%-28px)] grid-cols-2 gap-3">
                <GiWaxsViewer />
                <MetricsPanel />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right fixed: Warnings / Provenance / Logs */}
        <div className="lg:col-span-3 grid h-full grid-rows-3 gap-4">
          <WarningsPanel />
          <ProvenancePanel />
          <LogsPanel />
        </div>
      </div>
    </div>
  );
}
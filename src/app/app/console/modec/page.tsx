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
    <div className="w-full">
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

      {/* Let the shell/main handle height + scrolling */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-3">
          <CardBody className="space-y-3">
            <div className="text-sm font-medium">Controls</div>
            <InstrumentControls mode="C" />
            <PlannerPanel />
          </CardBody>
        </Card>

        <div className="lg:col-span-6 grid gap-4">
          <Card>
            <CardBody>
              <div className="text-sm font-medium">Unity Visual Twin</div>
              <div className="mt-2">
                <UnityPanel imageSrc="/unity/giwaxs-placeholder.png" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="text-sm font-medium">GIWAXS Data Twin</div>
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <GiWaxsViewer />
                <MetricsPanel />
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3 grid gap-4">
          <WarningsPanel />
          <ProvenancePanel />
          <LogsPanel />
          {/* Optional: ProvenancePanel + LogsPanel can be “compact” if needed */}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Card, CardBody } from "@/components/ui";
import { DatasetPicker } from "@/components/DatasetPicker";
import { GiWaxsViewer } from "@/components/GiWaxsViewer";
import { MetricsPanel } from "@/components/MetricsPanel";
import { WarningsPanel } from "@/components/WarningsPanel";
import { ProvenancePanel } from "@/components/ProvenancePanel";
import { LogsPanel } from "@/components/LogsPanel";
import { InstrumentControls } from "@/components/InstrumentControls";
import { SimIndicator } from "@/components/SimIndicator";
import { StateSnapshot } from "@/components/StateSnapshot";

export default function ModeAPage() {
  return (
    <div className="h-full w-full">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Mode A</h1>
          <p className="mt-1 text-sm text-muted">Materials + Characterization (dataset-first).</p>
        </div>
        <div className="flex items-center gap-3">
          <SimIndicator />
          <DatasetPicker />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardBody>
            <div className="text-sm font-medium">Controls</div>
            <p className="mt-1 text-sm text-muted">
              Subset controls affect the same InstrumentState as Mode C.
            </p>
            <div className="mt-3 space-y-3">
              <InstrumentControls mode="A" />
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-8">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Twin outputs</div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <GiWaxsViewer />
              <MetricsPanel />
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <WarningsPanel />
              <ProvenancePanel />
              <LogsPanel compact />
            </div>

            <div className="mt-3">
              <StateSnapshot />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
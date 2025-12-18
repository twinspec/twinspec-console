"use client";

import { useState } from "react";
import { Card, CardBody, Button, Input, Label } from "@/components/ui";
import { DatasetPicker } from "@/components/DatasetPicker";
import { SimIndicator } from "@/components/SimIndicator";
import { GiWaxsViewer } from "@/components/GiWaxsViewer";
import { MetricsPanel } from "@/components/MetricsPanel";
import { WarningsPanel } from "@/components/WarningsPanel";
import { ProvenancePanel } from "@/components/ProvenancePanel";
import { LogsPanel } from "@/components/LogsPanel";
import { useInstrumentStore } from "@/state/instrumentStore";

export default function ModeBPage() {
  const [value, setValue] = useState("O=C(Nc1ccc(OC)cc1)Nc1ccc(OC)cc1"); // placeholder
  const applyChemicalLens = useInstrumentStore((s) => s.applyChemicalLens);

  return (
    <div className="h-full w-full">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Mode B</h1>
          <p className="mt-1 text-sm text-muted">Cheminformatics (structure-derived priors lens).</p>
        </div>
        <div className="flex items-center gap-3">
          <SimIndicator />
          <DatasetPicker />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4">
          <CardBody>
            <div className="text-sm font-medium">Chemical identifiers</div>
            <p className="mt-1 text-sm text-muted">
              Placeholder acceptable for hackathon. Updates InstrumentState assumptions and triggers simulate.
            </p>

            <div className="mt-3 space-y-2">
              <Label>SMILES / InChI / repeat-unit tag</Label>
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="SMILES / tag" />
              <Button
                onClick={() => applyChemicalLens(value)}
                className="w-full"
                variant="primary"
                intent="click"
              >
                Apply mapping → priors
              </Button>
            </div>

            <div className="mt-3">
              <div className="text-sm font-medium">Structure panel</div>
              <div className="mt-2 rounded-xl2 border border-border bg-surface2 p-3 text-sm text-muted">
                (Placeholder) Rendered structure / summary would go here.
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-8">
          <CardBody>
            <div className="text-sm font-medium">Twin outputs</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <GiWaxsViewer />
              <MetricsPanel />
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <WarningsPanel />
              <ProvenancePanel />
              <LogsPanel compact />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
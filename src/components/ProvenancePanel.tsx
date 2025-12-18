"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Card, CardBody } from "@/components/ui";

export function ProvenancePanel() {
  const sim = useInstrumentStore((s) => s.lastSimResult);

  return (
    <Card className="h-full">
      <CardBody className="h-full">
        <div className="text-sm font-medium">Provenance</div>
        <div className="mt-3 rounded-xl2 border border-border bg-surface2 p-3 text-sm">
          {sim ? (
            <ul className="space-y-1 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-muted">simId</span>
                <span className="font-mono text-xs">{sim.provenance.simId}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted">ts</span>
                <span className="font-mono text-xs">{sim.provenance.ts}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted">model</span>
                <span className="font-mono text-xs">{sim.provenance.model}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted">dataset</span>
                <span className="font-mono text-xs">{sim.provenance.datasetId}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted">hash</span>
                <span className="font-mono text-xs">{sim.provenance.hash}</span>
              </li>
            </ul>
          ) : (
            <div className="text-muted">No provenance yet.</div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
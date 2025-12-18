"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Card, CardBody } from "@/components/ui";

export function MetricsPanel() {
  const sim = useInstrumentStore((s) => s.lastSimResult);

  return (
    <Card className="h-full">
      <CardBody className="h-full">
        <div className="text-sm font-medium">Metrics</div>
        <div className="mt-3 rounded-xl2 border border-border bg-surface2 p-3 text-sm">
          {sim ? (
            <ul className="space-y-1">
              {Object.entries(sim.metrics).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between">
                  <span className="text-muted">{k}</span>
                  <span className="font-mono">{v.toFixed(3)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted">No metrics yet.</div>
          )}
        </div>

        <div className="mt-3 text-sm">
          <div className="text-xs font-medium text-muted">Linecuts (preview)</div>
          <div className="mt-2 rounded-xl2 border border-border bg-surface2 p-2 text-xs text-muted">
            {sim ? (
              <div className="space-y-1">
                <div>q points: {sim.linecuts.q.length}</div>
                <div>inPlane max: {Math.max(...sim.linecuts.inPlane).toFixed(2)}</div>
                <div>outOfPlane max: {Math.max(...sim.linecuts.outOfPlane).toFixed(2)}</div>
              </div>
            ) : (
              "—"
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
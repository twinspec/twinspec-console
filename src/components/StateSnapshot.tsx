"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Card, CardBody } from "@/components/ui";

export function StateSnapshot() {
  const st = useInstrumentStore((s) => s.instrumentState);

  return (
    <Card>
      <CardBody>
        <div className="text-sm font-medium">State snapshot</div>
        <div className="mt-2 rounded-xl2 border border-border bg-surface2 p-2">
          <pre className="max-h-[220px] overflow-auto text-[10px] leading-[12px] text-muted">
            {JSON.stringify(st, null, 2)}
          </pre>
        </div>
      </CardBody>
    </Card>
  );
}
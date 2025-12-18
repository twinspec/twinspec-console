"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Card, CardBody } from "@/components/ui";
import { cn } from "@/lib/utils";

export function LogsPanel({ compact }: { compact?: boolean }) {
  const sim = useInstrumentStore((s) => s.lastSimResult);

  return (
    <Card className="h-full">
      <CardBody className="h-full">
        <div className="text-sm font-medium">Logs</div>
        <div className={cn("mt-3 rounded-xl2 border border-border bg-surface2 p-2", compact ? "h-[140px]" : "h-[220px]")}>
          <div className="h-full overflow-auto space-y-2">
            {sim?.logs?.length ? (
              sim.logs.slice(-50).map((l, i) => (
                <div key={`${l.ts}-${i}`} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-muted">{l.ts}</span>
                    <span className={cn("text-[10px]", l.level === "error" ? "text-danger" : l.level === "warn" ? "text-warn" : "text-muted")}>
                      {l.level.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-muted">{l.message}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted p-2">No logs yet.</div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
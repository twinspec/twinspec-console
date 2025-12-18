"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Card, CardBody } from "@/components/ui";
import { cn } from "@/lib/utils";

export function WarningsPanel() {
  const sim = useInstrumentStore((s) => s.lastSimResult);

  return (
    <Card className="h-full">
      <CardBody className="h-full">
        <div className="text-sm font-medium">Warnings</div>
        <div className="mt-3 space-y-2">
          {sim?.warnings?.length ? (
            sim.warnings.map((w, i) => (
              <div
                key={`${w.code}-${i}`}
                className={cn(
                  "rounded-xl2 border bg-surface2 p-2 text-sm",
                  w.level === "danger"
                    ? "border-danger/40"
                    : w.level === "warn"
                      ? "border-warn/40"
                      : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">{w.code}</span>
                  <span
                    className={cn(
                      "text-xs",
                      w.level === "danger"
                        ? "text-danger"
                        : w.level === "warn"
                          ? "text-warn"
                          : "text-muted"
                    )}
                  >
                    {w.level.toUpperCase()}
                  </span>
                </div>
                <div className="mt-1 text-sm text-muted">{w.message}</div>
              </div>
            ))
          ) : (
            <div className="rounded-xl2 border border-border bg-surface2 p-3 text-sm text-muted">
              No warnings.
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
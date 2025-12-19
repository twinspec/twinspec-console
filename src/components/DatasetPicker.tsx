"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Select, Label } from "@/components/ui";

export function DatasetPicker() {
  const priors = useInstrumentStore((s) => s.priors);
  const priorsStatus = useInstrumentStore((s) => s.priorsStatus);
  const priorsError = useInstrumentStore((s) => s.priorsError);

  const datasetId = useInstrumentStore((s) => s.instrumentState.dataset.id);
  const setDataset = useInstrumentStore((s) => s.setDataset);

  const options =
    priors?.datasets.map((d) => ({ value: d.id, label: `${d.label} · ${d.materialClass}` })) ?? [];

  const canChange = priorsStatus === "ready";

  return (
    <div className="min-w-[260px]">
      <Label>Dataset</Label>
      <Select
        value={datasetId}
        onChange={(v) => {
          if (!canChange) return;
          setDataset(v);
        }}
        options={
          options.length
            ? options
            : [{ value: datasetId, label: priorsStatus === "error" ? "Priors failed" : "Loading priors…" }]
        }
      />
      {priorsStatus === "error" && (
        <div className="mt-1 text-xs text-danger">
          {priorsError ?? "Failed to load /api/priors."}
        </div>
      )}
      {priorsStatus !== "ready" && priorsStatus !== "error" && (
        <div className="mt-1 text-xs text-muted">Loading priors…</div>
      )}
    </div>
  );
}
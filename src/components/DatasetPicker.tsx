"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Select, Label } from "@/components/ui";

export function DatasetPicker() {
  const priors = useInstrumentStore((s) => s.priors);
  const datasetId = useInstrumentStore((s) => s.instrumentState.dataset.id);
  const setDataset = useInstrumentStore((s) => s.setDataset);

  const options =
    priors?.datasets.map((d) => ({ value: d.id, label: `${d.label} · ${d.materialClass}` })) ?? [];

  return (
    <div className="min-w-[260px]">
      <Label>Dataset</Label>
      <Select value={datasetId} onChange={setDataset} options={options.length ? options : [{ value: datasetId, label: "Loading priors…" }]} />
    </div>
  );
}
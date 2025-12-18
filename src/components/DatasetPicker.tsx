"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Select, Label } from "@/components/ui";

export function DatasetPicker() {
  const priors = useInstrumentStore((s) => s.priors);
  const datasetId = useInstrumentStore((s) => s.instrumentState.dataset.id);
  const setDataset = useInstrumentStore((s) => s.setDataset);

  const options =
    priors?.datasets.map((d) => {
      const temp =
        (d as any)?.lakehouse?.anneal_temp_C != null ? `${(d as any).lakehouse.anneal_temp_C}°C` : "";
      const solvent = (d as any)?.lakehouse?.solvent ? ` · ${(d as any).lakehouse.solvent}` : "";
      return {
        value: d.id,
        label: `${d.label}${temp ? ` · ${temp}` : ""}${solvent} · ${d.materialClass}`
      };
    }) ?? [];

  return (
    <div className="min-w-[260px]">
      <Label>Dataset</Label>
      <Select
        value={datasetId}
        onChange={setDataset}
        options={
          options.length
            ? options
            : [{ value: datasetId, label: "Loading priors…" }]
        }
      />
    </div>
  );
}
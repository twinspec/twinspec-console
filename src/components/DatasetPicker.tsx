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

  const fallbackLabel =
    priorsStatus === "error"
      ? `Priors error (see below)`
      : priorsStatus === "loading"
        ? "Loading priors…"
        : "No priors yet…";

  return (
    <div className="min-w-[260px]">
      <Label>Dataset</Label>

      <Select
        value={datasetId}
        onChange={setDataset}
        options={options.length ? options : [{ value: datasetId, label: fallbackLabel }]}
      />

      {priorsStatus === "error" && (
        <div className="mt-2 text-xs text-red-600">
          {priorsError ?? "Unknown priors error."}
          <div className="mt-1 text-[11px] text-muted">
            Tip: open DevTools → Network and confirm GET /api/priors is 200.
          </div>
        </div>
      )}
    </div>
  );
}
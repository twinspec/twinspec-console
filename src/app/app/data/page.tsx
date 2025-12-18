"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Card, CardBody } from "@/components/ui";
import { DatasetPicker } from "@/components/DatasetPicker";
import { GiWaxsViewer } from "@/components/GiWaxsViewer";
import { MetricsPanel } from "@/components/MetricsPanel";

export default function DataViewerPage() {
  const priors = useInstrumentStore((s) => s.priors);
  const datasetId = useInstrumentStore((s) => s.instrumentState.dataset.id);
  const dataset = priors?.datasets.find((d) => d.id === datasetId);

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Data Viewer</h1>
          <p className="mt-1 text-sm text-muted">Browse datasets without operating the instrument.</p>
        </div>
        <DatasetPicker />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardBody>
            <div className="text-sm font-medium">Dataset metadata</div>
            <div className="mt-2 text-sm text-muted">
              {dataset ? (
                <ul className="space-y-1">
                  <li>
                    <span className="text-ink">ID:</span> <span className="font-mono">{dataset.id}</span>
                  </li>
                  <li>
                    <span className="text-ink">Label:</span> {dataset.label}
                  </li>
                  <li>
                    <span className="text-ink">Material class:</span> {dataset.materialClass}
                  </li>
                  <li>
                    <span className="text-ink">Tags:</span> {dataset.tags.join(", ")}
                  </li>
                </ul>
              ) : (
                "Loading priors…"
              )}
            </div>
          </CardBody>
        </Card>

        <Card className="md:col-span-2">
          <CardBody>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Preview outputs</div>
              <a className="text-sm text-primary underline" href="/app/console/modea">
                Open instrument (Mode A)
              </a>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <GiWaxsViewer />
              <MetricsPanel />
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
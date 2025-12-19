"use client";

import Image from "next/image";
import { useInstrumentStore } from "@/state/instrumentStore";

export function UnityPanel({ imageSrc }: { imageSrc: string }) {
  const unityStatus = useInstrumentStore((s) => s.unityStatus);
  const subset = useInstrumentStore((s) => ({
    datasetId: s.instrumentState.dataset.id,
    sample: s.instrumentState.sample,
    geometry: s.instrumentState.geometry,
  }));

  return (
    <div className="w-full rounded-xl2 border border-border bg-surface2 p-3">
      {/* Image placeholder */}
      <div className="relative w-full overflow-hidden rounded-xl2 border border-border bg-black/5">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src="/images/unity/giwaxs-instrument-placeholder.png"
            alt="Unity GIWAXS instrument placeholder"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-xl2 border border-border bg-surface p-2">
          <div className="text-xs font-medium text-muted">Last pushed</div>
          <div className="mt-1 font-mono text-xs">{unityStatus.lastPushedAt ?? "—"}</div>
          <div className="mt-1 text-xs text-muted">hash</div>
          <div className="font-mono text-xs">{unityStatus.lastHash ?? "—"}</div>
        </div>

        <div className="rounded-xl2 border border-border bg-surface p-2">
          <div className="text-xs font-medium text-muted">Payload (subset)</div>
          <pre className="mt-2 max-h-[180px] overflow-auto text-[10px] leading-[12px] text-muted">
            {JSON.stringify(subset, null, 2)}
          </pre>
        </div>
      </div>

      <div className="mt-2 text-xs text-muted">
        Placeholder: Unity WebGL view will render here later; web console remains authoritative.
      </div>
    </div>
  );
}
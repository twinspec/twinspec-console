"use client";

import { useInstrumentStore } from "@/state/instrumentStore";
import { Card, CardBody } from "@/components/ui";

function pixelToChar(v: number) {
  const chars = " .:-=+*#%@";
  const idx = Math.max(0, Math.min(chars.length - 1, Math.floor((v / 1.0) * (chars.length - 1))));
  return chars[idx];
}

export function GiWaxsViewer() {
  const sim = useInstrumentStore((s) => s.lastSimResult);
  const simStatus = useInstrumentStore((s) => s.simStatus);

  // Render a tiny “instrument-like” preview using ASCII-ish blocks from pixels.
  // This intentionally keeps last valid visible while simulating.
  const pattern = sim?.pattern2d;

  return (
    <Card className="h-full">
      <CardBody className="h-full">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">2D pattern</div>
          <div className="text-xs text-muted">{simStatus === "simulating" ? "Updating…" : "Stable"}</div>
        </div>

        <div className="mt-3 rounded-xl2 border border-border bg-surface2 p-2">
          {pattern ? (
            <pre className="overflow-hidden text-[9px] leading-[10px] text-muted">
              {renderTiny(pattern.width, pattern.height, pattern.pixels)}
            </pre>
          ) : (
            <div className="text-sm text-muted">No simulation result yet.</div>
          )}
        </div>

        <div className="mt-2 text-xs text-muted">{pattern?.note ?? "Synthetic stub output."}</div>
      </CardBody>
    </Card>
  );
}

function renderTiny(w: number, h: number, pixels: number[]) {
  // downsample to 48x24 for console feel
  const targetW = 48;
  const targetH = 24;
  const sx = w / targetW;
  const sy = h / targetH;

  let out = "";
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const ix = Math.floor(x * sx);
      const iy = Math.floor(y * sy);
      const v = pixels[iy * w + ix] ?? 0;
      out += pixelToChar(v);
    }
    out += "\n";
  }
  return out;
}
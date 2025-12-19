"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

/**
 * Canvas renderer for pattern2d.pixels (0..1).
 * Fixes:
 * - flips Y to match matplotlib origin="lower"
 * - applies Turbo colormap (paper-like)
 * - applies gamma to avoid "too dark" appearance
 */

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * Turbo colormap (Google/Anton Mikhailov).
 * Input t in [0,1], output 0..255 RGB.
 * This avoids needing any extra deps.
 */
function turboRgb(t: number) {
  t = clamp01(t);
  // polynomial approximation
  const r =
    34.61 +
    t * (1172.33 + t * (-10793.56 + t * (33300.12 + t * (-38394.49 + t * 14825.05))));
  const g =
    23.31 +
    t * (557.33 + t * (1225.33 + t * (-3574.96 + t * (1073.77 + t * 707.56))));
  const b =
    27.2 +
    t * (3211.1 + t * (-15327.97 + t * (27814.0 + t * (-22569.18 + t * 6838.66))));

  return {
    r: Math.round(clamp01(r / 255) * 255),
    g: Math.round(clamp01(g / 255) * 255),
    b: Math.round(clamp01(b / 255) * 255)
  };
}

export function GiWaxsViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pattern = useInstrumentStore((s) => s.lastSimResult?.pattern2d ?? null);

  // You can tweak these if you want a closer match to your matplotlib output.
  const gamma = 0.65; // <1 brightens midtones
  const flipY = true; // match origin="lower"

  const meta = useMemo(() => {
    if (!pattern) return null;
    const w = pattern.width ?? 512;
    const h = pattern.height ?? 512;
    const pixels = Array.isArray(pattern.pixels) ? pattern.pixels : [];
    return { w, h, pixels, note: pattern.note ?? "" };
  }, [pattern]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    if (!meta) {
      const ctx = c.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
      return;
    }

    const { w, h, pixels } = meta;

    // Set backing resolution exactly to data resolution
    c.width = w;
    c.height = h;

    const ctx = c.getContext("2d");
    if (!ctx) return;

    const img = ctx.createImageData(w, h);
    const data = img.data;

    // Defensive: if pixels length mismatches, just clear.
    if (pixels.length < w * h) {
      ctx.clearRect(0, 0, w, h);
      return;
    }

    // Render
    for (let y = 0; y < h; y++) {
      const yy = flipY ? h - 1 - y : y;
      for (let x = 0; x < w; x++) {
        const srcIdx = y * w + x;
        const dstIdx = (yy * w + x) * 4;

        // pixels are already 0..1 from your server normalization
        let t = clamp01(Number(pixels[srcIdx]) || 0);

        // gamma to brighten
        // Log-like contrast compression (closer to matplotlib appearance)
        const eps = 1e-6;
        t = Math.log1p(6 * t) / Math.log1p(6); // compress highlights, lift mids

        const { r, g, b } = turboRgb(t);

        data[dstIdx + 0] = r;
        data[dstIdx + 1] = g;
        data[dstIdx + 2] = b;
        data[dstIdx + 3] = 255;
      }
    }

    ctx.putImageData(img, 0, 0);
  }, [meta, gamma, flipY]);

  if (!meta) {
    return (
      <div className="rounded-xl2 border border-border bg-surface2 p-3 text-sm text-muted">
        No simulation result yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-xl2 border border-border bg-surface2 p-3">
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-lg"
          style={{
            imageRendering: "auto" // set to "pixelated" if you prefer crisp bins
          }}
        />
      </div>

      {meta.note ? <div className="text-xs text-muted">{meta.note}</div> : null}
    </div>
  );
}
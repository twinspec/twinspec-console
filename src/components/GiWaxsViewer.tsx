"use client";

import { useEffect, useMemo, useRef } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

function clamp01(x: number) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/**
 * Simple “inferno-ish” colormap without shipping a huge LUT.
 * If you want grayscale, replace this with r=g=b=v.
 */
function colorMap(v01: number) {
  const v = clamp01(v01);

  // piecewise-ish warm ramp
  const r = clamp01(1.6 * v);
  const g = clamp01(1.3 * v - 0.15);
  const b = clamp01(1.1 * v - 0.35);

  // gamma-ish
  const R = Math.round(255 * Math.pow(r, 0.85));
  const G = Math.round(255 * Math.pow(g, 0.95));
  const B = Math.round(255 * Math.pow(b, 1.05));

  return [R, G, B] as const;
}

export function GiWaxsViewer() {
  const simStatus = useInstrumentStore((s) => s.simStatus);
  const simError = useInstrumentStore((s) => s.simError);
  const pattern = useInstrumentStore((s) => s.lastSimResult?.pattern2d ?? null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const hasPattern =
    pattern &&
    Number.isFinite(pattern.width) &&
    Number.isFinite(pattern.height) &&
    Array.isArray(pattern.pixels) &&
    pattern.pixels.length === pattern.width * pattern.height;

  // Create ImageData once per pattern payload
  const imageData = useMemo(() => {
    if (!hasPattern || !pattern) return null;

    const w = pattern.width;
    const h = pattern.height;
    const img = new ImageData(w, h);

    const data = img.data;
    const px = pattern.pixels;

    for (let i = 0; i < px.length; i++) {
      const v = px[i] ?? 0;
      const [R, G, B] = colorMap(v);
      const o = i * 4;
      data[o + 0] = R;
      data[o + 1] = G;
      data[o + 2] = B;
      data[o + 3] = 255;
    }

    return img;
  }, [hasPattern, pattern]);

  // Draw + scale to fit container
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    if (!imageData || !pattern) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const w = pattern.width;
    const h = pattern.height;

    // Set internal resolution to pattern size
    canvas.width = w;
    canvas.height = h;

    // Draw raw pixels
    ctx.putImageData(imageData, 0, 0);

    // Now size the canvas in CSS to fit the wrapper (crisp scaling)
    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const maxW = Math.max(1, rect.width);
      const maxH = Math.max(1, rect.height);

      const s = Math.min(maxW / w, maxH / h);

      const cssW = Math.floor(w * s);
      const cssH = Math.floor(h * s);

      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
    };

    resize();

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);

    return () => ro.disconnect();
  }, [imageData, pattern]);

  return (
    <div className="rounded-xl2 border border-border bg-surface2 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold">2D pattern</div>
        <div className="text-xs text-muted">
          {simStatus === "simulating" ? "Simulating…" : simStatus === "error" ? "Error" : "Stable"}
        </div>
      </div>

      {simStatus === "error" && (
        <div className="mb-2 rounded-lg border border-danger/40 bg-surface px-3 py-2 text-xs text-danger">
          {simError ?? "Simulation error"}
        </div>
      )}

      <div
        ref={wrapRef}
        className="relative flex h-[320px] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-surface"
      >
        {hasPattern ? (
          <canvas ref={canvasRef} className="block" />
        ) : (
          <div className="text-sm text-muted">No simulation result yet.</div>
        )}
      </div>

      <div className="mt-2 text-xs text-muted">
        {pattern?.note ?? "—"}
      </div>
    </div>
  );
}

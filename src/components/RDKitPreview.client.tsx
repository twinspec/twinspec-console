"use client";

import { useEffect, useRef, useState } from "react";

type RDKitModule = any;

type RDKitPreviewImplProps = {
  smiles: string;
  height?: number;
};

export default function RDKitPreviewImpl({
  smiles,
  height = 240,
}: RDKitPreviewImplProps) {
  const [svg, setSvg] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string>("");

  const rdkitRef = useRef<RDKitModule | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRDKit() {
      if (rdkitRef.current) return;

      setStatus("loading");
      try {
        // Canonical: @rdkit/rdkit default export is the WASM initializer function
        const initRDKitModule = (await import("@rdkit/rdkit")).default;

        if (typeof initRDKitModule !== "function") {
          throw new Error("RDKit initializer not found on module default export.");
        }

        const RDKit = await initRDKitModule();
        rdkitRef.current = RDKit;

        if (!cancelled) setStatus("ok");
      } catch (e: any) {
        if (!cancelled) {
          setStatus("error");
          setError(e?.message ?? "Failed to load RDKit");
        }
      }
    }

    void loadRDKit();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const RDKit = rdkitRef.current;
    const s = (smiles ?? "").trim();

    // If RDKit isn't ready yet, don't try to render
    if (!RDKit) return;

    if (!s) {
      setSvg("");
      setError("");
      return;
    }

    try {
      // RDKit throws on invalid SMILES
      const mol = RDKit.get_mol(s);
      const out = mol.get_svg();
      mol.delete();

      setSvg(out);
      setError("");
    } catch (e: any) {
      setSvg("");
      setError(e?.message ?? "Invalid SMILES");
    }
  }, [smiles, status]);

  return (
    <div className="mt-3">
      <div className="text-sm font-medium">Structure panel</div>

      <div className="mt-2 rounded-xl2 border border-border bg-surface2 p-3">
        {status === "loading" ? (
          <div className="text-sm text-muted">Loading RDKit…</div>
        ) : status === "error" ? (
          <div className="text-sm text-muted">RDKit failed to load: {error}</div>
        ) : error ? (
          <div className="text-sm text-muted">Invalid SMILES (RDKit): {error}</div>
        ) : svg ? (
          <div
            style={{ height }}
            className="overflow-hidden"
            // RDKit returns SVG markup
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="text-sm text-muted">Enter a SMILES string to preview structure.</div>
        )}
      </div>

      <div className="mt-2 text-xs text-muted">
        RDKit (WASM) renderer. Real parsing + depiction in-browser.
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

/**
 * Hydrates /api/priors into zustand.
 * Improvements:
 * - abortable fetch (prevents “stuck loading” during fast refresh/navigation)
 * - watchdog: if stuck in loading > 6s, reset and retry
 * - retries (limited) with backoff
 * - richer error text (reads response body if present)
 * - uses cache: "no-store" to avoid weird caching in dev/proxy setups
 */
export function useHydratePriors() {
  const priorsStatus = useInstrumentStore((s) => s.priorsStatus);
  const priorsError = useInstrumentStore((s) => s.priorsError);
  const setPriorsStatus = useInstrumentStore((s) => s.setPriorsStatus);
  const setPriors = useInstrumentStore((s) => s.setPriors);

  const startedRef = useRef(false);
  const loadingStartedAtRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // If we are already ready, do nothing.
    if (priorsStatus === "ready") return;

    // Watchdog: if "loading" is stuck too long, reset to idle so we can retry.
    if (priorsStatus === "loading") {
      if (loadingStartedAtRef.current == null) {
        loadingStartedAtRef.current = Date.now();
      } else if (Date.now() - loadingStartedAtRef.current > 6000) {
        setPriorsStatus("idle", "Priors fetch timed out (>6s). Retrying…");
        loadingStartedAtRef.current = null;
        startedRef.current = false;
      }
      return;
    }

    // Only start automatically when idle.
    if (priorsStatus !== "idle") return;
    if (startedRef.current) return;
    startedRef.current = true;

    const ctrl = new AbortController();

    const run = async () => {
      setPriorsStatus("loading");
      loadingStartedAtRef.current = Date.now();

      try {
        // Use absolute URL to avoid any basePath / middleware oddities in dev
        const url =
          typeof window !== "undefined"
            ? `${window.location.origin}/api/priors`
            : "/api/priors";

        const res = await fetch(url, {
          method: "GET",
          signal: ctrl.signal,
          cache: "no-store",
          headers: { "accept": "application/json" }
        });

        if (!res.ok) {
          let bodyText = "";
          try {
            bodyText = await res.text();
          } catch {
            // ignore
          }
          throw new Error(
            `priors failed: ${res.status} ${res.statusText}${bodyText ? ` — ${bodyText.slice(0, 300)}` : ""}`
          );
        }

        const data = await res.json();
        setPriors(data);
        setPriorsStatus("ready");
        retryCountRef.current = 0;
        loadingStartedAtRef.current = null;
      } catch (e: any) {
        if (e?.name === "AbortError") return;

        const msg = e?.message ?? "priors error";
        setPriorsStatus("error", msg);
        loadingStartedAtRef.current = null;

        // Retry a couple times automatically
        if (retryCountRef.current < 2) {
          retryCountRef.current += 1;
          const delay = 400 * retryCountRef.current; // 400ms, 800ms
          retryTimerRef.current = window.setTimeout(() => {
            startedRef.current = false;
            setPriorsStatus("idle", `Retrying priors… (attempt ${retryCountRef.current + 1})`);
          }, delay);
        }
      }
    };

    void run();

    return () => {
      ctrl.abort();
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    };
  }, [priorsStatus, priorsError, setPriors, setPriorsStatus]);
}
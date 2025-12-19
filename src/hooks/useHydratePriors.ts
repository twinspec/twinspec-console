"use client";

import { useEffect, useRef } from "react";
import { useInstrumentStore } from "@/state/instrumentStore";

/**
 * Hydrates /api/priors into zustand without “self-abort” on priorsStatus transitions.
 *
 * Key change:
 * - This effect runs once on mount (no priorsStatus dependency), so setting
 *   priorsStatus="loading" won't trigger a cleanup that aborts the active fetch.
 */
export function useHydratePriors() {
  const setPriorsStatus = useInstrumentStore((s) => s.setPriorsStatus);
  const setPriors = useInstrumentStore((s) => s.setPriors);

  const startedRef = useRef(false);
  const ctrlRef = useRef<AbortController | null>(null);
  const watchdogRef = useRef<number | null>(null);
  const retryTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const run = async () => {
      // If someone already loaded priors before mount completes, do nothing.
      const st0 = useInstrumentStore.getState();
      if (st0.priorsStatus === "ready") return;

      ctrlRef.current = new AbortController();
      const ctrl = ctrlRef.current;

      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/api/priors`
          : "/api/priors";

      let attempt = 0;
      const maxAttempts = 3; // 1 initial + 2 retries

      const clearTimers = () => {
        if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
        if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
        watchdogRef.current = null;
        retryTimerRef.current = null;
      };

      const doAttempt = async () => {
        attempt += 1;
        setPriorsStatus("loading");

        // Watchdog: if request hangs, abort it and retry (or fail)
        clearTimers();
        watchdogRef.current = window.setTimeout(() => {
          try {
            ctrl.abort();
          } catch {
            // ignore
          }
        }, 8000);

        try {
          const res = await fetch(url, {
            method: "GET",
            signal: ctrl.signal,
            cache: "no-store",
            headers: { accept: "application/json" }
          });

          if (!res.ok) {
            let bodyText = "";
            try {
              bodyText = await res.text();
            } catch {
              // ignore
            }
            throw new Error(
              `priors failed: ${res.status} ${res.statusText}${
                bodyText ? ` — ${bodyText.slice(0, 300)}` : ""
              }`
            );
          }

          const data = await res.json();
          clearTimers();
          setPriors(data);
          setPriorsStatus("ready");
        } catch (e: any) {
          clearTimers();

          // If we aborted due to navigation/unmount, stop quietly
          if (e?.name === "AbortError") {
            // If this abort came from the watchdog, we can retry with a fresh controller:
            if (attempt < maxAttempts) {
              ctrlRef.current = new AbortController();
              retryTimerRef.current = window.setTimeout(() => {
                // swap controller for the next attempt
                const nextCtrl = ctrlRef.current!;
                // rebind ctrl for the next attempt by shadowing in closure:
                // easiest: call doAttempt again via a small wrapper that uses ctrlRef.current
                // but keep it simple: just reload page state by restarting run is overkill.
              }, 0);
            }
            // Instead of complicated controller swapping, just treat watchdog abort as failure and retry below.
          }

          const msg = e?.message ?? "priors error";

          if (attempt < maxAttempts) {
            // Backoff: 400ms, 800ms
            const delay = 400 * attempt;
            setPriorsStatus("error", `${msg} — retrying (${attempt}/${maxAttempts - 1})…`);
            retryTimerRef.current = window.setTimeout(() => {
              // New controller per attempt
              ctrlRef.current = new AbortController();
              doAttemptWithCurrentController();
            }, delay);
            return;
          }

          setPriorsStatus("error", msg);
        }
      };

      const doAttemptWithCurrentController = async () => {
        // Re-point ctrl to the latest controller
        const currentCtrl = ctrlRef.current;
        if (!currentCtrl) return;

        // Update ctrl used by fetch + watchdog by mutating the captured `ctrl` reference:
        // We can’t reassign the const `ctrl`, so we just run the same logic but
        // referencing ctrlRef.current inside.
        attempt += 1;
        setPriorsStatus("loading");

        clearTimers();
        watchdogRef.current = window.setTimeout(() => {
          try {
            ctrlRef.current?.abort();
          } catch {
            // ignore
          }
        }, 8000);

        try {
          const res = await fetch(url, {
            method: "GET",
            signal: ctrlRef.current?.signal,
            cache: "no-store",
            headers: { accept: "application/json" }
          });

          if (!res.ok) {
            let bodyText = "";
            try {
              bodyText = await res.text();
            } catch {
              // ignore
            }
            throw new Error(
              `priors failed: ${res.status} ${res.statusText}${
                bodyText ? ` — ${bodyText.slice(0, 300)}` : ""
              }`
            );
          }

          const data = await res.json();
          clearTimers();
          setPriors(data);
          setPriorsStatus("ready");
        } catch (e: any) {
          clearTimers();
          if (e?.name === "AbortError") {
            // treat watchdog abort as a normal failure that can retry
          }

          const msg = e?.message ?? "priors error";

          if (attempt < maxAttempts) {
            const delay = 400 * attempt;
            setPriorsStatus("error", `${msg} — retrying (${attempt}/${maxAttempts - 1})…`);
            retryTimerRef.current = window.setTimeout(() => {
              ctrlRef.current = new AbortController();
              doAttemptWithCurrentController();
            }, delay);
            return;
          }

          setPriorsStatus("error", msg);
        }
      };

      // First attempt
      doAttemptWithCurrentController();
    };

    void run();

    return () => {
      try {
        ctrlRef.current?.abort();
      } catch {
        // ignore
      }
      if (watchdogRef.current) window.clearTimeout(watchdogRef.current);
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    };
  }, [setPriors, setPriorsStatus]);
}
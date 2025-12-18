import { InstrumentState, PriorsResponse, SimulateResponse } from "./types";

export async function fetchPriors(): Promise<PriorsResponse> {
  const res = await fetch("/api/priors", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load priors");
  return res.json();
}

export async function simulate(state: InstrumentState): Promise<SimulateResponse> {
  const res = await fetch("/api/simulate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error("Simulation failed");
  return res.json();
}
import { InstrumentState } from "./types";

const keyFor = (datasetId: string) => `twinspec.console.state.${datasetId}`;

export function loadState(datasetId: string): InstrumentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(keyFor(datasetId));
    if (!raw) return null;
    return JSON.parse(raw) as InstrumentState;
  } catch {
    return null;
  }
}

export function saveState(state: InstrumentState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(state.datasetId), JSON.stringify(state));
  } catch {
    // ignore
  }
}
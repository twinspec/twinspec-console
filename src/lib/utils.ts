export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function round(n: number, digits = 2) {
  const p = Math.pow(10, digits);
  return Math.round(n * p) / p;
}

export async function sha256Hex(input: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return "no-crypto";
  const enc = new TextEncoder().encode(input);
  const buf = await window.crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("");
}
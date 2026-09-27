import seed from "@/data/providers.json";

export type Status = "active" | "dead" | "unconfirmed" | "fake";
export type Provider = {
  name: string;
  category: string;
  badge: string;
  bonus: string;
  notes: string;
  url: string;
  status: Status;
};

export const CATEGORIES = [
  { key: "Top Sites in This Genre", label: "Top Sites" },
  { key: "Other Sites to Try", label: "Other Sites" },
  { key: "Chinese/Rush/Indo AI Routers", label: "Chinese/Regional" },
  { key: "Free AI Coding/Daily Tools", label: "Free Tools" },
  { key: "Non-Working / Dead / Unverified", label: "Dead/Unverified" },
];

export const STATUSES: Status[] = ["active", "dead", "unconfirmed", "fake"];
export const SEED = seed as Provider[];
const KEY = "fai-providers-v1";

export function loadProviders(): Provider[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return SEED;
}
export function saveProviders(p: Provider[]) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
export function resetProviders() {
  localStorage.removeItem(KEY);
}

// Passcode stored as SHA-256 hash in localStorage (default "admin").
const PASS_KEY = "fai-pass-hash";
async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(b)).map((x) => x.toString(16).padStart(2, "0")).join("");
}
export async function checkPass(p: string) {
  const stored = localStorage.getItem(PASS_KEY) ?? (await sha("admin"));
  return (await sha(p)) === stored;
}
export async function setPass(p: string) {
  localStorage.setItem(PASS_KEY, await sha(p));
}

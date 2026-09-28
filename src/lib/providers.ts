import seed from "@/data/providers.json";

export type Status = "active" | "dead" | "unconfirmed" | "fake";
export type Provider = {
  name: string;
  category: string;
  badge: string;
  bonus: string;
  notes: string;
  url: string; // primary link (kept for compatibility)
  urls: string[]; // all links, primary first
  linkLabels: string[]; // optional short labels aligned with urls
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

function normalize(p: Partial<Provider> & { url?: string }): Provider {
  const urls = Array.isArray(p.urls) && p.urls.length ? p.urls.filter(Boolean) : p.url ? [p.url] : [];
  return {
    name: p.name ?? "",
    category: p.category ?? CATEGORIES[0]!.key,
    badge: p.badge ?? "",
    bonus: p.bonus ?? "",
    notes: p.notes ?? "",
    url: urls[0] ?? "",
    urls,
    linkLabels: Array.isArray(p.linkLabels) ? p.linkLabels : [],
    status: p.status ?? "active",
  };
}

export const SEED: Provider[] = (seed as Partial<Provider>[]).map(normalize);
const KEY = "fai-providers-v1";

export function loadProviders(): Provider[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = (JSON.parse(raw) as Partial<Provider>[]).map(normalize);
      // Keep personal edits while filling links added to a newer bundled dataset.
      return saved.map((provider) => {
        const current = SEED.find((item) => item.name === provider.name);
        if (!current || provider.urls.length >= current.urls.length) return provider;
        return { ...provider, url: current.url, urls: current.urls, linkLabels: current.linkLabels };
      });
    }
  } catch {}
  return SEED;
}
export function saveProviders(p: Provider[]) {
  localStorage.setItem(KEY, JSON.stringify(p));
}
export function resetProviders() {
  localStorage.removeItem(KEY);
}

export function linkLabel(u: string, i: number): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return `link ${i + 1}`;
  }
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

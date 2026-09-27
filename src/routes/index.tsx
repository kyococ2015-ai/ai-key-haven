import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORIES, STATUSES, SEED, loadProviders, saveProviders, resetProviders,
  checkPass, setPass, type Provider, type Status,
} from "@/lib/providers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "free-ai-keys — Directory of Free AI API Credits" },
      { name: "description", content: "Searchable directory of free AI API keys, credits and routers with live status." },
      { property: "og:title", content: "free-ai-keys — Free AI API Credits Directory" },
      { property: "og:description", content: "Find free AI API credits, routers and tools. Filter by category and status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STATUS_STYLE: Record<Status, string> = {
  active: "bg-success/15 text-success",
  dead: "bg-destructive/15 text-destructive",
  unconfirmed: "bg-warning/15 text-warning",
  fake: "bg-muted text-muted-foreground line-through",
};
const STATUS_LABEL: Record<Status, string> = {
  active: "Active", dead: "Dead", unconfirmed: "Unconfirmed", fake: "Fake",
};

function Index() {
  const [items, setItems] = useState<Provider[]>(SEED);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [dark, setDark] = useState(true);
  const [admin, setAdmin] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editing, setEditing] = useState<{ idx: number; p: Provider } | null>(null);

  useEffect(() => {
    setItems(loadProviders());
    setDark(localStorage.getItem("fai-theme") !== "light");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const update = (next: Provider[]) => { setItems(next); saveProviders(next); };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items
      .map((p, idx) => ({ p, idx }))
      .filter(({ p }) => cat === "all" || p.category === cat)
      .filter(({ p }) => !s || [p.name, p.notes, p.bonus, p.badge, p.url].join(" ").toLowerCase().includes(s));
  }, [items, q, cat]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    items.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, [items]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-2xl font-semibold tracking-tight">
              <span className="text-primary">$</span> free-ai-keys
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Free AI API credits, routers & tools. {items.filter((p) => p.status === "active").length} active.
            </p>
          </div>
          <div className="flex gap-2 font-mono text-xs">
            <button className="btn" onClick={() => { const d = !dark; setDark(d); localStorage.setItem("fai-theme", d ? "dark" : "light"); }}>
              {dark ? "light" : "dark"}
            </button>
            <button className="btn" onClick={() => (admin ? setAdmin(false) : setLoginOpen(true))}>
              {admin ? "exit admin" : "admin"}
            </button>
          </div>
        </header>

        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search name, model, keyword, notes…"
          className="mt-6 w-full rounded-md border bg-card px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        <nav className="mt-4 flex flex-wrap gap-1.5 font-mono text-xs">
          {[{ key: "all", label: "All" }, ...CATEGORIES].map((c) => (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`rounded-md border px-3 py-1.5 transition-colors ${cat === c.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              {c.label} <span className="opacity-60">{counts[c.key] ?? 0}</span>
            </button>
          ))}
        </nav>

        {admin && <AdminBar items={items} update={update} onAdd={() => setEditing({ idx: -1, p: { name: "", category: CATEGORIES[0]!.key, badge: "", bonus: "", notes: "", url: "", status: "active" } })} />}

        <ul className="mt-6 divide-y rounded-md border bg-card">
          {filtered.length === 0 && <li className="p-6 text-center font-mono text-sm text-muted-foreground">no matches</li>}
          {filtered.map(({ p, idx }) => (
            <Row
              key={idx}
              p={p}
              admin={admin}
              onEdit={() => setEditing({ idx, p: { ...p } })}
              onToggle={() => update(items.map((x, i) => (i === idx ? { ...x, status: x.status === "active" ? "dead" : "active" } : x)))}
              onDelete={() => confirm(`Delete ${p.name}?`) && update(items.filter((_, i) => i !== idx))}
            />
          ))}
        </ul>
        <p className="mt-6 text-center font-mono text-xs text-muted-foreground">Bonuses change often — verify before relying on them.</p>
      </div>

      {loginOpen && <Login onClose={() => setLoginOpen(false)} onOk={() => { setAdmin(true); setLoginOpen(false); }} />}
      {editing && (
        <Editor
          initial={editing.p}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            update(editing.idx < 0 ? [p, ...items] : items.map((x, i) => (i === editing.idx ? p : x)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Row({ p, admin, onEdit, onToggle, onDelete }: { p: Provider; admin: boolean; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const long = p.notes.length > 90;
  const muted = p.status !== "active";
  return (
    <li className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-medium ${muted ? "text-muted-foreground" : ""}`}>{p.name}</span>
          {p.badge && <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">{p.badge}</span>}
          <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_STYLE[p.status]}`}>● {STATUS_LABEL[p.status]}</span>
        </div>
        {p.notes && (
          <p className="mt-1 text-sm text-muted-foreground">
            {long && !open ? p.notes.slice(0, 90).trimEnd() + "…" : p.notes}
            {long && (
              <button onClick={() => setOpen(!open)} className="ml-1 font-mono text-xs text-primary hover:underline">
                {open ? "Show less" : "See more"}
              </button>
            )}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2 font-mono text-xs">
        {admin && (
          <>
            <button className="btn" onClick={onToggle}>{p.status === "active" ? "mark dead" : "mark active"}</button>
            <button className="btn" onClick={onEdit}>edit</button>
            <button className="btn text-destructive" onClick={onDelete}>del</button>
          </>
        )}
        {p.url ? (
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90">
            open ↗
          </a>
        ) : (
          <span className="px-3 py-1.5 text-muted-foreground">no link</span>
        )}
      </div>
    </li>
  );
}

function AdminBar({ items, update, onAdd }: { items: Provider[]; update: (p: Provider[]) => void; onAdd: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const exportJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "providers.json"; a.click(); URL.revokeObjectURL(url);
  };
  return (
    <div className="mt-4 flex flex-wrap gap-2 rounded-md border border-dashed p-3 font-mono text-xs">
      <span className="py-1.5 text-muted-foreground">admin:</span>
      <button className="btn" onClick={onAdd}>+ add</button>
      <button className="btn" onClick={exportJson}>export json</button>
      <button className="btn" onClick={() => fileRef.current?.click()}>import json</button>
      <button className="btn" onClick={async () => { const p = prompt("New passcode"); if (p) { await setPass(p); alert("Passcode updated"); } }}>change passcode</button>
      <button className="btn" onClick={() => { if (confirm("Reset to original dataset?")) { resetProviders(); update(SEED); } }}>reset</button>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={async (e) => {
        const f = e.target.files?.[0]; if (!f) return;
        try { const d = JSON.parse(await f.text()); if (!Array.isArray(d)) throw 0; update(d); } catch { alert("Invalid JSON file"); }
        e.target.value = "";
      }} />
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Login({ onClose, onOk }: { onClose: () => void; onOk: () => void }) {
  const [v, setV] = useState(""); const [err, setErr] = useState(false);
  return (
    <Modal onClose={onClose}>
      <form onSubmit={async (e) => { e.preventDefault(); (await checkPass(v)) ? onOk() : setErr(true); }}>
        <h2 className="font-mono text-sm font-semibold">admin passcode</h2>
        <input autoFocus type="password" value={v} onChange={(e) => { setV(e.target.value); setErr(false); }} className="field mt-3" />
        {err && <p className="mt-2 font-mono text-xs text-destructive">wrong passcode</p>}
        <div className="mt-4 flex justify-end gap-2 font-mono text-xs">
          <button type="button" className="btn" onClick={onClose}>cancel</button>
          <button className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">unlock</button>
        </div>
      </form>
    </Modal>
  );
}

function Editor({ initial, onSave, onClose }: { initial: Provider; onSave: (p: Provider) => void; onClose: () => void }) {
  const [p, setP] = useState(initial);
  const set = (k: keyof Provider) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setP({ ...p, [k]: e.target.value });
  return (
    <Modal onClose={onClose}>
      <form className="space-y-3 font-mono text-xs" onSubmit={(e) => { e.preventDefault(); if (p.name.trim()) onSave({ ...p, bonus: p.bonus || p.badge }); }}>
        <h2 className="text-sm font-semibold">{initial.name ? "edit provider" : "new provider"}</h2>
        <label className="block">name<input required className="field" value={p.name} onChange={set("name")} /></label>
        <label className="block">credit badge<input className="field" value={p.badge} onChange={set("badge")} placeholder="$20 + Check-in" /></label>
        <label className="block">notes<textarea rows={3} className="field" value={p.notes} onChange={set("notes")} /></label>
        <label className="block">url<input className="field" value={p.url} onChange={set("url")} /></label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">category<select className="field" value={p.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select></label>
          <label className="block">status<select className="field" value={p.status} onChange={set("status")}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn" onClick={onClose}>cancel</button>
          <button className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">save</button>
        </div>
      </form>
    </Modal>
  );
}

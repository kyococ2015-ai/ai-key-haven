import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown, ExternalLink, Grid2X2, List, MessageSquareText, Moon, Search, Shield, Sun,
} from "lucide-react";
import {
  CATEGORIES, STATUSES, SEED, loadProviders, saveProviders, resetProviders,
  setPass, linkLabel, type Provider, type Status,
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
  active: "bg-success/12 text-success",
  dead: "bg-destructive/12 text-destructive",
  unconfirmed: "bg-warning/12 text-warning",
  fake: "bg-muted text-muted-foreground line-through",
};
const STATUS_LABEL: Record<Status, string> = {
  active: "Active", dead: "Dead", unconfirmed: "Unconfirmed", fake: "Fake",
};
type ViewMode = "list" | "grid";

function Index() {
  const [items, setItems] = useState<Provider[]>(SEED);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [dark, setDark] = useState(true);
  const [view, setView] = useState<ViewMode>("list");
  const [admin, setAdmin] = useState(false);
  const [editing, setEditing] = useState<{ idx: number; p: Provider } | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setItems(loadProviders());
    setDark(localStorage.getItem("fai-theme") !== "light");
    setView(localStorage.getItem("fai-view") === "list" ? "list" : "grid");
    setAdmin(sessionStorage.getItem("fai-admin-session") === "active");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        window.location.href = "/admin";
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const update = (next: Provider[]) => { setItems(next); saveProviders(next); };
  const changeView = (next: ViewMode) => { setView(next); localStorage.setItem("fai-view", next); };
  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return items.map((p, idx) => ({ p, idx }))
      .filter(({ p }) => cat === "all" || p.category === cat)
      .filter(({ p }) => !search || [p.name, p.notes, p.bonus, p.badge, p.url, ...p.urls, ...p.linkLabels].join(" ").toLowerCase().includes(search));
  }, [items, q, cat]);
  const counts = useMemo(() => {
    const result: Record<string, number> = { all: items.length };
    items.forEach((p) => { result[p.category] = (result[p.category] ?? 0) + 1; });
    return result;
  }, [items]);
  const grouped = cat === "all" && !q.trim();
  const groups = useMemo(() => CATEGORIES.map((category) => ({
    ...category, rows: filtered.filter(({ p }) => p.category === category.key),
  })).filter((group) => group.rows.length), [filtered]);

  const renderProvider = (p: Provider, idx: number) => (
    <ProviderItem
      key={`${p.name}-${idx}`}
      p={p}
      view={view}
      admin={admin}
      onEdit={() => setEditing({ idx, p: { ...p, urls: [...p.urls], linkLabels: [...p.linkLabels] } })}
      onToggle={() => update(items.map((item, i) => i === idx ? { ...item, status: item.status === "active" ? "dead" : "active" } : item))}
      onDelete={() => confirm(`Delete ${p.name}?`) && update(items.filter((_, i) => i !== idx))}
    />
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-11">
        <header className="border-b pb-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase text-primary">Curated developer directory</p>
              <h1 className="mt-2 font-mono text-2xl font-semibold sm:text-3xl"><span className="text-primary">$</span> free-ai-keys</h1>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Free AI API credits, routers and coding tools. {items.filter((p) => p.status === "active").length} currently active.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Link to="/discussion" search={{ topic: "All providers" }} className="icon-btn" aria-label="Discussion" title="Discussion"><MessageSquareText className="size-4" /></Link>
              <button
                className="icon-btn"
                onClick={() => { const next = !dark; setDark(next); localStorage.setItem("fai-theme", next ? "dark" : "light"); }}
                aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
                title={dark ? "Light theme" : "Dark theme"}
              >
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
            </div>
          </div>
        </header>

        <section className="sticky top-0 z-20 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <span className="sr-only">Search providers</span>
              <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search name, model, keyword or notes…" className="h-10 w-full rounded-md border bg-card pl-10 pr-4 font-mono text-sm outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <div className="flex h-10 shrink-0 rounded-md border bg-card p-1" aria-label="View mode">
              <button onClick={() => changeView("list")} className={`view-btn ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`} aria-label="List view" title="List view"><List className="size-4" /></button>
              <button onClick={() => changeView("grid")} className={`view-btn ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`} aria-label="Grid view" title="Grid view"><Grid2X2 className="size-4" /></button>
            </div>
          </div>
          <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1 font-mono text-xs" aria-label="Provider categories">
            {[{ key: "all", label: "All" }, ...CATEGORIES].map((category) => (
              <button key={category.key} onClick={() => setCat(category.key)} className={`shrink-0 rounded-md border px-3 py-1.5 transition-colors ${cat === category.key ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent"}`}>
                {category.label} <span className="opacity-60">{counts[category.key] ?? 0}</span>
              </button>
            ))}
          </nav>
        </section>

        {admin && <AdminBar items={items} update={update} onAdd={() => setEditing({ idx: -1, p: emptyProvider() })} onExit={() => { sessionStorage.removeItem("fai-admin-session"); setAdmin(false); }} />}

        {grouped ? (
          <div className="mt-3 divide-y border-b">
            {groups.map((group) => {
              const isCollapsed = collapsed[group.key] ?? false;
              return (
                <section key={group.key} className="py-3">
                  <div className="flex items-center gap-2">
                    <button className="flex min-w-0 flex-1 items-center gap-3 py-2 text-left" onClick={() => setCollapsed((current) => ({ ...current, [group.key]: !isCollapsed }))} aria-expanded={!isCollapsed}>
                      <ChevronDown className={`size-4 shrink-0 text-primary transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                      <h2 className="font-mono text-sm font-semibold">{group.label}</h2>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{group.rows.length}</span>
                    </button>
                    <Link to="/discussion" search={{ topic: group.label }} className="icon-btn" aria-label={`Discuss ${group.label}`} title="Discuss or report"><MessageSquareText className="size-4" /></Link>
                  </div>
                  {!isCollapsed && <div className={view === "grid" ? "grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3" : "divide-y pt-1"}>{group.rows.map(({ p, idx }) => renderProvider(p, idx))}</div>}
                </section>
              );
            })}
          </div>
        ) : (
          <section className={view === "grid" ? "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "mt-6 divide-y border-y"}>
            {filtered.length ? filtered.map(({ p, idx }) => renderProvider(p, idx)) : <p className="col-span-full py-12 text-center font-mono text-sm text-muted-foreground">No matches</p>}
          </section>
        )}

        <footer className="mt-10 flex flex-col justify-between gap-4 border-t pt-5 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>Bonuses change often — verify before relying on them.</p>
          <div className="flex items-center gap-4">
            <Link to="/discussion" search={{ topic: "All providers" }} className="inline-flex items-center gap-1.5 hover:text-foreground"><MessageSquareText className="size-3.5" /> Discussion</Link>
            <Link to="/admin" className="inline-flex items-center gap-1.5 hover:text-foreground"><Shield className="size-3.5" /> Admin</Link>
          </div>
        </footer>
      </div>

      {editing && <Editor initial={editing.p} onClose={() => setEditing(null)} onSave={(provider) => { update(editing.idx < 0 ? [provider, ...items] : items.map((item, i) => i === editing.idx ? provider : item)); setEditing(null); }} />}
    </main>
  );
}

function ProviderItem({ p, view, admin, onEdit, onToggle, onDelete }: { p: Provider; view: ViewMode; admin: boolean; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const long = p.notes.length > 90;
  const muted = p.status !== "active";
  const discussionLink = <Link to="/discussion" search={{ topic: p.name }} className="icon-btn" aria-label={`Discuss or report ${p.name}`} title="Discuss or report"><MessageSquareText className="size-4" /></Link>;
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-medium ${muted ? "text-muted-foreground" : ""}`}>{p.name}</h3>
          {p.badge && <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary" title={p.bonus}>{p.badge}</span>}
          <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] uppercase ${STATUS_STYLE[p.status]}`}>● {STATUS_LABEL[p.status]}</span>
        </div>
        {p.notes && <p className="mt-2 text-sm leading-6 text-muted-foreground">{long && !expanded ? `${p.notes.slice(0, 90).trimEnd()}…` : p.notes}{long && <button onClick={() => setExpanded(!expanded)} className="ml-1 font-mono text-xs text-primary hover:underline">{expanded ? "Show less" : "See more"}</button>}</p>}
        {view === "list" && discussionLink}
      </div>
      <div className={`flex shrink-0 flex-wrap gap-2 ${view === "grid" ? "mt-5" : "sm:justify-end"}`}>
        {admin && <><button className="btn" onClick={onToggle}>{p.status === "active" ? "mark dead" : "mark active"}</button><button className="btn" onClick={onEdit}>edit</button><button className="btn text-destructive" onClick={onDelete}>del</button></>}
        {p.urls.length ? p.urls.map((url, index) => (
          <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-mono text-xs hover:opacity-90 ${index === 0 ? "bg-primary text-primary-foreground" : "border hover:bg-accent"}`}>
            {p.linkLabels[index] || (p.urls.length === 1 ? "Open" : linkLabel(url, index))}<ExternalLink className="size-3" />
          </a>
        )) : <span className="px-3 py-1.5 font-mono text-xs text-muted-foreground">No link</span>}
        {view === "grid" && discussionLink}
      </div>
    </>
  );
  return view === "grid" ? <article className="flex min-h-48 flex-col justify-between rounded-md border bg-card p-4">{content}</article> : <article className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-5">{content}</article>;
}

function emptyProvider(): Provider {
  return { name: "", category: CATEGORIES[0]?.key ?? "", badge: "", bonus: "", notes: "", url: "", urls: [], linkLabels: [], status: "active" };
}

function AdminBar({ items, update, onAdd, onExit }: { items: Provider[]; update: (items: Provider[]) => void; onAdd: () => void; onExit: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const exportJson = () => { const url = URL.createObjectURL(new Blob([JSON.stringify(items, null, 2)], { type: "application/json" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "providers.json"; anchor.click(); URL.revokeObjectURL(url); };
  return <div className="mt-5 flex flex-wrap items-center gap-2 border-y border-dashed py-3 font-mono text-xs"><span className="mr-1 text-primary">admin</span><button className="btn" onClick={onAdd}>+ add</button><button className="btn" onClick={exportJson}>export json</button><button className="btn" onClick={() => fileRef.current?.click()}>import json</button><button className="btn" onClick={async () => { const value = prompt("New passcode"); if (value) { await setPass(value); alert("Passcode updated"); } }}>change passcode</button><button className="btn" onClick={() => { if (confirm("Reset to original dataset?")) { resetProviders(); update(SEED); } }}>reset</button><button className="btn ml-auto" onClick={onExit}>exit</button><input ref={fileRef} type="file" accept="application/json" hidden onChange={async (event) => { const file = event.target.files?.[0]; if (!file) return; try { const data: unknown = JSON.parse(await file.text()); if (!Array.isArray(data)) throw new Error(); update(data); } catch { alert("Invalid JSON file"); } event.target.value = ""; }} /></div>;
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" onClick={onClose}><div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-lg" onClick={(event) => event.stopPropagation()}>{children}</div></div>;
}

function Editor({ initial, onSave, onClose }: { initial: Provider; onSave: (provider: Provider) => void; onClose: () => void }) {
  const [provider, setProvider] = useState(initial);
  const [links, setLinks] = useState(initial.urls.map((url, index) => `${initial.linkLabels[index] ? `${initial.linkLabels[index]} | ` : ""}${url}`).join("\n"));
  const set = (key: keyof Provider) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setProvider({ ...provider, [key]: event.target.value });
  const submit = (event: React.FormEvent) => { event.preventDefault(); const parsed = links.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => { const [possibleLabel, ...rest] = line.split("|"); return rest.length ? { label: (possibleLabel ?? "").trim(), url: rest.join("|").trim() } : { label: "", url: line }; }).filter((item) => item.url); if (provider.name.trim()) onSave({ ...provider, urls: parsed.map((item) => item.url), linkLabels: parsed.map((item) => item.label), url: parsed[0]?.url ?? "", bonus: provider.bonus || provider.badge }); };
  return <Modal onClose={onClose}><form className="space-y-3 font-mono text-xs" onSubmit={submit}><h2 className="text-sm font-semibold">{initial.name ? "edit provider" : "new provider"}</h2><label className="block">name<input required className="field" value={provider.name} onChange={set("name")} /></label><label className="block">credit badge<input className="field" value={provider.badge} onChange={set("badge")} placeholder="$20 + Check-in" /></label><label className="block">notes<textarea rows={3} className="field" value={provider.notes} onChange={set("notes")} /></label><label className="block">links (optional: Label | URL)<textarea rows={4} className="field" value={links} onChange={(event) => setLinks(event.target.value)} placeholder={"Main | https://…\nBackup | https://…"} /></label><div className="grid grid-cols-2 gap-2"><label className="block">category<select className="field" value={provider.category} onChange={set("category")}>{CATEGORIES.map((category) => <option key={category.key} value={category.key}>{category.label}</option>)}</select></label><label className="block">status<select className="field" value={provider.status} onChange={set("status")}>{STATUSES.map((status) => <option key={status} value={status}>{STATUS_LABEL[status]}</option>)}</select></label></div><div className="flex justify-end gap-2 pt-2"><button type="button" className="btn" onClick={onClose}>cancel</button><button className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">save</button></div></form></Modal>;
}

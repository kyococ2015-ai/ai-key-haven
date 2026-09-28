import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { CATEGORIES } from "@/lib/providers";

export const Route = createFileRoute("/discussion")({
  validateSearch: (search: Record<string, unknown>) => ({
    topic: typeof search.topic === "string" ? search.topic : "All providers",
  }),
  head: () => ({
    meta: [
      { title: "Discussion & Reports — free-ai-keys" },
      { name: "description", content: "Discuss providers and report outdated links in the free AI credits directory." },
      { property: "og:title", content: "Discussion & Reports — free-ai-keys" },
      { property: "og:description", content: "Discuss providers and report outdated links in the free AI credits directory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Discussion,
});

function Discussion() {
  const { topic } = Route.useSearch();

  useEffect(() => {
    const existing = document.querySelector('script[data-open-remark-script]');
    if (existing) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://open-remark.zeon.studio/embed.js";
    script.dataset.openRemarkScript = "true";
    document.body.appendChild(script);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Directory
        </Link>
        <header className="mt-8 border-b pb-6">
          <div className="flex items-center gap-3">
            <MessageSquareText className="size-6 text-primary" />
            <h1 className="font-mono text-2xl font-semibold">Discussion & reports</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Share updates, ask about a provider, or report a broken link.</p>
        </header>

        <nav className="my-6 flex flex-wrap gap-2" aria-label="Discussion topic">
          {["All providers", ...CATEGORIES.map((category) => category.label)].map((label) => (
            <Link
              key={label}
              to="/discussion"
              search={{ topic: label }}
              className={`rounded-md border px-3 py-1.5 font-mono text-xs ${topic === label ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <section className="border-t pt-6" aria-label={`Comments about ${topic}`}>
          <p className="mb-4 font-mono text-xs uppercase text-muted-foreground">Topic: {topic}</p>
          <div data-open-remark data-site-key="cmukver0n000104l0fgy0el55" />
        </section>
      </div>
    </main>
  );
}
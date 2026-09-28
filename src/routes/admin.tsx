import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { checkPass } from "@/lib/providers";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Access — free-ai-keys" },
      { name: "description", content: "Owner access for managing the free AI provider directory." },
      { property: "og:title", content: "Admin Access — free-ai-keys" },
      { property: "og:description", content: "Owner access for managing the free AI provider directory." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAccess,
});

function AdminAccess() {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!(await checkPass(passcode))) {
      setError(true);
      return;
    }
    sessionStorage.setItem("fai-admin-session", "active");
    await navigate({ to: "/" });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-sm border-y py-8">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Directory
        </Link>
        <div className="mt-8 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <LockKeyhole className="size-5" />
        </div>
        <h1 className="mt-4 font-mono text-xl font-semibold">Admin access</h1>
        <p className="mt-2 text-sm text-muted-foreground">Enter the owner passcode to manage providers.</p>
        <form className="mt-6" onSubmit={submit}>
          <label className="font-mono text-xs" htmlFor="passcode">Passcode</label>
          <input
            id="passcode"
            type="password"
            value={passcode}
            onChange={(event) => { setPasscode(event.target.value); setError(false); }}
            className="field"
          />
          {error && <p className="mt-2 font-mono text-xs text-destructive">Wrong passcode</p>}
          <button className="mt-4 w-full rounded-md bg-primary px-4 py-2 font-mono text-sm text-primary-foreground hover:opacity-90">
            Unlock directory
          </button>
        </form>
      </section>
    </main>
  );
}
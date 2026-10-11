import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, PageHeader } from "@/components/readmit/ui";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — NEXCARE AI" },
      { name: "description", content: "Sign in to save risk assessments to your NEXCARE AI record." },
      { property: "og:title", content: "Sign in — NEXCARE AI" },
      { property: "og:description", content: "Sign in to save risk assessments to your NEXCARE AI record." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (!data.session) { toast.success("Check your email to confirm your account, then sign in."); setMode("in"); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await nav({ to: "/assess" });
    } catch (err) { toast.error(err instanceof Error ? err.message : "Something went wrong."); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <PageHeader eyebrow="Account" title={mode === "in" ? "Sign in" : "Create account"} description="Accounts let you save assessments to a private record. Only you can see your saved encounters. Use synthetic or demo data only — this is a prototype." />
      <Card className="max-w-md">
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-xs font-semibold">Email
            <input className="field mt-1.5" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block text-xs font-semibold">Password
            <input className="field mt-1.5" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button disabled={busy} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-70">{mode === "in" ? "Sign in" : "Create account"}</button>
          <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-xs font-semibold text-primary">
            {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
          </button>
        </form>
      </Card>
    </div>
  );
}

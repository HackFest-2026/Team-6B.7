import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listAssessments, deleteAssessment } from "@/lib/readmit.functions";
import { Card, PageHeader, RiskBadge } from "@/components/readmit/ui";
import type { Tier } from "@/lib/model";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Saved Assessments — NEXCARE AI" },
      { name: "description", content: "Your saved demo readmission risk assessments." },
      { property: "og:title", content: "Saved Assessments — NEXCARE AI" },
      { property: "og:description", content: "Your saved demo readmission risk assessments." },
    ],
  }),
  component: HistoryPage,
});

type Row = Awaited<ReturnType<typeof listAssessments>>[number];

function HistoryPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    try { setRows(await listAssessments()); setErr(null); } catch (e) { setErr(e instanceof Error ? e.message : "Failed to load"); }
  };
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      if (data.session) void load();
    });
  }, []);

  const remove = async (id: string) => {
    try { await deleteAssessment({ data: { id } }); setRows((r) => r.filter((x) => x.id !== id)); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Could not delete"); }
  };

  return (
    <div>
      <PageHeader eyebrow="Follow-up" title="Saved assessments" description="Assessments you saved from the Patient Risk page. Stored privately in your account." />
      {signedIn === false && (
        <Card><p className="text-sm">Sign in to see your saved assessments. <Link to="/auth" className="font-semibold text-primary">Sign in</Link></p></Card>
      )}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {signedIn && rows.length === 0 && !err && <Card><p className="text-sm text-muted-foreground">Nothing saved yet. Run an assessment and click “Save to my record”.</p></Card>}
      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{r.label}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()} · {r.readiness} · {r.priority}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="num text-lg font-bold">{(Number(r.probability) * 100).toFixed(1)}%</span>
                <RiskBadge tier={r.tier as Tier} />
                <button onClick={() => remove(r.id)} aria-label="Delete" className="rounded-md p-2 text-muted-foreground hover:bg-muted"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

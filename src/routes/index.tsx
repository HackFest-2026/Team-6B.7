import { createFileRoute, Link } from "@tanstack/react-router";
import { Gauge, Target, Scale, ArrowRight, Database, Brain, Sparkles, ClipboardList, CalendarCheck, Eye, Clock } from "lucide-react";
import { EmptyState } from "@/components/readmit/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXCARE AI — Readmission Risk Command Center" },
      { name: "description", content: "Identify high-risk patients before discharge — and understand why. Prototype readmission-risk dashboard." },
      { property: "og:title", content: "NEXCARE AI — Readmission Risk Command Center" },
      { property: "og:description", content: "Identify high-risk patients before discharge — and understand why." },
    ],
  }),
  component: Overview,
});

const journey = [
  { label: "Data", icon: Database }, { label: "AI", icon: Brain }, { label: "Risk", icon: Gauge },
  { label: "Explanation", icon: Sparkles }, { label: "Intervention", icon: ClipboardList }, { label: "Follow-up", icon: CalendarCheck },
];
const why = [
  { t: "Earlier identification", d: "Flag high-risk encounters while the patient is still on the ward.", icon: Clock },
  { t: "Explainable predictions", d: "Every score shows the factors that pushed it up or down.", icon: Eye },
  { t: "Targeted interventions", d: "Risk tier maps to a concrete, reviewable discharge plan.", icon: ClipboardList },
  { t: "Fairness monitoring", d: "Performance tracked across age, gender and race.", icon: Scale },
  { t: "Data-driven discharge planning", d: "Allocate follow-up capacity where it matters most.", icon: Target },
];

function Overview() {
  return (
    <div className="space-y-6">
      <section className="hero-surface relative overflow-hidden rounded-2xl p-6 md:p-10">
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy-foreground/70">NEXCARE AI · Predict. Explain. Prevent.</p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-5xl">Identify high-risk patients before discharge — and understand why.</h1>
          <p className="mt-4 max-w-xl text-sm text-navy-foreground/75 md:text-base">Readmission risk scoring for diabetic inpatient encounters, with transparent explanations, intervention planning and built-in fairness monitoring.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/assess" className="inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2.5 text-sm font-semibold text-navy transition hover:bg-card/90">Assess a patient <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/models" className="inline-flex items-center gap-2 rounded-lg border border-navy-foreground/25 px-4 py-2.5 text-sm font-semibold text-navy-foreground transition hover:bg-navy-foreground/10">Model performance</Link>
          </div>
        </div>
        <div className="relative z-10 mt-8 flex flex-wrap items-center gap-2">
          {journey.map((j, i) => (
            <div key={j.label} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-foreground/10 px-3 py-1.5 text-xs font-semibold"><j.icon className="h-3.5 w-3.5" />{j.label}</span>
              {i < journey.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-navy-foreground/50" />}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[40px] border-navy-foreground/5" />
        <div className="pointer-events-none absolute -bottom-32 right-24 h-72 w-72 rounded-full border-[30px] border-navy-foreground/5" />
      </section>

      <EmptyState title="No hospital data connected yet" description="Patient counts, risk charts and model results will appear here once a trained model and real hospital data are connected." />

      <section>
        <h2 className="mb-3 text-lg font-bold">Why NEXCARE AI?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {why.map((w, i) => (
            <div key={w.t} className="card-surface p-4">
              <div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-lg bg-info-soft text-primary"><w.icon className="h-4 w-4" /></span><span className="num text-xs text-muted-foreground">0{i + 1}</span></div>
              <p className="mt-3 text-sm font-bold">{w.t}</p>
              <p className="mt-1 text-xs text-muted-foreground">{w.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

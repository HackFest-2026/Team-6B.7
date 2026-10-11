import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/readmit/ui";

export const Route = createFileRoute("/fairness")({
  head: () => ({
    meta: [
      { title: "Fairness & governance — NEXCARE AI" },
      { name: "description", content: "Model behaviour broken down by age, gender and race." },
      { property: "og:title", content: "Fairness & governance — NEXCARE AI" },
      { property: "og:description", content: "Model behaviour broken down by age, gender and race." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Governance" title="Fairness & governance" description="Model behaviour broken down by age, gender and race." />
      <EmptyState title="No data yet" description="Fairness results will appear here once a trained model is evaluated on real data." />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/readmit/ui";

export const Route = createFileRoute("/models")({
  head: () => ({
    meta: [
      { title: "Model performance — NEXCARE AI" },
      { name: "description", content: "Compare readmission model configurations on accuracy, precision, recall and AUC." },
      { property: "og:title", content: "Model performance — NEXCARE AI" },
      { property: "og:description", content: "Compare readmission model configurations on accuracy, precision, recall and AUC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Evaluation" title="Model performance" description="Compare readmission model configurations on accuracy, precision, recall and AUC." />
      <EmptyState title="No data yet" description="Model results will appear here once trained models are connected." />
    </div>
  );
}

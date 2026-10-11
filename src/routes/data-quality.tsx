import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/readmit/ui";

export const Route = createFileRoute("/data-quality")({
  head: () => ({
    meta: [
      { title: "Data quality — NEXCARE AI" },
      { name: "description", content: "Missing values, outliers, encoding and feature engineering for the hospital dataset." },
      { property: "og:title", content: "Data quality — NEXCARE AI" },
      { property: "og:description", content: "Missing values, outliers, encoding and feature engineering for the hospital dataset." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Preprocessing" title="Data quality" description="Missing values, outliers, encoding and feature engineering for the hospital dataset." />
      <EmptyState title="No data yet" description="Data quality results will appear here once the real dataset has been processed." />
    </div>
  );
}

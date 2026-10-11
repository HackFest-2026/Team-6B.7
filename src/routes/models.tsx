import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Metrics = {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
};

type ModelsResponse = {
  models: Record<string, Metrics>;
  loaded_models: string[];
};

export const Route = createFileRoute("/models")({
  component: Page,
});

function Page() {
  const [modelData, setModelData] = useState<ModelsResponse | null>(null);
  const [modelError, setModelError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/models`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        return response.json();
      })
      .then((result: ModelsResponse) => setModelData(result))
      .catch(() =>
        setModelError(
          "Cannot connect to backend. Check that the Python API is running on port 8000."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="space-y-6 p-6">
      <header>
        <p className="text-sm text-muted-foreground">NEXCARE AI</p>
        <h1 className="text-3xl font-bold">Model Performance</h1>
        <p className="mt-2 text-muted-foreground">
          Comparison of machine learning models for 30-day hospital
          readmission prediction.
        </p>
      </header>

      {loading && <p>Loading model results...</p>}

      {modelError && (
        <div className="rounded-lg border border-red-300 p-4">
          <p>{modelError}</p>
          <button
            className="mt-3 rounded bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {modelData && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border p-5">
              <p className="text-sm text-muted-foreground">Total models</p>
              <p className="mt-2 text-3xl font-bold">
                {Object.keys(modelData.models).length}
              </p>
            </article>

            <article className="rounded-xl border p-5">
              <p className="text-sm text-muted-foreground">Models loaded</p>
              <p className="mt-2 text-3xl font-bold">
                {modelData.loaded_models.length}
              </p>
            </article>

            <article className="rounded-xl border p-5">
              <p className="text-sm text-muted-foreground">Prediction target</p>
              <p className="mt-2 text-xl font-bold">30 days</p>
            </article>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">Performance comparison</h2>

            {Object.entries(modelData.models).map(([name, metrics]) => (
              <article key={name} className="rounded-xl border p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">{name}</h3>
                  <span className="rounded-full bg-muted px-3 py-1 text-sm">
                    {modelData.loaded_models.includes(name)
                      ? "Loaded"
                      : "Not loaded"}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                  {[
                    ["Accuracy", metrics.accuracy],
                    ["Precision", metrics.precision],
                    ["Recall", metrics.recall],
                    ["F1 Score", metrics.f1_score],
                    ["ROC-AUC", metrics.roc_auc],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">
                        {label}
                      </p>
                      <p className="mt-2 text-xl font-bold">
                        {(Number(value) * 100).toFixed(2)}%
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <p className="rounded-lg border p-4 text-sm text-muted-foreground">
            For educational demonstration only. These predictions are not
            validated for clinical decision-making.
          </p>
        </>
      )}
    </main>
  );
}

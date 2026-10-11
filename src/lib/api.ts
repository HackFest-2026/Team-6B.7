import {
  scorePatient,
  type Patient,
  type Prediction,
  type Factor,
  type Tier,
} from "./model";

const API = import.meta.env["VITE_READMIT_API_URL"] as
  | string
  | undefined;

export type ModelName =
  | "Logistic Regression"
  | "Decision Tree"
  | "Random Forest";

type BackendPrediction = {
  model: string;
  readmission_within_30_days: boolean;
  probability: number;
  threshold: number;
  disclaimer: string;
};

type BackendModelMetrics = {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: number[][];
};

type BackendModelsResponse = {
  models: Record<string, BackendModelMetrics>;
  loaded_models: string[];
};

async function post<T>(
  path: string,
  body: unknown,
): Promise<T> {
  if (!API) {
    throw new Error("VITE_READMIT_API_URL is not configured.");
  }

  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(
      `${path} failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  if (!API) {
    throw new Error("VITE_READMIT_API_URL is not configured.");
  }

  const response = await fetch(`${API}${path}`);

  if (!response.ok) {
    throw new Error(
      `${path} failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Convert the NexCare AI form into the eight numerical features
 * accepted by the current Python training pipeline.
 */
function toBackendPatient(patient: Patient) {
  return {
    time_in_hospital: patient.timeInHospital,
    num_lab_procedures: patient.numLabProcedures,
    num_procedures: patient.numProcedures,
    num_medications: patient.numMedications,
    number_outpatient: patient.numberOutpatient,
    number_emergency: patient.numberEmergency,
    number_inpatient: patient.numberInpatient,
    number_diagnoses: patient.numberDiagnoses,
  };
}

/**
 * Adapt the backend result to the existing frontend Prediction type.
 *
 * Factors are not calculated from the backend model here. They are
 * intentionally empty until genuine model explanations are implemented.
 */
function toFrontendPrediction(
  result: BackendPrediction,
): Prediction {
  const probability = result.probability;

  // These are display categories, not clinical recommendations.
  const tier: Tier =
    probability >= 0.4
      ? "High"
      : probability >= 0.2
        ? "Medium"
        : "Low";

  return {
    probability,
    tier,
    readiness:
      tier === "High"
        ? "Needs intervention"
        : tier === "Medium"
          ? "Ready with support"
          : "Ready for discharge",
    priority:
      tier === "High"
        ? "Urgent follow-up"
        : tier === "Medium"
          ? "Standard follow-up"
          : "Routine follow-up",
    followUpWindow:
      tier === "High"
        ? "Within 48–72 hours"
        : tier === "Medium"
          ? "Within 7 days"
          : "Within 14–30 days",
    factors: [],
    baseRate: 0.1116,
    modelVersion: result.model,
  };
}

/**
 * Predict using the trained Python backend.
 *
 * If the backend is not configured, this falls back to the existing
 * demo scorer. The UI should clearly identify demo results.
 */
export async function predict(
  patient: Patient,
  model: ModelName = "Logistic Regression",
): Promise<Prediction> {
  if (!API) {
    return scorePatient(patient);
  }

  const result = await post<BackendPrediction>("/predict", {
    model,
    patient: toBackendPatient(patient),
  });

  return toFrontendPrediction(result);
}

/** Fetch measured performance metrics for all trained models. */
export async function getModels(): Promise<BackendModelsResponse> {
  return get<BackendModelsResponse>("/models");
}

/** Fetch backend health and loaded-model information. */
export async function getHealth() {
  return get<{
    status: string;
    loaded_models: string[];
  }>("/health");
}

/** Other endpoints are not implemented in the current backend yet. */
export async function getFairness() {
  return get<unknown>("/fairness");
}

export async function getDataQuality() {
  return get<unknown>("/data-quality");
}
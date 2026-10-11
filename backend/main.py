from pathlib import Path
import json

try:
    import joblib  # type: ignore[import-not-found]
except ImportError as exc:
    raise RuntimeError(
        "joblib is required to run this API. Install it with: pip install joblib"
    ) from exc

import pandas as pd  # pyright: ignore[reportMissingModuleSource]

from fastapi import FastAPI, HTTPException  # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel, Field  # pyright: ignore[reportMissingImports]


BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
METRICS_PATH = BASE_DIR / "metrics.json"

FEATURES = [
    "time_in_hospital",
    "num_lab_procedures",
    "num_procedures",
    "num_medications",
    "number_outpatient",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",
]

MODEL_FILES = {
    "Logistic Regression": "logistic_regression.joblib",
    "Decision Tree": "decision_tree.joblib",
    "Random Forest": "random_forest.joblib",
}

app = FastAPI(
    title="NexCare AI API",
    description="Experimental hospital readmission prediction API",
    version="1.0.0",
)

# Development configuration. Restrict this to your actual frontend
# origin before deploying the application publicly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class PatientInput(BaseModel):
    time_in_hospital: int = Field(ge=1, le=14)
    num_lab_procedures: int = Field(ge=0)
    num_procedures: int = Field(ge=0)
    num_medications: int = Field(ge=0)
    number_outpatient: int = Field(ge=0)
    number_emergency: int = Field(ge=0)
    number_inpatient: int = Field(ge=0)
    number_diagnoses: int = Field(ge=1)


class PredictionRequest(BaseModel):
    patient: PatientInput
    model: str = "Logistic Regression"


def load_models():
    loaded = {}

    for name, filename in MODEL_FILES.items():
        path = MODEL_DIR / filename

        if path.exists():
            artifact = joblib.load(path)

            if isinstance(artifact, dict) and "pipeline" in artifact:
                loaded[name] = artifact["pipeline"]
            else:
                loaded[name] = artifact

    return loaded


MODELS = load_models()


@app.get("/")
def root():
    return {
        "name": "NexCare AI API",
        "status": "running",
        "documentation": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "loaded_models": list(MODELS.keys()),
    }


@app.get("/models")
def get_models():
    if not METRICS_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Model metrics file not found. Train the models first.",
        )

    with METRICS_PATH.open("r", encoding="utf-8") as file:
        metrics = json.load(file)

    return {
        "models": metrics,
        "loaded_models": list(MODELS.keys()),
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    if request.model not in MODELS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Model '{request.model}' is unavailable. "
                f"Available models: {list(MODELS.keys())}"
            ),
        )

    patient = request.patient.model_dump()

    # Preserve the exact feature order used during training.
    features = MODELS[request.model].feature_names_in_
    row = pd.DataFrame(
        [[patient[name] for name in features]],
        columns=features,
    )

    model = MODELS[request.model]

    probability = float(model.predict_proba(row)[0, 1])
    prediction = int(model.predict(row)[0])

    return {
        "model": request.model,
        "readmission_within_30_days": bool(prediction),
        "probability": probability,
        "threshold": 0.5,
        "disclaimer": (
            "Experimental prediction for educational purposes. "
            "Not validated for clinical decision-making."
        ),
    }
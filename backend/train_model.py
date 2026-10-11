from pathlib import Path
import json

import pandas as pd  # pyright: ignore[reportMissingModuleSource]
import joblib  # pyright: ignore[reportMissingImports]

from sklearn.model_selection import GroupShuffleSplit  # pyright: ignore[reportMissingModuleSource]
from sklearn.pipeline import Pipeline  # pyright: ignore[reportMissingModuleSource]
from sklearn.impute import SimpleImputer  # pyright: ignore[reportMissingModuleSource]
from sklearn.preprocessing import StandardScaler  # pyright: ignore[reportMissingModuleSource]
from sklearn.linear_model import LogisticRegression  # pyright: ignore[reportMissingModuleSource]
from sklearn.tree import DecisionTreeClassifier  # pyright: ignore[reportMissingModuleSource]
from sklearn.ensemble import RandomForestClassifier  # pyright: ignore[reportMissingModuleSource]

from sklearn.metrics import (  # pyright: ignore[reportMissingModuleSource]
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "diabetic_data.csv"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

print("Loading dataset...")

df = pd.read_csv(DATA_PATH)

required_columns = [
    "patient_nbr",
    "readmitted",
    "time_in_hospital",
    "num_lab_procedures",
    "num_procedures",
    "num_medications",
    "number_outpatient",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",
]

missing = [col for col in required_columns if col not in df.columns]

if missing:
    raise ValueError(f"Missing required columns: {missing}")

# Keep encounters with valid readmission labels.
df = df[df["readmitted"].isin(["<30", ">30", "NO"])].copy()

# Positive class: readmission within 30 days.
y = (df["readmitted"] == "<30").astype(int)

features = [
    "time_in_hospital",
    "num_lab_procedures",
    "num_procedures",
    "num_medications",
    "number_outpatient",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",
]

X = df[features].copy()
groups = df["patient_nbr"]

print(f"Encounters: {len(df):,}")
print(f"Positive cases: {int(y.sum()):,}")
print("Splitting by patient...")

splitter = GroupShuffleSplit(
    n_splits=1,
    test_size=0.20,
    random_state=42,
)

train_idx, test_idx = next(
    splitter.split(X, y, groups=groups)
)

X_train = X.iloc[train_idx]
X_test = X.iloc[test_idx]
y_train = y.iloc[train_idx]
y_test = y.iloc[test_idx]

models = {
    "Logistic Regression": Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42,
        )),
    ]),

    "Decision Tree": Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("classifier", DecisionTreeClassifier(
            max_depth=8,
            class_weight="balanced",
            random_state=42,
        )),
    ]),

    "Random Forest": Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("classifier", RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        )),
    ]),
}

results = {}

for name, model in models.items():
    print(f"\nTraining {name}...")

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": float(
            accuracy_score(y_test, predictions)
        ),
        "precision": float(
            precision_score(y_test, predictions, zero_division=0)
        ),
        "recall": float(
            recall_score(y_test, predictions, zero_division=0)
        ),
        "f1_score": float(
            f1_score(y_test, predictions, zero_division=0)
        ),
        "roc_auc": float(
            roc_auc_score(y_test, probabilities)
        ),
        "confusion_matrix": confusion_matrix(
            y_test, predictions
        ).tolist(),
    }

    filename = name.lower().replace(" ", "_") + ".joblib"

    joblib.dump(
        {
            "pipeline": model,
            "features": features,
            "positive_class": 1,
        },
        MODEL_DIR / filename,
    )

    results[name] = metrics

    print(f"Results for {name}:")
    print(json.dumps(metrics, indent=2))

with open(
    BASE_DIR / "metrics.json",
    "w",
    encoding="utf-8",
) as file:
    json.dump(results, file, indent=2)

print("\nTraining completed successfully.")
print(f"Models saved in: {MODEL_DIR}")
print(f"Metrics saved to: {BASE_DIR / 'metrics.json'}")

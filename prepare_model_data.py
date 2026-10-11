
from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "data" / "diabetic_data_cleaned.csv"
OUTPUT_PATH = BASE_DIR.parent / "data" / "readmission_model_data.csv"


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

print("Loading cleaned dataset...")
df = pd.read_csv(DATA_PATH, low_memory=False)


required = features + ["readmitted"]
missing = [col for col in required if col not in df.columns]

if missing:
    raise ValueError(f"Missing columns: {missing}")

df = df[df["readmitted"].isin(["<30", ">30", "NO"])].copy()

for col in features:
    df[col] = pd.to_numeric(df[col], errors="coerce")

df["readmitted_within_30_days"] = (
    df["readmitted"] == "<30"
).astype("int8")

output_columns = features + [
    "readmitted",
    "readmitted_within_30_days",
]

df[output_columns].to_csv(OUTPUT_PATH, index=False)

print("Export completed!")
print("Rows:", len(df))
print("Features:", len(features))
print("\nTarget counts:")
print(df["readmitted_within_30_days"].value_counts())
print("\nSaved to:", OUTPUT_PATH)

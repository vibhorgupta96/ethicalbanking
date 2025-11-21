"""
Training entry point for the Ethical Banking AI service.

Consumes `External_Cibil_Dataset.xlsx`, engineers features, fits a logistic regression
pipeline, and serializes both the model and representative background samples for SHAP.
"""

from pathlib import Path
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

DATA_PATH = Path("data/External_Cibil_Dataset.xlsx")
MODEL_DIR = Path("ethical_model")
MODEL_PATH = MODEL_DIR / "model.pkl"

TARGET_COLUMN = "Approved_Flag"
APPROVED_LABELS = {"P1"}  # Treated as positive class
REJECTED_LABELS = {"P2"}

CATEGORICAL_FEATURES = [
    "MARITALSTATUS",
    "EDUCATION",
    "GENDER",
    "CC_Flag",
    "PL_Flag",
    "HL_Flag",
    "GL_Flag",
    "last_prod_enq2",
    "first_prod_enq2",
]

NUMERIC_FEATURES = [
    "AGE",
    "NETMONTHLYINCOME",
    "Credit_Score",
    "num_times_delinquent",
    "num_times_60p_dpd",
    "num_std",
    "num_sub",
    "num_dbt",
    "CC_utilization",
    "PL_utilization",
    "time_since_recent_payment",
    "time_since_recent_enq",
]

FEATURE_COLUMNS = CATEGORICAL_FEATURES + NUMERIC_FEATURES


def load_dataset() -> tuple[pd.DataFrame, pd.Series]:
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at {DATA_PATH}. Place External_Cibil_Dataset.xlsx under data/."
        )

    df = pd.read_excel(DATA_PATH)
    df.replace(-99999, pd.NA, inplace=True)

    df = df.dropna(subset=[TARGET_COLUMN])
    df = df[df[TARGET_COLUMN].isin(APPROVED_LABELS | REJECTED_LABELS)].copy()
    df["target"] = df[TARGET_COLUMN].apply(lambda flag: 1 if flag in APPROVED_LABELS else 0)

    missing_features = [col for col in FEATURE_COLUMNS if col not in df.columns]
    if missing_features:
        raise ValueError(f"Missing expected feature columns: {missing_features}")

    X = df[FEATURE_COLUMNS].copy()
    for column in NUMERIC_FEATURES:
        X[column] = pd.to_numeric(X[column], errors="coerce")

    y = df["target"]
    return X, y


def build_pipeline() -> Pipeline:
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_pipeline, CATEGORICAL_FEATURES),
            ("num", numeric_pipeline, NUMERIC_FEATURES),
        ],
        remainder="drop",
    )

    model = LogisticRegression(max_iter=1000, class_weight="balanced")
    return Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])


def build_background_samples(features: pd.DataFrame, sample_size: int = 200) -> pd.DataFrame:
    sample_size = min(sample_size, len(features))
    return features.sample(n=sample_size, random_state=42).reset_index(drop=True)


def train():
    X, y = load_dataset()
    pipeline = build_pipeline()
    pipeline.fit(X, y)

    background = build_background_samples(X)
    artifact = {
        "pipeline": pipeline,
        "feature_columns": FEATURE_COLUMNS,
        "background": background,
    }

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, MODEL_PATH)
    print(f"Model and background samples saved to {MODEL_PATH}")


if __name__ == "__main__":
    train()


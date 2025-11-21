from pathlib import Path
import joblib


class ModelRegistry:
    """
    Thin wrapper around joblib to align with the hackathon plan.
    Holds references to the sklearn pipeline, metadata, and SHAP background samples.
    """

    def __init__(self, model_path: Path):
        self.model_path = model_path
        self.pipeline = None
        self.feature_columns = None
        self.background = None

    def load(self):
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model artifact not found at {self.model_path}. Run modeling/train_model.py first."
            )

        artifact = joblib.load(self.model_path)
        if isinstance(artifact, dict) and "pipeline" in artifact:
            self.pipeline = artifact["pipeline"]
            self.feature_columns = artifact.get("feature_columns")
            self.background = artifact.get("background")
        else:
            # Backwards compatibility if only the pipeline was serialized.
            self.pipeline = artifact
            self.feature_columns = getattr(self.pipeline, "feature_columns", None)
            self.background = None

        return {
            "pipeline": self.pipeline,
            "feature_columns": self.feature_columns,
            "background": self.background,
        }


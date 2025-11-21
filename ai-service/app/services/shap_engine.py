from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
import shap


class ShapEngine:
    def __init__(self, pipeline, feature_columns: list[str], background: Optional[pd.DataFrame]):
        self.pipeline = pipeline
        self.feature_columns = feature_columns or getattr(pipeline, "feature_names_in_", [])
        if not self.feature_columns:
            raise ValueError("Pipeline is missing feature metadata; retrain the model.")

        self.preprocessor = self.pipeline.named_steps.get("preprocessor")
        self.model = self.pipeline.named_steps.get("model")
        if self.preprocessor is None or self.model is None:
            raise ValueError("Pipeline must define 'preprocessor' and 'model' steps.")

        if background is None:
            background = pd.DataFrame([{}], columns=self.feature_columns)
        self.background = background[self.feature_columns].copy()

        self.explainer = None
        self._base_value = None

    def bootstrap(self):
        background_array = self.preprocessor.transform(self.background)
        self.explainer = shap.LinearExplainer(
            self.model,
            background_array,
            feature_perturbation="interventional",
        )

        expected = self.explainer.expected_value
        if isinstance(expected, (list, np.ndarray)):
            self._base_value = float(expected[1] if len(expected) > 1 else expected[0])
        else:
            self._base_value = float(expected)
        return self

    def prepare_features(self, payload: Dict[str, Any]) -> pd.DataFrame:
        row = {col: payload.get(col) for col in self.feature_columns}
        return pd.DataFrame([row], columns=self.feature_columns)

    def explain(self, features_df: pd.DataFrame, top_n: int = 6):
        if self.explainer is None:
            raise RuntimeError("SHAP explainer not initialized. Call bootstrap() first.")

        transformed = self.preprocessor.transform(features_df)
        shap_values = self.explainer.shap_values(transformed)
        if isinstance(shap_values, list):
            shap_vector = shap_values[1][0]
        else:
            shap_vector = shap_values[0]

        feature_names = self.preprocessor.get_feature_names_out()
        contributions = [
            (name, float(value)) for name, value in zip(feature_names, shap_vector)
        ]
        contributions.sort(key=lambda item: abs(item[1]), reverse=True)
        if top_n:
            contributions = contributions[:top_n]
        return dict(contributions)

    @property
    def base_value(self) -> Optional[float]:
        return self._base_value


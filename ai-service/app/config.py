from dataclasses import dataclass
from pathlib import Path
import os


@dataclass
class Settings:
    model_path: Path = Path(os.getenv("MODEL_PATH", "ethical_model/model.pkl"))
    host: str = os.getenv("AI_HOST", "0.0.0.0")
    port: int = int(os.getenv("AI_PORT", "5000"))
    fairguard_parity_threshold: float = float(os.getenv("FAIRGUARD_PARITY_THRESHOLD", "0.15"))
    fairguard_drift_threshold: float = float(os.getenv("FAIRGUARD_DRIFT_THRESHOLD", "0.2"))
    fairguard_window_size: int = int(os.getenv("FAIRGUARD_WINDOW_SIZE", "200"))


settings = Settings()


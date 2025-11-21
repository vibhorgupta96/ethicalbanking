from dataclasses import dataclass
from pathlib import Path
import os


@dataclass
class Settings:
    model_path: Path = Path(os.getenv("MODEL_PATH", "ethical_model/model.pkl"))
    host: str = os.getenv("AI_HOST", "0.0.0.0")
    port: int = int(os.getenv("AI_PORT", "5000"))


settings = Settings()


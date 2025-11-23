from flask import Flask, jsonify

from .config import settings
from .routes.explain import create_blueprint
from .services.fairguard import FairGuardMonitor
from .services.model_registry import ModelRegistry
from .services.shap_engine import ShapEngine


def create_app():
    app = Flask(__name__)

    registry = ModelRegistry(settings.model_path)
    artifact = registry.load()
    pipeline = artifact["pipeline"]
    feature_columns = artifact.get("feature_columns")
    background = artifact.get("background")

    shap_engine = ShapEngine(pipeline, feature_columns, background).bootstrap()
    fairguard_monitor = FairGuardMonitor(
        parity_threshold=settings.fairguard_parity_threshold,
        drift_threshold=settings.fairguard_drift_threshold,
        window_size=settings.fairguard_window_size,
    )
    app.register_blueprint(
        create_blueprint(shap_engine, pipeline, fairguard_monitor)
    )

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    return app


def run():
    app = create_app()
    app.run(host=settings.host, port=settings.port)


if __name__ == "__main__":
    run()


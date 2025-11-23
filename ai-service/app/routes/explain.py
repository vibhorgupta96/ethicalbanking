from flask import Blueprint, jsonify, request

from ..dto import ExplainResponse


def create_blueprint(shap_engine, pipeline, fairguard_monitor):
    blueprint = Blueprint("explain", __name__)

    @blueprint.post("/explain")
    def explain():
        payload = request.get_json(force=True) or {}
        feature_frame = shap_engine.prepare_features(payload)

        prediction = int(pipeline.predict(feature_frame)[0])
        probability = float(pipeline.predict_proba(feature_frame)[0][1])
        shap_values = shap_engine.explain(feature_frame)

        response = ExplainResponse(
            decision="Approved" if prediction == 1 else "Rejected",
            shap_values=shap_values,
            base_value=shap_engine.base_value,
            probability=probability,
        )

        fairguard_status = fairguard_monitor.record_event(
            payload, response.decision, probability, shap_values
        )
        envelope = response.__dict__.copy()
        envelope["fairguard"] = fairguard_status
        return jsonify(envelope)

    @blueprint.get("/monitor/fairguard")
    def fairguard_summary():
        return jsonify(fairguard_monitor.summary())

    return blueprint


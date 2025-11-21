# Ethical Banking AI Service

Flask microservice that loads a scikit-learn pipeline, generates SHAP values, and returns decision explanations for the Java gateway.

## Layout

- `app/` – Flask app, routes, DTOs, and SHAP engine glue code.
- `modeling/train_model.py` – trains on `data/External_Cibil_Dataset.xlsx` and serializes the bundle.
- `data/` – place `External_Cibil_Dataset.xlsx` (or a file with the same schema) here.
- `ethical_model/` – serialized pipeline (`model.pkl`).

## Quick start

```bash
cd ai-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python modeling/train_model.py   # consumes External_Cibil_Dataset.xlsx
python -m app.server
```

The service will boot on `http://localhost:5000` with a `/health` and `/explain` endpoint.

### Expected dataset format

`External_Cibil_Dataset.xlsx` must expose the following columns (case sensitive):

- Target column: `Approved_Flag` with values `P1` (approved) or `P2` (rejected).
- Categorical features: `MARITALSTATUS`, `EDUCATION`, `GENDER`, `CC_Flag`, `PL_Flag`, `HL_Flag`, `GL_Flag`, `last_prod_enq2`, `first_prod_enq2`.
- Numeric features: `AGE`, `NETMONTHLYINCOME`, `Credit_Score`, `num_times_delinquent`, `num_times_60p_dpd`, `num_std`, `num_sub`, `num_dbt`, `CC_utilization`, `PL_utilization`, `time_since_recent_payment`, `time_since_recent_enq`.

If you want to add or rename features, update `modeling/train_model.py` so the feature lists and preprocessing steps stay in sync.


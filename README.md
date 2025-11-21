# Ethical Banking Monorepo

This workspace mirrors the 3-day hackathon plan for the Layer 3 Ethical Banking demo. It contains three independently runnable modules:

| Module | Path | Stack | Notes |
| --- | --- | --- | --- |
| Gateway API | `gateway-service` | Spring Boot 3, JPA, H2 | ZKP-simulated consent ledger, AskAI orchestration, Gemini proxy |
| Frontend | `frontend` | React 18, Vite, Tailwind | Screens for Login, Decision, TrustVault, AskAI |
| AI Service | `ai-service` | Python, Flask, scikit-learn, SHAP | Hosts the trained model and `/explain` endpoint |

## High-level workflow

1. Users authenticate in the React SPA and review decisions (Layer 3).
2. The Spring gateway pulls profile + consent data from H2, hashes payloads to simulate ZKP, and fans out to:
   - `ai-service` for SHAP-backed insights.
   - Gemini API for natural language explanations.
3. Combined responses are returned to the UI.

## Development quick start

```bash
# Gateway
cd gateway-service
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev

# AI Service
cd ai-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.server
```

Each module includes its own README with deeper instructions.


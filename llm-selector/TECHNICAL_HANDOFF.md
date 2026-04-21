# LLM Selector - Technical Handoff

## 1) Project Summary

LLM Selector is a full-stack application for selecting, testing, and estimating costs of LLMs.

Core user workflows:
- Recommend top models from structured requirements.
- Prompt Lab testing across multiple models with side-by-side outputs.
- Cost Calculator for request/day/month projections.

Primary stack:
- Frontend: React + Vite + Tailwind + Zustand
- Backend: FastAPI
- Database: MongoDB
- External providers: OpenRouter (catalog + inference), Artificial Analysis (benchmark enrichment)

---

## 2) Repository Structure

- `frontend/` - React UI
  - `src/pages/` - Screens (`Landing`, `Login`, `Register`, `Dashboard`, `RequirementsForm`, `Results`, `PromptLab`, `Calculator`)
  - `src/components/` - Shared UI components (`Navbar`, `ProtectedRoute`)
  - `src/api/` - API client wrappers
  - `src/store/` - Zustand stores (`authStore`, `formStore`)
- `backend/` - FastAPI API
  - `app/main.py` - app bootstrap, router wiring, CORS
  - `app/routes/` - HTTP route modules
  - `app/services/` - business logic
  - `app/db/mongo.py` - Mongo client + indexes
  - `app/core/` - config/security
  - `modelMap.json` - OpenRouter->AA mapping

---

## 3) Frontend Architecture

## Routing

Configured in `frontend/src/App.jsx`.

Public routes:
- `/` - landing page
- `/login`
- `/register`

Protected routes:
- `/dashboard`
- `/requirements`
- `/results`
- `/prompt-lab`
- `/calculator`

Fallback:
- Authenticated -> `/dashboard`
- Unauthenticated -> `/`

## State Management

- `authStore`:
  - stores JWT token, email, auth helpers
- `formStore`:
  - stores recommendation wizard inputs
  - stores recommendation results + summary

## API Layer

`frontend/src/api/axios.js`:
- base URL `/api`
- request interceptor adds `Authorization: Bearer <token>`
- response interceptor logs out on 401

`frontend/src/api/models.js` exposes:
- `getModels`, `getModel`
- `recommend`, `getHistory`
- `calculate`
- `syncAll`, `syncOpenRouter`, `syncAA`
- `runPromptLab`, `getPromptLabHistory`

---

## 4) Backend Architecture

## App bootstrap

`backend/app/main.py`:
- creates FastAPI app
- configures CORS for local dev origins
- mounts routers:
  - `/api/auth`
  - `/api/models`
  - `/api/recommend`
  - `/api/calculate`
  - `/api/sync`
  - `/api/prompt-lab`
- exposes `/api/health`

## Auth

`backend/app/routes/auth.py`:
- register/login endpoints
- JWT creation/verification via `app/core/security.py`
- `get_current_user` dependency for protected routes

---

## 5) Feature Workflows

## A) Recommendation

Frontend:
1. User fills wizard in `RequirementsForm.jsx`.
2. Submit -> `recommend(payload)`.
3. On success, store results in `formStore` and navigate to `/results`.

Backend (`routes/recommend.py`):
1. Validate request schema.
2. Load all models from Mongo `models`.
3. Rank with `services/scoring.py`.
4. Explain with `services/explanation.py`.
5. Persist run in `history`.
6. Return `user_summary` + `results`.

Scoring (`services/scoring.py`):
- hard filters: budget, features, context, privacy, constraints, etc.
- weighted dimensions:
  - quality
  - speed
  - latency
  - cost
  - context
- returns top 3 ranked models

## B) Prompt Lab

Frontend:
1. Load model list + recent prompt history.
2. Select up to 5 models and configure prompt/system prompt/temp/max tokens.
3. Submit -> `runPromptLab`.
4. Render per-model result cards (status/output/latency/tokens/cost).

Backend (`routes/prompt_lab.py`):
1. Validate request + enforce limits.
2. Resolve selected models from Mongo.
3. Execute per model via `services/inference.py`.
4. Estimate cost from token usage and model pricing.
5. Normalize output text for cleaner JSON display.
6. Persist session in `prompt_tests`.
7. Return session + results.

Inference (`services/inference.py`):
- calls OpenRouter chat completions
- extracts content + usage
- timeout/provider error handling

## C) Calculator

Frontend:
1. Load priced models.
2. Collect token/request inputs.
3. Call `calculate(payload)`.
4. Render per-request/daily/monthly estimates.

Backend:
- `routes/calculator.py` validates request + finds model.
- `services/cost.py` computes deterministic cost outputs.

---

## 6) Data Model (MongoDB)

Collections (from `app/db/mongo.py`):
- `users`
- `models`
- `history`
- `prompt_tests`

Important model fields:
- identity: `id`, `name`, `provider`
- pricing: `input_price`, `output_price`, `blended_price`
- capability flags:
  - `supports_function_calling`
  - `supports_json_mode`
  - `is_multimodal`
  - `is_open_source`
- performance:
  - `intelligence_index`
  - `coding_index`
  - `agentic_index`
  - `tokens_per_second`
  - `ttft`
- constraints metadata:
  - `deployment_constraints`
  - `integration_constraints`
  - `supported_sdks`
  - `regions`

Indexes:
- unique on `users.email`
- unique on `models.id`
- supporting indexes for provider/pricing/context/capability fields
- history + prompt test lookup indexes

---

## 7) Sync Pipeline and Data Freshness

Routes in `routes/sync.py`:
- `/sync/openrouter` - pulls model catalog + pricing/capabilities.
- `/sync/aa` - maps AA benchmark data onto models via `modelMap.json`.
- `/sync/backfill` - fills missing defaults.
- `/sync/all` - runs all steps.

Data dependencies:
- Recommendation quality depends heavily on synced benchmark/capability fields.
- Prompt Lab and Calculator rely on model pricing correctness.

---

## 8) Environment and Configuration

From `app/core/config.py`:
- `MONGO_URI`
- `DB_NAME`
- `JWT_SECRET`, `JWT_ALGORITHM`, `JWT_EXPIRE_MINUTES`
- `AA_API_KEY`
- `OPENROUTER_API_KEY`
- `PROMPTLAB_MAX_MODELS_PER_RUN`
- `PROMPTLAB_MAX_PROMPT_CHARS`
- `PROMPTLAB_MODEL_TIMEOUT_SEC`

Loaded from `.env`.

---

## 9) API Contract Quick Reference

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`

Models:
- `GET /api/models/`
- `GET /api/models/{model_id}`
- `GET /api/models/coverage`

Recommend:
- `POST /api/recommend/`
- `GET /api/recommend/history`

Calculator:
- `POST /api/calculate/`

Prompt Lab:
- `POST /api/prompt-lab/run`
- `GET /api/prompt-lab/history`

Sync:
- `POST /api/sync/openrouter`
- `POST /api/sync/aa`
- `POST /api/sync/backfill`
- `POST /api/sync/all`

Health:
- `GET /api/health`

---

## 10) Runbook (Local Development)

## Backend

1. Create virtual environment.
2. Install requirements:
   - `pip install -r backend/requirements.txt`
3. Configure `.env` in backend root.
4. Start API:
   - `uvicorn app.main:app --reload` (from `backend/`)

## Frontend

1. Install packages:
   - `npm install` (from `frontend/`)
2. Start dev server:
   - `npm run dev`
3. Frontend uses Vite proxy to backend `/api`.

## First-time data setup

After login, run sync:
- Trigger `Sync Models` from dashboard
  or call `POST /api/sync/all`

---

## 11) Known Operational Risks

- Stale/incomplete sync data can degrade recommendation quality.
- Missing provider keys disable/limit Prompt Lab and AA enrichment.
- If secrets are committed to source control, rotate immediately.
- Prompt Lab runtime can increase with more selected models and timeout settings.

---

## 12) Troubleshooting Checklist

## Login or API calls failing
- check backend running
- check JWT token present in frontend state
- check `/api/health`

## No recommendations returned
- verify models exist in Mongo
- run `/api/sync/all`
- relax hard filters (budget/features/context/privacy/constraints)

## Prompt Lab model failures
- verify `OPENROUTER_API_KEY`
- inspect provider error detail in result card
- reduce max tokens or number of models

## Calculator empty model list
- ensure models contain valid pricing fields
- run sync again

---

## 13) Change Notes (Current State)

- Landing page exists at `/` before login flow.
- Compare feature was removed from backend/frontend routes and pages.
- Recommend supports additional media-oriented use cases: `image`, `audio`, `video`.
- Prompt Lab includes output normalization and corrected cost estimation logic.


# Prompt Lab Feature Implementation Plan

## Goal
Add live prompt testing for selected models in two supported flows:
- **Auto flow**: test prompt on top recommended models from `Results`.
- **Manual flow**: developer manually selects models and tests prompt.

## Requirements

### Product Requirements
- Run one prompt against 1-5 selected models.
- Support optional system prompt and generation settings.
- Show per-model response, status, latency, tokens, and estimated cost.
- Save prompt test history per authenticated user.
- Preserve existing recommendation, compare, calculator, and dashboard behavior.

### Technical Requirements
- FastAPI route for prompt execution and history retrieval.
- OpenRouter inference call using server-side `OPENROUTER_API_KEY`.
- MongoDB collection for prompt sessions with indexed lookups.
- Frontend Prompt Lab page with model selection, run action, results view, and history.
- Entry from recommendation results with preselected top models.

### Operational Requirements
- Input validation and safety limits:
  - max models per run
  - max prompt size
  - per-model timeout
- Graceful partial failures (one model fails, others continue).
- No provider keys exposed in frontend code.

## Architecture Decisions
- **Single endpoint strategy** for both auto/manual flows:
  - `POST /api/prompt-lab/run`
  - `GET /api/prompt-lab/history`
- **Sequential model execution** for predictable behavior and simpler debugging.
- **Soft-fail per model** to return full run output with mixed success/error statuses.
- **Cost estimation** computed from stored model pricing (`input_price`, `output_price`).

## File-Level Implementation

### Backend
- `backend/app/core/config.py`
  - Added:
    - `OPENROUTER_API_KEY`
    - `PROMPTLAB_MAX_MODELS_PER_RUN`
    - `PROMPTLAB_MAX_PROMPT_CHARS`
    - `PROMPTLAB_MODEL_TIMEOUT_SEC`
- `backend/app/db/mongo.py`
  - Added `prompt_tests_col`
  - Added indexes for `user_email`, `session_id` (unique), and `created_at`
- `backend/app/services/inference.py` (new)
  - Added OpenRouter chat completion integration and response parsing.
  - Added latency measurement and token extraction.
- `backend/app/routes/prompt_lab.py` (new)
  - Added run endpoint with validation and persistence.
  - Added history endpoint with pagination support.
- `backend/app/main.py`
  - Registered `prompt_lab` router at `/api/prompt-lab`

### Frontend
- `frontend/src/api/models.js`
  - Added:
    - `runPromptLab(payload)`
    - `getPromptLabHistory(params)`
- `frontend/src/pages/PromptLab.jsx` (new)
  - Added prompt lab UI:
    - model picker
    - prompt/system prompt fields
    - temperature/max token controls
    - live result cards and history list
- `frontend/src/App.jsx`
  - Added protected route: `/prompt-lab`
- `frontend/src/components/Navbar.jsx`
  - Added "Prompt Lab" navigation item
- `frontend/src/pages/Dashboard.jsx`
  - Added "Prompt Lab" feature card
- `frontend/src/pages/Results.jsx`
  - Added "Test Prompt on Top Models" action
  - Navigates to `/prompt-lab` with preselected top 3 model IDs

## Compatibility Notes
- Existing flows remain unchanged and continue to work.
- New feature is additive and isolated from current recommendation logic.
- Prompt Lab requires `OPENROUTER_API_KEY` on backend.

## Validation Performed
- Backend syntax validation:
  - `python -m compileall app` (success)
- Frontend build validation:
  - `npm run build` (success)
- Lint diagnostics on edited files:
  - no linter errors found

## Post-Implementation Checklist
- Add `OPENROUTER_API_KEY` in backend `.env` if not already set.
- Optionally tune limits:
  - `PROMPTLAB_MAX_MODELS_PER_RUN`
  - `PROMPTLAB_MAX_PROMPT_CHARS`
  - `PROMPTLAB_MODEL_TIMEOUT_SEC`
- Run end-to-end manual check:
  - Results -> "Test Prompt on Top Models"
  - Manual selection in Prompt Lab
  - Verify mixed success/error handling and history storage

<div align="center">

<img src="https://img.shields.io/badge/LLM-Selector-7C6AF4?style=for-the-badge&logoColor=white" alt="LLM Selector" height="42"/>

# LLM Selector

**Stop guessing. Start deciding.**

A full-stack web application that helps developers and teams choose the right Large Language Model — using deterministic scoring, side-by-side prompt testing, and transparent cost estimation.

<br/>

[![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python_3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=flat-square)](LICENSE)

<br/>

[**Live Demo**](#) · [**Report a Bug**](../../issues) · [**Request a Feature**](../../issues)

<br/>

</div>

---

## 📖 Table of Contents

- [Why LLM Selector?](#-why-llm-selector)
- [Features at a Glance](#-features-at-a-glance)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Data Sync Pipeline](#-data-sync-pipeline)
- [Routing & Navigation](#-routing--navigation)
- [Database Schema](#-database-schema)
- [Scoring Engine Deep Dive](#-scoring-engine-deep-dive)
- [Known Limitations](#-known-limitations)
- [Contributing](#-contributing)
- [Developers](#-developers)
- [License](#-license)

---

## 💡 Why LLM Selector?

Choosing an LLM today means wading through leaderboards, benchmarks, pricing pages, and capability docs across dozens of providers. You still end up making a gut call.

**LLM Selector fixes this.** You describe what you need — your use case, budget, speed requirements, context window, privacy constraints — and the engine ranks every model in the catalog against your exact requirements, with transparent math you can audit.

```
Your requirements  →  Hard filters  →  Weighted scoring  →  Ranked top-3 + full explanation
```

No vendor bias. No black-box magic. Every result is reproducible.

---

## ✨ Features at a Glance

| Feature | What it does |
|---|---|
| 🎯 **Smart Recommend** | 7-step wizard → deterministic top-3 ranked models with explainability |
| 🧪 **Prompt Lab** | Run any prompt across up to 5 models simultaneously, compare output + cost |
| 💰 **Cost Calculator** | Per-request, daily, and monthly cost projections from real pricing data |
| 🕓 **History** | Every recommendation run and prompt test is stored and reviewable |
| 🔄 **Live Sync** | Model catalog, benchmarks, and pricing synced from OpenRouter + Artificial Analysis |

---

## 🔍 How It Works

### Smart Recommend — end-to-end

```
User fills 7-step wizard
        │
        ▼
POST /api/recommend/
        │
        ├─► Derive implicit requirements
        │     (e.g. image input → requires multimodal)
        │
        ├─► Hard filter pass
        │     Budget cap · Context window · Capability flags
        │     Fine-tuning · Privacy · Deployment constraints
        │
        ├─► Per-dimension raw scores
        │     Quality (use-case index) · Speed (TPS) · Latency (TTFT)
        │     Cost (blended $/1M) · Context (log scale)
        │
        ├─► Dynamic weight calculation
        │     Driven by speed_vs_quality slider · accuracy · reasoning
        │     complexity · throughput · latency requirements
        │
        ├─► Weighted composite score (0–100)
        │
        └─► Top 3 returned with:
              Match label · Why-ranked sentence
              Pass/fail/warn checks · Contribution breakdown
              Stored to history collection
```

### Prompt Lab — end-to-end

```
User selects models + enters prompt
        │
        ▼
POST /api/prompt-lab/run
        │
        ├─► Validate & deduplicate model IDs
        ├─► For each model → OpenRouter /chat/completions
        ├─► Extract output text, latency, token counts
        ├─► Compute estimated cost from synced pricing
        ├─► Normalize structured output (JSON fence cleanup)
        └─► Return all results + persist session
```

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA framework with fast HMR |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **State** | Zustand | Lightweight global state (`authStore`, `formStore`) |
| **HTTP Client** | Axios | API calls with auth interceptor |
| **Backend** | Python + FastAPI | REST API, async-ready |
| **Database** | MongoDB (PyMongo) | Model catalog, user data, history |
| **Inference** | OpenRouter API | Live LLM calls for Prompt Lab |
| **Benchmark Data** | Artificial Analysis | Quality/speed/latency enrichment |
| **Auth** | JWT | Stateless token-based auth |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                                                                 │
│   Landing  →  Login/Register  →  Dashboard                     │
│                                       │                         │
│              ┌────────────────────────┼────────────────────┐    │
│              │                        │                    │    │
│        RequirementsForm          PromptLab            Calculator│
│              │                        │                    │    │
│           Results                  History              Results  │
│                                                                 │
│   ─────────────  Zustand (authStore · formStore)  ───────────  │
│   ─────────────  Axios (JWT interceptor + auto-logout)  ──────  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / REST
┌──────────────────────────▼──────────────────────────────────────┐
│                        BACKEND (FastAPI)                        │
│                                                                 │
│   /api/auth      /api/recommend    /api/prompt-lab              │
│   /api/models    /api/calculate    /api/sync                    │
│                                                                 │
│   Services:                                                     │
│   scoring.py · explanation.py · cost.py · inference.py          │
│   openrouter.py · artificial_analysis.py                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    MongoDB (4 collections)                      │
│                                                                 │
│   users · models · history · prompt_tests                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │ Sync pipeline
              ┌────────────┴────────────┐
              ▼                         ▼
       OpenRouter API         Artificial Analysis API
    (catalog + pricing)      (benchmark enrichment)
```

---

## 📂 Project Structure

```
llm-selector/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx              # Pre-login entry page
│   │   │   ├── Login.jsx                # Auth login form
│   │   │   ├── Register.jsx             # New user registration
│   │   │   ├── Dashboard.jsx            # Home after login, shows history
│   │   │   ├── RequirementsForm.jsx     # 7-step recommendation wizard
│   │   │   ├── Results.jsx              # Ranked model cards + follow-up actions
│   │   │   ├── PromptLab.jsx            # Multi-model prompt runner
│   │   │   └── Calculator.jsx           # Token cost estimator
│   │   │
│   │   ├── api/
│   │   │   └── models.js                # All API calls + Axios interceptor
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.js             # Token, email, session state
│   │   │   └── formStore.js             # Wizard step, fields, results
│   │   │
│   │   ├── components/                  # Shared UI components
│   │   ├── App.jsx                      # Router + protected route wrapper
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI app init, CORS, router mounts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.py                  # Register, login, JWT issue
│   │   │   ├── models.py                # Model catalog endpoints
│   │   │   ├── recommend.py             # Recommendation orchestration
│   │   │   ├── calculator.py            # Cost calculation endpoint
│   │   │   ├── prompt_lab.py            # Prompt run + history
│   │   │   └── sync.py                  # Data sync triggers
│   │   │
│   │   ├── services/
│   │   │   ├── scoring.py               # Hard filters + weighted ranking engine
│   │   │   ├── explanation.py           # Result labels, checks, rationale
│   │   │   ├── cost.py                  # Pure cost math (per-request/day/month)
│   │   │   ├── inference.py             # OpenRouter chat completion calls
│   │   │   ├── openrouter.py            # Model catalog + pricing ingestion
│   │   │   └── artificial_analysis.py   # Benchmark data fetch + mapping
│   │   │
│   │   ├── db/
│   │   │   └── mongo.py                 # MongoDB client + collection refs
│   │   │
│   │   └── core/
│   │       └── config.py                # Env var loading + app settings
│   │
│   ├── requirements.txt
│   └── .env.example
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Minimum version |
|---|---|
| Node.js | `18.x` or higher |
| Python | `3.10` or higher |
| MongoDB | `5.0+` (local) or MongoDB Atlas |
| Git | Any recent version |

You'll also need an **OpenRouter API key** — get one free at [openrouter.ai](https://openrouter.ai).

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/your-org/llm-selector.git
cd llm-selector
```

---

### Step 2 — Backend setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate         # macOS / Linux
# venv\Scripts\activate          # Windows

# Install dependencies
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
# Open .env and fill in your values (see Environment Variables section below)
```

Start the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend will be running at `http://localhost:8000`.  
Interactive API docs available at `http://localhost:8000/docs`.

---

### Step 3 — Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`.

---

### Step 4 — Sync model data

After both servers are running, seed the model catalog. You can do this two ways:

**Option A — From the UI:**  
Log in → go to Dashboard → click **Sync Models**.

**Option B — via cURL:**
```bash
curl -X POST http://localhost:8000/api/sync/all \
  -H "Authorization: Bearer <your-jwt-token>"
```

Sync runs the full pipeline: OpenRouter ingestion → Artificial Analysis enrichment → field backfill.

> ⏱ First sync may take 30–60 seconds depending on API response times.

---

### Step 5 — Run the app

1. Navigate to `http://localhost:5173`
2. Register a new account
3. You'll land on the Dashboard
4. Click **Get Recommendation** to run the 7-step wizard
5. Jump to **Prompt Lab** or **Calculator** from the results

---

## 🔐 Environment Variables

Create `backend/.env` with the following:

```env
# ── MongoDB ──────────────────────────────────────
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=llm_selector

# ── Authentication ────────────────────────────────
JWT_SECRET=replace-with-a-long-random-secret
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440          # 24 hours

# ── OpenRouter ────────────────────────────────────
OPENROUTER_API_KEY=sk-or-...     # https://openrouter.ai/keys

# ── Prompt Lab limits ─────────────────────────────
PROMPTLAB_MAX_MODELS_PER_RUN=5
PROMPTLAB_MAX_PROMPT_CHARS=8000
PROMPTLAB_MODEL_TIMEOUT_SEC=45
```

> ⚠️ **Security:** Never commit `.env` to version control. Add it to `.gitignore`. If credentials are accidentally pushed, rotate them immediately and use `git filter-repo` or BFG to purge from history.

---

## 📡 API Reference

All protected routes require the header:
```
Authorization: Bearer <jwt-token>
```

---

### 🔑 Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ Public | Create a new user account |
| `POST` | `/api/auth/login` | ❌ Public | Authenticate, receive JWT token |

<details>
<summary><strong>POST /api/auth/register</strong></summary>

```json
// Request
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response 201
{
  "message": "User created successfully"
}
```
</details>

<details>
<summary><strong>POST /api/auth/login</strong></summary>

```json
// Request
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response 200
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer"
}
```
</details>

---

### 🎯 Recommend

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/recommend/` | ✅ Required | Submit requirements → get top-3 ranked models |
| `GET` | `/api/recommend/history` | ✅ Required | Get user's past recommendation runs |

<details>
<summary><strong>POST /api/recommend/ — full request schema</strong></summary>

```json
{
  "use_case": "coding",
  "budget": 10,
  "speed_vs_quality": 0.6,
  "required_features": ["function_calling", "json_mode"],
  "min_context": 32000,
  "input_data_type": "code",
  "output_format": "json",
  "output_length": "medium",
  "reasoning_complexity": "high",
  "latency_requirement": "low",
  "reliability": "high",
  "rag_usage": false,
  "fine_tuning_required": false,
  "privacy_local_only": false
}
```

**Supported `use_case` values:** `coding` · `chat` · `agentic` · `analysis` · `general` · `image` · `audio` · `video`

```json
// Response 200
{
  "user_summary": "Coding workload, high reasoning, budget $10/1M, function calling required",
  "results": [
    {
      "rank": 1,
      "model_id": "anthropic/claude-3-5-sonnet",
      "model_name": "Claude 3.5 Sonnet",
      "score": 91.4,
      "match_label": "Excellent",
      "why_ranked": "Top coding index with function calling support, under budget",
      "checks": [
        { "label": "Context window", "status": "pass", "detail": "200K ≥ 32K required" },
        { "label": "Budget", "status": "pass", "detail": "$3/1M ≤ $10 cap" },
        { "label": "Function calling", "status": "pass" }
      ],
      "contributions": {
        "quality": 38.2,
        "speed": 14.1,
        "latency": 12.8,
        "cost": 18.3,
        "context": 8.0
      }
    }
  ]
}
```

> **404** is returned when all models are filtered out — response includes a suggestion to relax constraints.
</details>

---

### 🧪 Prompt Lab

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/prompt-lab/run` | ✅ Required | Run prompt across 1–5 models |
| `GET` | `/api/prompt-lab/history` | ✅ Required | Get user's past prompt sessions |

<details>
<summary><strong>POST /api/prompt-lab/run</strong></summary>

```json
// Request
{
  "model_ids": ["openai/gpt-4o", "anthropic/claude-3-5-sonnet", "google/gemini-1.5-pro"],
  "prompt": "Refactor this Python function to be more Pythonic:\ndef get_even(lst):\n  result = []\n  for i in lst:\n    if i % 2 == 0:\n      result.append(i)\n  return result",
  "system_prompt": "You are a senior Python engineer. Be concise.",
  "temperature": 0.3,
  "max_tokens": 512
}

// Response 200
{
  "session_id": "sess_abc123",
  "created_at": "2025-04-22T10:30:00Z",
  "results": [
    {
      "model_id": "openai/gpt-4o",
      "model_name": "GPT-4o",
      "provider": "OpenAI",
      "status": "success",
      "output_text": "def get_even(lst):\n    return [i for i in lst if i % 2 == 0]",
      "finish_reason": "stop",
      "latency_ms": 820,
      "prompt_tokens": 98,
      "completion_tokens": 24,
      "total_tokens": 122,
      "estimated_cost": 0.00122
    }
  ]
}
```

**Config limits (enforced server-side):**
- `model_ids`: 1 – 5
- `prompt`: max 8,000 characters
- `temperature`: 0.0 – 2.0
- `max_tokens`: 1 – 4,096
- Per-model timeout: 45 seconds
</details>

---

### 💰 Calculator

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/calculate/` | ✅ Required | Estimate cost for a token workload |

<details>
<summary><strong>POST /api/calculate/</strong></summary>

```json
// Request
{
  "model_id": "openai/gpt-4o",
  "input_tokens": 500,
  "output_tokens": 1000,
  "daily_requests": 1000
}

// Response 200
{
  "model_id": "openai/gpt-4o",
  "model_name": "GPT-4o",
  "input_tokens": 500,
  "output_tokens": 1000,
  "daily_requests": 1000,
  "cost_per_request": 0.0175,
  "daily_cost": 17.50,
  "monthly_cost": 525.00,
  "input_price_per_1m": 5.0,
  "output_price_per_1m": 15.0
}
```

**Cost formula:**
```
cost_per_request = (input_tokens × input_price) + (output_tokens × output_price)
daily_cost       = cost_per_request × daily_requests
monthly_cost     = daily_cost × 30
```
</details>

---

### 🔄 Sync

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/sync/openrouter` | ✅ Required | Ingest model catalog + pricing from OpenRouter |
| `POST` | `/api/sync/aa` | ✅ Required | Enrich with Artificial Analysis benchmark data |
| `POST` | `/api/sync/backfill` | ✅ Required | Fill missing field defaults for older records |
| `POST` | `/api/sync/all` | ✅ Required | Run full sync sequence in order |

---

## 🔄 Data Sync Pipeline

All three features — Recommend, Prompt Lab, and Calculator — draw from the `models` MongoDB collection. The sync pipeline keeps that data fresh.

```
┌─────────────────┐    ┌───────────────────────┐    ┌──────────────────┐
│  OpenRouter API │ →  │  Artificial Analysis  │ →  │  Backfill script │
│  (catalog +     │    │  (intelligence_index, │    │  (default fields │
│  pricing data)  │    │  coding_index, ttft,  │    │  for gaps)       │
│                 │    │  tokens_per_second)   │    │                  │
└─────────────────┘    └───────────────────────┘    └──────────────────┘
                                    │
                                    ▼
                           MongoDB: models collection
```

**Key fields and how they're used:**

| Field | Source | Used by |
|---|---|---|
| `input_price`, `output_price` | OpenRouter | Calculator, Recommend cost filter |
| `blended_price` | OpenRouter | Recommend scoring |
| `intelligence_index` | Artificial Analysis | Recommend quality score (general/chat) |
| `coding_index` | Artificial Analysis | Recommend quality score (coding) |
| `agentic_index` | Artificial Analysis | Recommend quality score (agentic) |
| `tokens_per_second` | Artificial Analysis | Recommend speed score |
| `ttft` | Artificial Analysis | Recommend latency score |
| `supports_function_calling` | OpenRouter | Recommend capability filter |
| `supports_json_mode` | OpenRouter | Recommend capability filter |
| `is_multimodal` | OpenRouter | Recommend capability filter |
| `context_length` | OpenRouter | Recommend context filter + score |
| `is_open_source` | OpenRouter | Recommend privacy filter |

> **Note:** If sync is stale or partially failed, features still run but recommendation precision degrades. Always run `sync/all` after deployment.

---

## 🗺 Routing & Navigation

| Route | Access | Component | Description |
|---|---|---|---|
| `/` | Public | `Landing.jsx` | Marketing landing page, CTA → `/login` |
| `/login` | Public | `Login.jsx` | Login form, auto-redirects if already authed |
| `/register` | Public | `Register.jsx` | Account creation |
| `/dashboard` | 🔒 Protected | `Dashboard.jsx` | Home hub, recent history |
| `/requirements` | 🔒 Protected | `RequirementsForm.jsx` | 7-step recommendation wizard |
| `/results` | 🔒 Protected | `Results.jsx` | Ranked model results from wizard |
| `/prompt-lab` | 🔒 Protected | `PromptLab.jsx` | Multi-model prompt runner |
| `/calculator` | 🔒 Protected | `Calculator.jsx` | Token cost estimator |

Protected routes redirect to `/login` if no valid JWT is present. Authenticated users hitting `/login` are redirected straight to `/dashboard`.

---

## 🗄 Database Schema

### `users`
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password_hash": "bcrypt hash",
  "created_at": "ISODate"
}
```

### `models`
```json
{
  "_id": "ObjectId",
  "id": "openai/gpt-4o",
  "name": "GPT-4o",
  "provider": "OpenAI",
  "context_length": 128000,
  "input_price": 0.000005,
  "output_price": 0.000015,
  "blended_price": 0.00001,
  "intelligence_index": 88.4,
  "coding_index": 86.1,
  "agentic_index": 84.7,
  "tokens_per_second": 112.3,
  "ttft": 0.42,
  "supports_function_calling": true,
  "supports_json_mode": true,
  "is_multimodal": true,
  "is_open_source": false,
  "synced_at": "ISODate"
}
```

### `history` (recommendation runs)
```json
{
  "_id": "ObjectId",
  "user_email": "user@example.com",
  "request": { "...full recommendation request payload..." },
  "results": [ "...top-3 explained results..." ],
  "user_summary": "Coding workload, high reasoning, budget $10/1M",
  "created_at": "ISODate"
}
```

### `prompt_tests` (prompt lab sessions)
```json
{
  "_id": "ObjectId",
  "session_id": "sess_abc123",
  "user_email": "user@example.com",
  "request": { "...full prompt run request..." },
  "results": [ "...per-model results with output + telemetry..." ],
  "created_at": "ISODate"
}
```

---

## ⚙️ Scoring Engine Deep Dive

The recommendation engine in `scoring.py` follows a strict pipeline:

### 1. Derived requirements
Implicit requirements are inferred from inputs before filtering:
- `input_data_type: image/audio/video` → requires `is_multimodal`
- `output_format: json/schema` → requires `supports_json_mode`
- `output_format: tool_call` or `rag_usage: true` → requires `supports_function_calling`
- Effective context increased by +25% when `rag_usage: true`

### 2. Hard filters
A model is removed from the candidate pool if **any** of these fail:
- Blended price exceeds the budget cap
- Missing a required capability flag
- Context window below the minimum required
- Fine-tuning not supported (when required)
- Not open-source (when `privacy_local_only: true`)
- Reliability or deployment/integration constraints not met

### 3. Dimension scores (raw)
| Dimension | Source field | Notes |
|---|---|---|
| Quality | `coding_index` / `agentic_index` / `intelligence_index` | Chosen by use case |
| Speed | `tokens_per_second` | Higher = better |
| Latency | `ttft` | Inverted — lower = better |
| Cost | `blended_price` | Adjusted by token volume factors |
| Context | `log(context_length)` | Log scale to avoid outlier dominance |

### 4. Dynamic weights
Weights are computed at runtime from the user's inputs, then normalized to sum to 1:

```
quality_weight    ← speed_vs_quality slider + accuracy + reasoning_complexity
speed_weight      ← throughput_requirement
latency_weight    ← latency_requirement
cost_weight       ← budget tightness
context_weight    ← min_context size relative to catalog median
```

### 5. Composite score
```
score = Σ (normalized_dimension_score × weight)  →  scaled to 0–100
```

Top 3 by score are returned. Each result carries per-dimension contribution values for UI explainability.

---

## ⚠️ Known Limitations

| Area | Limitation |
|---|---|
| Scoring | Heuristic weights are hand-tuned; may need calibration for edge workloads |
| Filtering | Constraint matching uses exact token comparisons — strict for some deployment/integration fields |
| Recommend | No "why excluded" diagnostics for hard-filtered models |
| Recommend | Media use cases (`image`, `audio`, `video`) map to `intelligence_index` — no media-specific benchmark axis yet |
| Prompt Lab | Inference runs sequentially per model — parallel execution not yet implemented |
| Calculator | Monthly projection hardcoded to 30 days; no custom billing cycle support |
| Calculator | Only priced models shown (free/open-source models hidden by design) |
| General | Recommendation quality degrades if sync data is stale |

---

## 🤝 Contributing

Contributions are welcome. To get started:

```bash
# 1. Fork the repository and clone your fork
git clone https://github.com/YOUR-USERNAME/llm-selector.git

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes and commit
git commit -m "feat: add parallel inference to Prompt Lab"

# 4. Push and open a Pull Request
git push origin feature/your-feature-name
```

**Commit message conventions:**

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `refactor:` | Code change without feature/fix |
| `chore:` | Build, config, dependency updates |

Please open an issue before starting large changes so we can discuss direction first.

---

## 👨‍💻 Developers

This project was designed and built by:

<table>
  <tr>
    <td align="center" width="50%">
      <br/>
      <strong>Gande Rohith</strong><br/>
      <sub>Full-Stack Developer</sub><br/>
    </td>
    <td align="center" width="50%">
      <br/>
      <strong>Vuppala Manikanta</strong><br/>
      <sub>Full-Stack Developer</sub><br/>
      <a href="mailto:manikantavuppala124@gmail.com">manikantavuppala124@gmail.com</a>
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — you're free to use, modify, and distribute it with attribution.

---

<div align="center">

Made with ☕ and a lot of benchmark tabs open.

**Gande Rohith · Vuppala Manikanta**

<br/>

⭐ If this project helped you, consider giving it a star on GitHub!

</div>

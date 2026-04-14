# 🤖 LLM Selector

> A production-grade smart developer tool that recommends the best Large Language Models based on your exact requirements — with cost estimation, side-by-side comparison, and full explanations for every recommendation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109%2B-009688)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-47A248)

---

## 📸 Features

- 🔐 **Authentication** — Register / Login with JWT tokens
- 🧠 **Smart Recommendations** — 5-step wizard collects your requirements and returns Top 3 LLMs with full reasoning
- 💬 **Explanation Engine** — Tells you *exactly* why each model was ranked, with match checklists and score breakdowns
- 💰 **Cost Calculator** — Per-request, daily, and monthly cost estimates
- ⚖️ **Model Comparison** — Side-by-side table + bar charts for up to 3 models
- 🔄 **Live Sync** — Pulls latest pricing from OpenRouter + benchmark scores from Artificial Analysis
- 📜 **History** — Every analysis saved to your account

---

## 🧩 Tech Stack

### Backend
| Package | Purpose |
|---|---|
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| PyMongo | MongoDB driver |
| python-jose | JWT token encode/decode |
| passlib + bcrypt | Password hashing |
| Pydantic v2 | Request/response validation |
| pydantic-settings | `.env` config loading |
| httpx | Async HTTP (OpenRouter sync) |

### Frontend
| Package | Purpose |
|---|---|
| React 18 + Vite | UI framework + build tool |
| Tailwind CSS | Utility-first styling |
| Zustand | Global state (auth + form) |
| React Hook Form + Zod | Form validation |
| Axios | HTTP client with JWT interceptor |
| Recharts | Bar charts on Compare page |
| Lucide React | Icons |
| React Router v6 | Client-side routing |

### Database
| Tool | Purpose |
|---|---|
| MongoDB (local) | Users, model data, history |

---

## 🗂️ Project Structure

```
llm-selector/
│
├── backend/
│   ├── .env                        ← Environment variables
│   ├── requirements.txt
│   ├── modelMap.json               ← OpenRouter ID → AA benchmark key mapping
│   └── app/
│       ├── main.py                 ← FastAPI entry point + CORS + lifespan
│       ├── core/
│       │   ├── config.py           ← Settings loaded from .env
│       │   └── security.py        ← JWT + bcrypt helpers
│       ├── db/
│       │   └── mongo.py            ← MongoDB connection + collections + indexes
│       ├── routes/
│       │   ├── auth.py             ← POST /api/auth/register|login
│       │   ├── models.py           ← GET /api/models
│       │   ├── recommend.py        ← POST /api/recommend + GET /api/recommend/history
│       │   ├── calculator.py       ← POST /api/calculate
│       │   ├── compare.py          ← POST /api/compare
│       │   └── sync.py             ← POST /api/sync/all|openrouter|aa
│       └── services/
│           ├── scoring.py          ← Weighted recommendation engine (4-phase)
│           ├── explanation.py      ← Template-based explanation generator
│           ├── cost.py             ← Cost calculation logic
│           ├── openrouter.py       ← OpenRouter API client
│           └── artificial_analysis.py  ← AA mock/real data + 26-model benchmark set
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js              ← Vite config + /api proxy to :8000
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 ← Routes + ProtectedRoute layout
│       ├── index.css               ← Tailwind base + custom component classes
│       ├── api/
│       │   ├── axios.js            ← Axios instance + JWT interceptor + 401 handler
│       │   ├── auth.js             ← register / login calls
│       │   └── models.js           ← recommend / calculate / compare / sync calls
│       ├── store/
│       │   ├── authStore.js        ← Zustand — token + email (persisted)
│       │   └── formStore.js        ← Zustand — 5-step form state + results
│       ├── components/
│       │   ├── Navbar.jsx          ← Top nav with active link highlight
│       │   └── ProtectedRoute.jsx  ← Redirects to /login if no token
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Dashboard.jsx       ← Sync button + recent history
│           ├── RequirementsForm.jsx ← 5-step wizard
│           ├── Results.jsx         ← Top 3 cards with explanations
│           ├── Calculator.jsx      ← Cost estimator
│           └── Compare.jsx         ← Side-by-side comparison + chart
│
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed before starting:

| Tool | Minimum Version | Download |
|---|---|---|
| Python | 3.10+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| MongoDB | 6.0+ | https://www.mongodb.com/try/download/community |
| Git | Any | https://git-scm.com/ |

> **Windows users:** Make sure MongoDB is added to your PATH or use MongoDB Compass to start it.

---

## 🚀 Local Installation — Step by Step

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/llm-selector.git
cd llm-selector
```

---

### Step 2 — Start MongoDB

**Windows:**
```bash
# Option A — if mongod is in PATH
mongod

# Option B — start as Windows service
net start MongoDB

# Option C — use MongoDB Compass (GUI) and connect to localhost:27017
```

**macOS:**
```bash
# If installed via Homebrew
brew services start mongodb-community

# Or run directly
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod   # auto-start on boot
```

Verify MongoDB is running:
```bash
mongosh
# You should see the MongoDB shell. Type 'exit' to quit.
```

---

### Step 3 — Backend Setup

Open a terminal and navigate to the `backend/` folder:

```bash
cd backend
```

**Create a virtual environment (recommended):**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

**Install Python dependencies:**

```bash
# Standard install
pip install -r requirements.txt

# If you get SSL errors (corporate network / Python 3.14):
pip install --only-binary :all: -r requirements.txt

# If pydantic[email] fails separately:
pip install --only-binary :all: "pydantic[email]>=2.13.0"
```

**Configure environment variables:**

The `.env` file is already included with defaults. Edit it if needed:

```bash
# backend/.env
MONGO_URI=mongodb://localhost:27017
DB_NAME=llm_selector
JWT_SECRET=change-this-to-a-random-secret-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
AA_API_KEY=        # Optional — leave blank to use built-in mock benchmark data
```

> ⚠️ **Important:** Change `JWT_SECRET` to a long random string before deploying.

**Start the backend server:**

```bash
python -m uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

**Verify the API is running:**
- Health check: http://localhost:8000/api/health
- Swagger docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

### Step 4 — Frontend Setup

Open a **new terminal** (keep the backend running) and navigate to the `frontend/` folder:

```bash
cd frontend
```

**Install Node dependencies:**

```bash
npm install
```

**Start the development server:**

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser at **http://localhost:5173**

---

### Step 5 — First-Time Setup (Seed the Database)

The database starts empty. Follow these steps once:

1. Open http://localhost:5173
2. Click **Register** and create your account
3. Log in
4. On the **Dashboard**, click the **"Sync Models"** button
5. Wait ~5–10 seconds — this fetches ~200 models from OpenRouter and merges benchmark data
6. You'll see a success message: *"Synced X models from OpenRouter, updated Y with benchmarks"*

You're ready to use the app.

---

## 🔄 How the App Works

### Sync Flow
```
OpenRouter API ──┐
                 ├──► modelMap.json ──► Merge ──► MongoDB (models collection)
AA Benchmark  ───┘
```

- **OpenRouter** provides: pricing, context length, features
- **Artificial Analysis** provides: intelligence index, coding index, agentic index, speed (tokens/sec), latency (TTFT)
- `modelMap.json` maps OpenRouter model IDs to AA benchmark keys
- All merged into a single MongoDB document per model

### Recommendation Flow
```
User Requirements
      │
      ▼
Phase 1: Hard Filters (budget / features / context)
      │
      ▼
Phase 2: Extract raw scores (quality / speed / cost / context)
      │
      ▼
Phase 3: Normalize each dimension 0→1 (min-max)
      │
      ▼
Phase 4: Weighted composite score × 100
      │
      ▼
Top 3 models + Explanation + Match checklist
```

### Scoring Formula
```
weights (shift based on speed_vs_quality slider 0–100):
  quality  = 0.20 + (slider/100) × 0.30    → range: 0.20 to 0.50
  speed    = 0.45 − (slider/100) × 0.35    → range: 0.10 to 0.45
  cost     = 0.25  (always fixed)
  context  = 0.10  (always fixed)

final_score = (quality_norm × w.quality)
            + (speed_norm   × w.speed)
            + (cost_norm    × w.cost)
            + (context_norm × w.context)
            × 100
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/models/` | Yes | List all synced models |
| GET | `/api/models/{id}` | Yes | Get single model |
| POST | `/api/recommend/` | Yes | Get top 3 recommendations |
| GET | `/api/recommend/history` | Yes | Get user's past analyses |
| POST | `/api/calculate/` | Yes | Calculate cost |
| POST | `/api/compare/` | Yes | Compare 2–3 models |
| POST | `/api/sync/openrouter` | Yes | Sync from OpenRouter |
| POST | `/api/sync/aa` | Yes | Sync benchmark data |
| POST | `/api/sync/all` | Yes | Run both syncs |
| GET | `/api/health` | No | Health check |

Full interactive docs at: http://localhost:8000/docs

---

## 📦 Building for Production

### Backend
```bash
# Run without --reload in production
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist/ — serve with nginx or any static host
```

---

## 🛠️ Troubleshooting

### `mongod: command not found`
MongoDB is not in your PATH. Either add it or use MongoDB Compass to start the service.

### `ServerSelectionTimeoutError`
MongoDB is not running. Start it first with `mongod` or via your system service manager.

### `ModuleNotFoundError: No module named 'fastapi'`
Your virtual environment is not activated. Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (macOS/Linux).

### SSL / Certificate errors during `pip install`
You are on a corporate network with SSL inspection. Use:
```bash
pip install --only-binary :all: --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

### `pydantic-core` build fails on Python 3.14
Python 3.14 requires binary wheels. Use:
```bash
pip install --only-binary :all: -r requirements.txt
```

### `No models in database` error on recommend
You haven't synced yet. Go to Dashboard and click **Sync Models**.

### Frontend shows blank page / 404 on API calls
Make sure the backend is running on port 8000. The Vite dev server proxies `/api` to `http://localhost:8000`.

### `npm: command not found`
Node.js is not installed. Download it from https://nodejs.org/ and re-open your terminal.

---

## 🔐 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `DB_NAME` | `llm_selector` | MongoDB database name |
| `JWT_SECRET` | `(change this)` | Secret key for signing JWT tokens |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `JWT_EXPIRE_MINUTES` | `1440` | Token expiry (24 hours) |
| `AA_API_KEY` | *(empty)* | Artificial Analysis API key — leave blank to use mock data |

---

## 🗄️ MongoDB Collections

### `users`
```json
{
  "email": "user@example.com",
  "password_hash": "$2b$12$...",
  "created_at": "2025-01-01T00:00:00Z"
}
```

### `models`
```json
{
  "id": "openai/gpt-4o",
  "name": "GPT-4o",
  "provider": "openai",
  "input_price": 0.000005,
  "output_price": 0.000015,
  "blended_price": 0.00001,
  "context_length": 128000,
  "tokens_per_second": 65,
  "ttft": 450,
  "intelligence_index": 88,
  "coding_index": 85,
  "agentic_index": 82,
  "supports_function_calling": true,
  "supports_json_mode": true,
  "is_multimodal": true,
  "is_open_source": false,
  "last_updated": "2025-01-01T00:00:00Z"
}
```

### `history`
```json
{
  "user_email": "user@example.com",
  "requirements": { "use_case": "coding", "budget": 5, "speed_vs_quality": 70 },
  "results": [...],
  "user_summary": "- Task type: coding tasks\n- Budget: up to $5.00/1M tokens",
  "created_at": "2025-01-01T00:00:00Z"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

- Model pricing data — [OpenRouter](https://openrouter.ai)
- Benchmark data — [Artificial Analysis](https://artificialanalysis.ai)
- Icons — [Lucide](https://lucide.dev)
- Charts — [Recharts](https://recharts.org)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, models, recommend, calculator, compare, sync
from app.db.mongo import ensure_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ensure_indexes()
    except Exception as e:
        print(f"[startup] MongoDB index creation skipped: {e}")
    yield


app = FastAPI(title="LLM Selector API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth",      tags=["auth"])
app.include_router(models.router,      prefix="/api/models",    tags=["models"])
app.include_router(recommend.router,   prefix="/api/recommend", tags=["recommend"])
app.include_router(calculator.router,  prefix="/api/calculate", tags=["calculate"])
app.include_router(compare.router,     prefix="/api/compare",   tags=["compare"])
app.include_router(sync.router,        prefix="/api/sync",      tags=["sync"])


@app.get("/api/health")
def health():
    return {"status": "ok"}

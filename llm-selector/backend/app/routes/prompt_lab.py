from datetime import datetime, timezone
from typing import List
from uuid import uuid4
import json

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app.core.config import settings
from app.db.mongo import models_col, prompt_tests_col
from app.routes.auth import get_current_user
from app.services.inference import run_prompt

router = APIRouter()


class PromptRunRequest(BaseModel):
    model_ids: List[str] = Field(..., min_length=1, max_length=5)
    prompt: str = Field(..., min_length=1)
    system_prompt: str = ""
    temperature: float = Field(0.7, ge=0, le=2)
    max_tokens: int = Field(512, ge=1, le=4096)


def _estimate_cost(model_doc: dict, prompt_tokens: int, completion_tokens: int) -> float:
    input_price = float(model_doc.get("input_price", 0) or 0)
    output_price = float(model_doc.get("output_price", 0) or 0)
    return round((prompt_tokens * input_price) + (completion_tokens * output_price), 6)


def _normalize_output_text(text: str) -> str:
    """Normalize model text so structured outputs (JSON) render consistently."""
    t = (text or "").strip()
    if not t:
        return ""

    # If wrapped in markdown fences, unwrap the first fenced block.
    if t.startswith("```") and t.endswith("```"):
        lines = t.splitlines()
        if len(lines) >= 3:
            t = "\n".join(lines[1:-1]).strip()
            if t.lower().startswith("json"):
                t = t[4:].strip()

    # Pretty-print valid JSON objects/arrays for consistent rendering.
    try:
        parsed = json.loads(t)
        if isinstance(parsed, (dict, list)):
            return json.dumps(parsed, indent=2, ensure_ascii=True)
    except Exception:
        pass

    return t


@router.post("/run")
async def run_prompt_lab(req: PromptRunRequest, user: str = Depends(get_current_user)):
    model_ids = list(dict.fromkeys(req.model_ids))
    if len(model_ids) > settings.PROMPTLAB_MAX_MODELS_PER_RUN:
        raise HTTPException(400, f"Select up to {settings.PROMPTLAB_MAX_MODELS_PER_RUN} models per run")
    if len(req.prompt) > settings.PROMPTLAB_MAX_PROMPT_CHARS:
        raise HTTPException(400, f"Prompt exceeds {settings.PROMPTLAB_MAX_PROMPT_CHARS} characters")

    docs = list(models_col.find({"id": {"$in": model_ids}}, {"_id": 0, "id": 1, "name": 1, "provider": 1, "input_price": 1, "output_price": 1}))
    by_id = {m["id"]: m for m in docs}
    missing = [mid for mid in model_ids if mid not in by_id]
    if missing:
        raise HTTPException(404, f"Unknown model(s): {', '.join(missing)}")

    results = []
    for model_id in model_ids:
        model = by_id[model_id]
        try:
            inference = await run_prompt(
                model_id=model_id,
                prompt=req.prompt,
                system_prompt=req.system_prompt,
                temperature=req.temperature,
                max_tokens=req.max_tokens,
            )
            results.append({
                "model_id": model_id,
                "model_name": model.get("name", model_id),
                "provider": model.get("provider", "unknown"),
                "status": "success",
                "output_text": _normalize_output_text(inference["output_text"]),
                "finish_reason": inference.get("finish_reason"),
                "latency_ms": inference["latency_ms"],
                "prompt_tokens": inference["prompt_tokens"],
                "completion_tokens": inference["completion_tokens"],
                "total_tokens": inference["total_tokens"],
                "estimated_cost": _estimate_cost(model, inference["prompt_tokens"], inference["completion_tokens"]),
            })
        except HTTPException as exc:
            results.append({
                "model_id": model_id,
                "model_name": model.get("name", model_id),
                "provider": model.get("provider", "unknown"),
                "status": "error",
                "error_message": str(exc.detail),
                "output_text": "",
                "latency_ms": 0,
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0,
                "estimated_cost": 0,
            })

    now = datetime.now(timezone.utc)
    session_id = str(uuid4())
    doc = {
        "session_id": session_id,
        "user_email": user,
        "request": {
            "model_ids": model_ids,
            "prompt": req.prompt,
            "system_prompt": req.system_prompt,
            "temperature": req.temperature,
            "max_tokens": req.max_tokens,
        },
        "results": results,
        "created_at": now,
    }
    prompt_tests_col.insert_one(doc)

    return {"session_id": session_id, "created_at": now.isoformat(), "results": results}


@router.get("/history")
def get_prompt_history(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    user: str = Depends(get_current_user),
):
    docs = list(
        prompt_tests_col.find({"user_email": user}, {"_id": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    for item in docs:
        created_at = item.get("created_at")
        if isinstance(created_at, datetime):
            item["created_at"] = created_at.isoformat()
    return {"history": docs}

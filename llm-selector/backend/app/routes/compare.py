from typing import List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.db.mongo import models_col
from app.routes.auth import get_current_user

router = APIRouter()


class CompareRequest(BaseModel):
    model_ids: List[str] = Field(..., min_length=2, max_length=3)


@router.post("/")
def compare(req: CompareRequest, _: str = Depends(get_current_user)):
    models = []
    for mid in req.model_ids:
        doc = models_col.find_one({"id": mid}, {"_id": 0})
        if not doc:
            raise HTTPException(404, f"Model '{mid}' not found")
        models.append(doc)

    # Build comparison matrix
    fields = [
        ("input_price_1m",    lambda m: round(m.get("input_price",  0) * 1_000_000, 4)),
        ("output_price_1m",   lambda m: round(m.get("output_price", 0) * 1_000_000, 4)),
        ("blended_1m",        lambda m: round(m.get("blended_price",0) * 1_000_000, 4)),
        ("context_length",    lambda m: m.get("context_length", 0)),
        ("tokens_per_second", lambda m: m.get("tokens_per_second", 0)),
        ("ttft_ms",           lambda m: m.get("ttft", 0)),
        ("intelligence_index",lambda m: m.get("intelligence_index", 0)),
        ("coding_index",      lambda m: m.get("coding_index", 0)),
        ("agentic_index",     lambda m: m.get("agentic_index", 0)),
        ("function_calling",  lambda m: m.get("supports_function_calling", False)),
        ("json_mode",         lambda m: m.get("supports_json_mode", False)),
        ("multimodal",        lambda m: m.get("is_multimodal", False)),
        ("open_source",       lambda m: m.get("is_open_source", False)),
    ]

    comparison = {}
    for key, fn in fields:
        comparison[key] = {m["id"]: fn(m) for m in models}

    return {
        "models": [{"id": m["id"], "name": m["name"], "provider": m["provider"]} for m in models],
        "comparison": comparison,
    }

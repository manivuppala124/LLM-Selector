"""Data sync routes — pull from OpenRouter + AA and merge into MongoDB."""
import json
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pymongo import UpdateOne
from app.db.mongo import models_col
from app.routes.auth import get_current_user
from app.services.openrouter import fetch_openrouter_models
from app.services.artificial_analysis import fetch_aa_data, get_aa_entry

router = APIRouter()

# Load model map once
_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "modelMap.json")
try:
    with open(_MAP_PATH) as f:
        MODEL_MAP: dict = json.load(f)
except Exception:
    MODEL_MAP = {}


@router.post("/openrouter")
async def sync_openrouter(_: str = Depends(get_current_user)):
    try:
        models = await fetch_openrouter_models()
    except Exception as e:
        raise HTTPException(502, f"OpenRouter fetch failed: {e}")

    ops = []
    for m in models:
        m["last_updated"] = datetime.now(timezone.utc)
        ops.append(
            UpdateOne({"id": m["id"]}, {"$set": m}, upsert=True)
        )

    if ops:
        result = models_col.bulk_write(ops)
        return {
            "synced": len(ops),
            "upserted": result.upserted_count,
            "modified": result.modified_count,
        }
    return {"synced": 0}


@router.post("/aa")
async def sync_aa(_: str = Depends(get_current_user)):
    try:
        aa_data = await fetch_aa_data()
    except Exception as e:
        raise HTTPException(502, f"AA fetch failed: {e}")

    updated = 0
    for or_id, aa_key in MODEL_MAP.items():
        aa = get_aa_entry(aa_data, aa_key)
        result = models_col.update_one(
            {"id": or_id},
            {"$set": {
                "intelligence_index": aa["intelligence_index"],
                "coding_index":       aa["coding_index"],
                "agentic_index":      aa["agentic_index"],
                "tokens_per_second":  aa["tokens_per_second"],
                "ttft":               aa["ttft"],
                "last_updated":       datetime.now(timezone.utc),
            }},
        )
        if result.matched_count:
            updated += 1

    return {"updated": updated}


@router.post("/all")
async def sync_all(user: str = Depends(get_current_user)):
    """Convenience: run both syncs in sequence."""
    or_result  = await sync_openrouter(user)
    aa_result  = await sync_aa(user)
    return {"openrouter": or_result, "aa": aa_result}

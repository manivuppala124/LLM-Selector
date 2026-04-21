from fastapi import APIRouter, Depends, Query
from app.db.mongo import models_col
from app.routes.auth import get_current_user

router = APIRouter()


def _clean(m: dict) -> dict:
    m.pop("_id", None)
    # Remove internal scoring fields
    for k in list(m.keys()):
        if k.startswith("_"):
            m.pop(k, None)
    return m


def _pct(part: int, whole: int) -> float:
    if whole <= 0:
        return 0.0
    return round((part / whole) * 100, 2)


@router.get("/")
def list_models(
    limit: int = Query(100, le=500),
    skip: int = Query(0, ge=0),
    provider: str = Query(None),
    _: str = Depends(get_current_user),
):
    query = {}
    if provider:
        query["provider"] = provider
    docs = list(models_col.find(query, {"_id": 0}).skip(skip).limit(limit))
    return {"models": docs, "total": models_col.count_documents(query)}


@router.get("/coverage")
def model_field_coverage(_: str = Depends(get_current_user)):
    total = models_col.count_documents({})

    coverage_specs = [
        {"name": "intelligence_index", "query": {"intelligence_index": {"$exists": True}}},
        {"name": "coding_index", "query": {"coding_index": {"$exists": True}}},
        {"name": "agentic_index", "query": {"agentic_index": {"$exists": True}}},
        {"name": "tokens_per_second", "query": {"tokens_per_second": {"$exists": True}}},
        {"name": "ttft", "query": {"ttft": {"$exists": True}}},
        {"name": "supports_fine_tuning", "query": {"supports_fine_tuning": {"$exists": True}}},
        {"name": "reliability_score", "query": {"reliability_score": {"$exists": True, "$gt": 0}}},
        {"name": "deployment_constraints", "query": {"deployment_constraints.0": {"$exists": True}}},
        {"name": "integration_constraints", "query": {"integration_constraints.0": {"$exists": True}}},
        {"name": "supported_sdks", "query": {"supported_sdks.0": {"$exists": True}}},
        {"name": "regions", "query": {"regions.0": {"$exists": True}}},
        {"name": "last_updated", "query": {"last_updated": {"$exists": True}}},
    ]

    fields = {}
    for spec in coverage_specs:
        present = models_col.count_documents(spec["query"])
        fields[spec["name"]] = {
            "present": present,
            "missing": max(total - present, 0),
            "coverage_pct": _pct(present, total),
        }

    return {
        "total_models": total,
        "fields": fields,
    }


@router.get("/{model_id:path}")
def get_model(model_id: str, _: str = Depends(get_current_user)):
    doc = models_col.find_one({"id": model_id}, {"_id": 0})
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(404, f"Model '{model_id}' not found")
    return doc

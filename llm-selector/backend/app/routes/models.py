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


@router.get("/{model_id:path}")
def get_model(model_id: str, _: str = Depends(get_current_user)):
    doc = models_col.find_one({"id": model_id}, {"_id": 0})
    if not doc:
        from fastapi import HTTPException
        raise HTTPException(404, f"Model '{model_id}' not found")
    return doc

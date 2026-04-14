from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.db.mongo import models_col, history_col
from app.routes.auth import get_current_user
from app.services.scoring import score_and_rank
from app.services.explanation import explain, build_user_summary

router = APIRouter()


class RecommendRequest(BaseModel):
    use_case: str = Field(..., pattern="^(coding|agentic|general|chat|analysis)$")
    budget: Optional[float] = Field(None, ge=0)        # blended $/1M tokens; None = no limit
    speed_vs_quality: int = Field(50, ge=0, le=100)
    required_features: List[str] = Field(default_factory=list)
    min_context: int = Field(0, ge=0)


@router.post("/")
def recommend(req: RecommendRequest, user: str = Depends(get_current_user)):
    # Pull all models from DB (no API calls here)
    all_models = list(models_col.find({}, {"_id": 0}))
    if not all_models:
        raise HTTPException(404, "No models in database. Run /api/sync/all first.")

    top3 = score_and_rank(
        models=all_models,
        use_case=req.use_case,
        budget=req.budget,
        speed_vs_quality=req.speed_vs_quality,
        required_features=req.required_features,
        min_context=req.min_context,
    )

    if not top3:
        raise HTTPException(404, "No models match your requirements. Try relaxing filters.")

    user_summary = build_user_summary(
        use_case=req.use_case,
        budget=req.budget,
        required_features=req.required_features,
        min_context=req.min_context,
        speed_vs_quality=req.speed_vs_quality,
    )

    results = [
        explain(
            model=m,
            rank=i + 1,
            use_case=req.use_case,
            budget=req.budget,
            required_features=req.required_features,
            min_context=req.min_context,
            speed_vs_quality=req.speed_vs_quality,
        )
        for i, m in enumerate(top3)
    ]

    # Persist to history
    history_col.insert_one({
        "user_email":   user,
        "requirements": req.model_dump(),
        "results":      results,
        "user_summary": user_summary,
        "created_at":   datetime.now(timezone.utc),
    })

    return {
        "user_summary": user_summary,
        "results":      results,
    }


@router.get("/history")
def get_history(user: str = Depends(get_current_user)):
    docs = list(
        history_col.find({"user_email": user}, {"_id": 0})
        .sort("created_at", -1)
        .limit(20)
    )
    # Convert datetime to string
    for d in docs:
        if isinstance(d.get("created_at"), datetime):
            d["created_at"] = d["created_at"].isoformat()
    return {"history": docs}

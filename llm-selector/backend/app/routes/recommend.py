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
    use_case: str = Field(..., pattern="^(coding|agentic|general|chat|analysis|image|audio|video)$")
    budget: Optional[float] = Field(None, ge=0)        # blended $/1M tokens; None = no limit
    speed_vs_quality: int = Field(50, ge=0, le=100)
    required_features: List[str] = Field(default_factory=list)
    min_context: int = Field(0, ge=0)
    input_data_type: Optional[str] = Field(None, pattern="^(text|code|image|audio|video)$")
    input_size_avg_tokens: Optional[int] = Field(None, ge=1)
    input_size_max_tokens: Optional[int] = Field(None, ge=1)
    output_format: Optional[str] = Field(None, pattern="^(text|json|schema|tool_call)$")
    output_length: Optional[int] = Field(None, ge=1)
    accuracy_requirement: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    reasoning_complexity: Optional[str] = Field(None, pattern="^(simple|medium|complex)$")
    latency_requirement: Optional[str] = Field(None, pattern="^(real-time|interactive|batch)$")
    throughput_requirement: Optional[int] = Field(None, ge=1)
    reliability_requirement: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    fine_tuning_requirement: bool = False
    rag_usage: bool = False
    domain_specificity: Optional[str] = Field(None, max_length=50)
    privacy_requirement: Optional[str] = Field(None, pattern="^(standard|strict|local_only)$")
    deployment_constraints: List[str] = Field(default_factory=list)
    integration_constraints: List[str] = Field(default_factory=list)


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
        input_data_type=req.input_data_type,
        input_size_avg_tokens=req.input_size_avg_tokens,
        input_size_max_tokens=req.input_size_max_tokens,
        output_format=req.output_format,
        output_length=req.output_length,
        accuracy_requirement=req.accuracy_requirement,
        reasoning_complexity=req.reasoning_complexity,
        latency_requirement=req.latency_requirement,
        throughput_requirement=req.throughput_requirement,
        reliability_requirement=req.reliability_requirement,
        fine_tuning_requirement=req.fine_tuning_requirement,
        rag_usage=req.rag_usage,
        domain_specificity=req.domain_specificity,
        privacy_requirement=req.privacy_requirement,
        deployment_constraints=req.deployment_constraints,
        integration_constraints=req.integration_constraints,
    )

    if not top3:
        raise HTTPException(404, "No models match your requirements. Try relaxing filters.")

    user_summary = build_user_summary(req.model_dump())

    results = [
        explain(
            model=m,
            rank=i + 1,
            use_case=req.use_case,
            budget=req.budget,
            required_features=req.required_features,
            min_context=req.min_context,
            speed_vs_quality=req.speed_vs_quality,
            request_context=req.model_dump(),
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

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.db.mongo import models_col
from app.routes.auth import get_current_user
from app.services.cost import calculate

router = APIRouter()


class CalcRequest(BaseModel):
    model_id: str
    input_tokens: int = Field(..., ge=1)
    output_tokens: int = Field(..., ge=1)
    daily_requests: int = Field(..., ge=1)


@router.post("/")
def calc_cost(req: CalcRequest, _: str = Depends(get_current_user)):
    model = models_col.find_one({"id": req.model_id}, {"_id": 0})
    if not model:
        raise HTTPException(404, f"Model '{req.model_id}' not found")

    return calculate(model, req.input_tokens, req.output_tokens, req.daily_requests)

"""Cost calculator service."""
from typing import Dict


def calculate(
    model: Dict,
    input_tokens: int,
    output_tokens: int,
    daily_requests: int,
) -> Dict:
    input_price  = model.get("input_price", 0)   # $/token
    output_price = model.get("output_price", 0)  # $/token

    per_request = (input_tokens * input_price) + (output_tokens * output_price)
    daily       = per_request * daily_requests
    monthly     = daily * 30

    return {
        "model_id":        model.get("id"),
        "model_name":      model.get("name"),
        "input_tokens":    input_tokens,
        "output_tokens":   output_tokens,
        "daily_requests":  daily_requests,
        "cost_per_request": round(per_request, 8),
        "daily_cost":      round(daily, 6),
        "monthly_cost":    round(monthly, 4),
        "input_price_per_1m":  round(input_price  * 1_000_000, 4),
        "output_price_per_1m": round(output_price * 1_000_000, 4),
    }

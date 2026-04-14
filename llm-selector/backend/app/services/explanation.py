"""Template-based explanation engine — no LLM calls."""
from typing import Dict, List, Optional


USE_CASE_LABELS = {
    "coding":   "coding tasks",
    "agentic":  "agentic / autonomous workflows",
    "general":  "general-purpose tasks",
    "chat":     "conversational chat",
    "analysis": "data analysis and reasoning",
}


def _match_label(score: float) -> tuple[str, str]:
    if score >= 75:
        return "Excellent Match", "green"
    if score >= 55:
        return "Good Match", "blue"
    return "Acceptable Match", "yellow"


def _why_ranked(model: Dict, rank: int, use_case: str) -> str:
    reasons = []
    q = model.get("_quality_raw", 50)
    tps = model.get("tokens_per_second", 50)
    cost = model.get("_blended_per_1m", 0)

    use_label = USE_CASE_LABELS.get(use_case, use_case)

    if q >= 85:
        reasons.append(f"top-tier {use_label} performance (score: {q})")
    elif q >= 70:
        reasons.append(f"strong {use_label} capability (score: {q})")
    else:
        reasons.append(f"adequate {use_label} capability (score: {q})")

    if tps >= 100:
        reasons.append(f"very fast generation ({tps} tok/s)")
    elif tps >= 60:
        reasons.append(f"solid generation speed ({tps} tok/s)")

    if cost == 0:
        reasons.append("free tier available")
    elif cost < 1:
        reasons.append("very low cost (<$1/1M tokens)")
    elif cost < 5:
        reasons.append("competitive pricing")

    if model.get("is_open_source"):
        reasons.append("open-source (self-hostable)")

    joined = ", ".join(reasons[:3])
    return f"Ranked #{rank} because it offers {joined}."


def _build_checks(
    model: Dict,
    required_features: List[str],
    min_context: int,
    budget: Optional[float],
    speed_vs_quality: int,
) -> List[Dict]:
    checks = []
    ctx = model.get("context_length", 0)
    cost = model.get("_blended_per_1m", 0)
    tps = model.get("tokens_per_second", 50)

    # Context
    if ctx >= min_context:
        checks.append({"label": f"Meets context requirement ({ctx:,} tokens)", "status": "pass"})
    else:
        checks.append({"label": f"Context too small ({ctx:,} / {min_context:,})", "status": "fail"})

    # Budget
    if budget is not None:
        if cost <= budget:
            checks.append({"label": f"Within budget (${cost:.2f}/1M tokens)", "status": "pass"})
        else:
            checks.append({"label": f"Exceeds budget (${cost:.2f} vs ${budget:.2f}/1M)", "status": "fail"})

    # Features
    if "function_calling" in required_features:
        ok = model.get("supports_function_calling", False)
        checks.append({"label": "Function calling supported", "status": "pass" if ok else "fail"})
    if "json_mode" in required_features:
        ok = model.get("supports_json_mode", False)
        checks.append({"label": "JSON mode supported", "status": "pass" if ok else "fail"})
    if "multimodal" in required_features:
        ok = model.get("is_multimodal", False)
        checks.append({"label": "Multimodal (vision) support", "status": "pass" if ok else "fail"})

    # Speed advisory
    if speed_vs_quality < 30 and tps < 40:
        checks.append({"label": "Slower than fastest options — speed tradeoff", "status": "warn"})

    if model.get("is_open_source"):
        checks.append({"label": "Open-source — self-hostable", "status": "info"})
    if model.get("is_multimodal") and "multimodal" not in required_features:
        checks.append({"label": "Bonus: multimodal support included", "status": "info"})

    return checks


def build_user_summary(
    use_case: str,
    budget: Optional[float],
    required_features: List[str],
    min_context: int,
    speed_vs_quality: int,
) -> str:
    lines = [f"- Task type: {USE_CASE_LABELS.get(use_case, use_case)}"]
    if budget is not None:
        lines.append(f"- Budget: up to ${budget:.2f}/1M tokens")
    else:
        lines.append("- Budget: no limit")

    bias = "speed-focused" if speed_vs_quality < 30 else "quality-focused" if speed_vs_quality > 70 else "balanced"
    lines.append(f"- Priority: {bias} (slider: {speed_vs_quality}/100)")

    if required_features:
        lines.append(f"- Required features: {', '.join(required_features)}")
    if min_context > 0:
        lines.append(f"- Minimum context: {min_context:,} tokens")

    return "\n".join(lines)


def explain(
    model: Dict,
    rank: int,
    use_case: str,
    budget: Optional[float],
    required_features: List[str],
    min_context: int,
    speed_vs_quality: int,
) -> Dict:
    score = model.get("_score", 0)
    match_label, match_color = _match_label(score)

    return {
        "rank": rank,
        "model_id": model.get("id"),
        "model_name": model.get("name"),
        "provider": model.get("provider"),
        "overall_score": round(score, 1),
        "match_label": match_label,
        "match_color": match_color,
        "why_ranked": _why_ranked(model, rank, use_case),
        "checks": _build_checks(model, required_features, min_context, budget, speed_vs_quality),
        "contributions": {
            "quality": model.get("_quality_contribution", 0),
            "speed":   model.get("_speed_contribution", 0),
            "cost":    model.get("_cost_contribution", 0),
            "context": model.get("_context_contribution", 0),
        },
        "model_data": {
            "input_price":            model.get("input_price", 0),
            "output_price":           model.get("output_price", 0),
            "blended_per_1m":         model.get("_blended_per_1m", 0),
            "context_length":         model.get("context_length", 0),
            "tokens_per_second":      model.get("tokens_per_second", 50),
            "intelligence_index":     model.get("intelligence_index", 50),
            "coding_index":           model.get("coding_index", 50),
            "agentic_index":          model.get("agentic_index", 50),
            "is_multimodal":          model.get("is_multimodal", False),
            "is_open_source":         model.get("is_open_source", False),
            "supports_function_calling": model.get("supports_function_calling", False),
            "supports_json_mode":     model.get("supports_json_mode", False),
            "ttft":                   model.get("ttft", 500),
        },
    }

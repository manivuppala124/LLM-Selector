"""Recommendation scoring engine — pure weighted math, no ML."""
import math
from typing import List, Dict, Optional


def _normalize(values: List[float]) -> List[float]:
    mn, mx = min(values), max(values)
    if mx == mn:
        return [0.5] * len(values)
    return [(v - mn) / (mx - mn) for v in values]


def _compute_weights(speed_vs_quality: int) -> Dict[str, float]:
    """
    speed_vs_quality: 0 = pure speed, 100 = pure quality.
    Weights always sum to 1.0.
    """
    q = speed_vs_quality / 100.0
    return {
        "quality": 0.20 + q * 0.30,   # 0.20 → 0.50
        "speed":   0.45 - q * 0.35,   # 0.45 → 0.10
        "cost":    0.25,
        "context": 0.10,
    }


QUALITY_KEY_MAP = {
    "coding":   "coding_index",
    "agentic":  "agentic_index",
    "general":  "intelligence_index",
    "chat":     "intelligence_index",
    "analysis": "intelligence_index",
}


def score_and_rank(
    models: List[Dict],
    use_case: str,
    budget: Optional[float],        # blended $/1M tokens; None = no limit
    speed_vs_quality: int,          # 0-100
    required_features: List[str],   # ["function_calling", "json_mode", "multimodal"]
    min_context: int,               # tokens
) -> List[Dict]:
    # ── Phase 1: Hard filters ────────────────────────────────────────────────
    filtered = []
    for m in models:
        blended_per_1m = m.get("blended_price", 0) * 1_000_000

        if budget is not None and blended_per_1m > budget:
            continue
        if "function_calling" in required_features and not m.get("supports_function_calling"):
            continue
        if "json_mode" in required_features and not m.get("supports_json_mode"):
            continue
        if "multimodal" in required_features and not m.get("is_multimodal"):
            continue
        if m.get("context_length", 0) < min_context:
            continue

        filtered.append(m)

    if len(filtered) < 1:
        return []

    # ── Phase 2: Compute raw feature values ──────────────────────────────────
    quality_key = QUALITY_KEY_MAP.get(use_case, "intelligence_index")

    quality_raw = [m.get(quality_key, 50) for m in filtered]
    speed_raw   = [m.get("tokens_per_second", 50) for m in filtered]
    cost_raw_pm = [m.get("blended_price", 0) * 1_000_000 for m in filtered]
    ctx_raw     = [math.log(max(m.get("context_length", 4096), 1)) for m in filtered]

    # Cost: invert (cheaper = higher score)
    max_cost = max(cost_raw_pm) if max(cost_raw_pm) > 0 else 1.0
    cost_inverted = [1.0 - (c / max_cost) for c in cost_raw_pm]

    # ── Phase 3: Normalize each dimension 0-1 ────────────────────────────────
    q_norm   = _normalize(quality_raw)
    s_norm   = _normalize(speed_raw)
    c_norm   = _normalize(cost_inverted)
    ctx_norm = _normalize(ctx_raw)

    weights = _compute_weights(speed_vs_quality)

    # ── Phase 4: Weighted composite score ────────────────────────────────────
    for i, m in enumerate(filtered):
        composite = (
            q_norm[i]   * weights["quality"] +
            s_norm[i]   * weights["speed"]   +
            c_norm[i]   * weights["cost"]    +
            ctx_norm[i] * weights["context"]
        ) * 100

        m["_score"]                = round(composite, 2)
        m["_quality_contribution"] = round(q_norm[i]   * weights["quality"]  * 100, 2)
        m["_speed_contribution"]   = round(s_norm[i]   * weights["speed"]    * 100, 2)
        m["_cost_contribution"]    = round(c_norm[i]   * weights["cost"]     * 100, 2)
        m["_context_contribution"] = round(ctx_norm[i] * weights["context"]  * 100, 2)
        m["_blended_per_1m"]       = round(cost_raw_pm[i], 4)
        m["_quality_raw"]          = quality_raw[i]

    filtered.sort(key=lambda x: x["_score"], reverse=True)
    return filtered[:3]

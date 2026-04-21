"""Recommendation scoring engine — weighted, explainable ranking."""
import math
from typing import List, Dict, Optional


def _normalize(values: List[float]) -> List[float]:
    mn, mx = min(values), max(values)
    if mx == mn:
        return [0.5] * len(values)
    return [(v - mn) / (mx - mn) for v in values]


def _compute_weights(
    speed_vs_quality: int,
    accuracy_requirement: Optional[str],
    reasoning_complexity: Optional[str],
    latency_requirement: Optional[str],
    throughput_requirement: Optional[int],
) -> Dict[str, float]:
    """
    speed_vs_quality: 0 = pure speed, 100 = pure quality.
    Weights always sum to 1.0.
    """
    q = speed_vs_quality / 100.0
    weights = {
        "quality": 0.20 + q * 0.30,   # 0.20 → 0.50
        "speed":   0.45 - q * 0.35,   # 0.45 → 0.10
        "latency": 0.00,
        "cost":    0.25,
        "context": 0.10,
    }
    if accuracy_requirement == "high":
        weights["quality"] += 0.08
    elif accuracy_requirement == "low":
        weights["quality"] -= 0.08

    if reasoning_complexity == "complex":
        weights["quality"] += 0.05
    elif reasoning_complexity == "simple":
        weights["quality"] -= 0.04

    if throughput_requirement and throughput_requirement >= 50:
        weights["speed"] += 0.08

    if latency_requirement == "real-time":
        weights["latency"] = 0.20
        weights["speed"] += 0.05
    elif latency_requirement == "interactive":
        weights["latency"] = 0.10
    elif latency_requirement == "batch":
        weights["latency"] = 0.02
        weights["cost"] += 0.03

    total = sum(weights.values())
    return {k: (v / total) for k, v in weights.items()}


def _derive_required_features(
    required_features: List[str],
    input_data_type: Optional[str],
    output_format: Optional[str],
    rag_usage: bool,
) -> List[str]:
    features = set(required_features or [])
    if input_data_type in {"image", "audio", "video"}:
        features.add("multimodal")
    if output_format in {"json", "schema"}:
        features.add("json_mode")
    if output_format == "tool_call" or rag_usage:
        features.add("function_calling")
    return list(features)


def _derive_min_context(
    min_context: int,
    input_size_max_tokens: Optional[int],
    output_length: Optional[int],
    rag_usage: bool,
) -> int:
    required = min_context
    if input_size_max_tokens:
        required = max(required, input_size_max_tokens)
    if input_size_max_tokens and output_length:
        required = max(required, input_size_max_tokens + output_length)
    if rag_usage and required > 0:
        required = int(required * 1.25)
    return required


def _has_constraint_value(model: Dict, requested: List[str], fields: List[str]) -> bool:
    if not requested:
        return True
    model_values = []
    for field in fields:
        value = model.get(field)
        if isinstance(value, list):
            model_values.extend(str(v).lower() for v in value)
        elif value:
            model_values.append(str(value).lower())
    return all(item.lower() in model_values for item in requested)


QUALITY_KEY_MAP = {
    "coding":   "coding_index",
    "agentic":  "agentic_index",
    "general":  "intelligence_index",
    "chat":     "intelligence_index",
    "analysis": "intelligence_index",
    "image":    "intelligence_index",
    "audio":    "intelligence_index",
    "video":    "intelligence_index",
}


def score_and_rank(
    models: List[Dict],
    use_case: str,
    budget: Optional[float],        # blended $/1M tokens; None = no limit
    speed_vs_quality: int,          # 0-100
    required_features: List[str],   # ["function_calling", "json_mode", "multimodal"]
    min_context: int,               # tokens
    input_data_type: Optional[str] = None,
    input_size_avg_tokens: Optional[int] = None,
    input_size_max_tokens: Optional[int] = None,
    output_format: Optional[str] = None,
    output_length: Optional[int] = None,
    accuracy_requirement: Optional[str] = None,
    reasoning_complexity: Optional[str] = None,
    latency_requirement: Optional[str] = None,
    throughput_requirement: Optional[int] = None,
    reliability_requirement: Optional[str] = None,
    fine_tuning_requirement: bool = False,
    rag_usage: bool = False,
    domain_specificity: Optional[str] = None,
    privacy_requirement: Optional[str] = None,
    deployment_constraints: Optional[List[str]] = None,
    integration_constraints: Optional[List[str]] = None,
) -> List[Dict]:
    effective_features = _derive_required_features(
        required_features,
        input_data_type,
        output_format,
        rag_usage,
    )
    effective_min_context = _derive_min_context(
        min_context,
        input_size_max_tokens,
        output_length,
        rag_usage,
    )

    # ── Phase 1: Hard filters ────────────────────────────────────────────────
    filtered = []
    for m in models:
        blended_per_1m = m.get("blended_price", 0) * 1_000_000

        if budget is not None and blended_per_1m > budget:
            continue
        if "function_calling" in effective_features and not m.get("supports_function_calling"):
            continue
        if "json_mode" in effective_features and not m.get("supports_json_mode"):
            continue
        if "multimodal" in effective_features and not m.get("is_multimodal"):
            continue
        if m.get("context_length", 0) < effective_min_context:
            continue
        if fine_tuning_requirement and not m.get("supports_fine_tuning", False):
            continue
        if privacy_requirement == "local_only" and not m.get("is_open_source", False):
            continue
        if reliability_requirement == "high":
            reliability = m.get("reliability_score", 0.0)
            if reliability and reliability < 0.95:
                continue
        if not _has_constraint_value(
            m,
            deployment_constraints or [],
            ["deployment_constraints", "regions", "deployment_targets"],
        ):
            continue
        if not _has_constraint_value(
            m,
            integration_constraints or [],
            ["integration_constraints", "supported_sdks", "integrations"],
        ):
            continue

        filtered.append(m)

    if len(filtered) < 1:
        return []

    # ── Phase 2: Compute raw feature values ──────────────────────────────────
    quality_key = QUALITY_KEY_MAP.get(use_case, "intelligence_index")

    quality_raw = [m.get(quality_key, 50) for m in filtered]
    if domain_specificity:
        domain = domain_specificity.lower()
        if "code" in domain:
            quality_raw = [q + 8 for q in [m.get("coding_index", 50) for m in filtered]]
        elif "agent" in domain or "tool" in domain:
            quality_raw = [q + 8 for q in [m.get("agentic_index", 50) for m in filtered]]
    if input_data_type == "code":
        quality_raw = [q + 5 for q in [m.get("coding_index", 50) for m in filtered]]
    if reasoning_complexity == "complex":
        quality_raw = [q + 4 for q in quality_raw]
    if accuracy_requirement == "low":
        quality_raw = [max(q - 3, 0) for q in quality_raw]

    speed_raw   = [m.get("tokens_per_second", 50) for m in filtered]
    ttft_raw    = [max(m.get("ttft", 500), 1) for m in filtered]
    cost_raw_pm = [m.get("blended_price", 0) * 1_000_000 for m in filtered]
    ctx_raw     = [math.log(max(m.get("context_length", 4096), 1)) for m in filtered]
    if input_size_avg_tokens:
        avg_factor = max(0.6, min(input_size_avg_tokens / 4000.0, 2.5))
        cost_raw_pm = [c * avg_factor for c in cost_raw_pm]
    if output_length:
        out_factor = max(0.6, min(output_length / 1200.0, 2.5))
        cost_raw_pm = [c * out_factor for c in cost_raw_pm]

    # Cost: invert (cheaper = higher score)
    max_cost = max(cost_raw_pm) if max(cost_raw_pm) > 0 else 1.0
    cost_inverted = [1.0 - (c / max_cost) for c in cost_raw_pm]
    max_ttft = max(ttft_raw)
    latency_inverted = [1.0 - (t / max_ttft) for t in ttft_raw]

    # ── Phase 3: Normalize each dimension 0-1 ────────────────────────────────
    q_norm   = _normalize(quality_raw)
    s_norm   = _normalize(speed_raw)
    l_norm   = _normalize(latency_inverted)
    c_norm   = _normalize(cost_inverted)
    ctx_norm = _normalize(ctx_raw)

    weights = _compute_weights(
        speed_vs_quality,
        accuracy_requirement,
        reasoning_complexity,
        latency_requirement,
        throughput_requirement,
    )

    # ── Phase 4: Weighted composite score ────────────────────────────────────
    for i, m in enumerate(filtered):
        composite = (
            q_norm[i]   * weights["quality"] +
            s_norm[i]   * weights["speed"]   +
            l_norm[i]   * weights["latency"] +
            c_norm[i]   * weights["cost"]    +
            ctx_norm[i] * weights["context"]
        ) * 100

        m["_score"]                = round(composite, 2)
        m["_quality_contribution"] = round(q_norm[i]   * weights["quality"]  * 100, 2)
        m["_speed_contribution"]   = round(s_norm[i]   * weights["speed"]    * 100, 2)
        m["_latency_contribution"] = round(l_norm[i]   * weights["latency"]  * 100, 2)
        m["_cost_contribution"]    = round(c_norm[i]   * weights["cost"]     * 100, 2)
        m["_context_contribution"] = round(ctx_norm[i] * weights["context"]  * 100, 2)
        m["_blended_per_1m"]       = round(cost_raw_pm[i], 4)
        m["_quality_raw"]          = quality_raw[i]
        m["_effective_required_features"] = effective_features
        m["_effective_min_context"] = effective_min_context

    filtered.sort(key=lambda x: x["_score"], reverse=True)
    return filtered[:3]

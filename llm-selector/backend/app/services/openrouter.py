"""Fetch and normalize model data from OpenRouter public API."""
import httpx
from typing import List, Dict

OPENROUTER_URL = "https://openrouter.ai/api/v1/models"

# Models that support function calling (known list)
FUNCTION_CALLING_MODELS = {
    "openai/gpt-4o", "openai/gpt-4o-mini", "openai/gpt-4-turbo",
    "openai/gpt-3.5-turbo", "openai/gpt-3.5-turbo-0125",
    "anthropic/claude-3.5-sonnet", "anthropic/claude-3-opus",
    "anthropic/claude-3-sonnet", "anthropic/claude-3-haiku",
    "google/gemini-pro-1.5", "google/gemini-flash-1.5",
    "mistralai/mistral-large", "mistralai/mixtral-8x7b-instruct",
    "cohere/command-r-plus", "cohere/command-r",
    "deepseek/deepseek-r1", "deepseek/deepseek-chat",
}

JSON_MODE_MODELS = {
    "openai/gpt-4o", "openai/gpt-4o-mini", "openai/gpt-4-turbo",
    "openai/gpt-3.5-turbo", "openai/gpt-3.5-turbo-0125",
    "anthropic/claude-3.5-sonnet", "anthropic/claude-3-opus",
    "anthropic/claude-3-sonnet", "anthropic/claude-3-haiku",
    "mistralai/mistral-large", "google/gemini-pro-1.5",
}

MULTIMODAL_MODELS = {
    "openai/gpt-4o", "openai/gpt-4o-mini", "openai/gpt-4-turbo",
    "anthropic/claude-3.5-sonnet", "anthropic/claude-3-opus",
    "anthropic/claude-3-sonnet", "anthropic/claude-3-haiku",
    "google/gemini-pro-1.5", "google/gemini-flash-1.5", "google/gemini-pro",
}

OPEN_SOURCE_PROVIDERS = {"meta-llama", "mistralai", "deepseek", "microsoft", "01-ai"}


async def fetch_openrouter_models() -> List[Dict]:
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(OPENROUTER_URL)
        resp.raise_for_status()
        data = resp.json()

    models = []
    for m in data.get("data", []):
        model_id = m.get("id", "")
        if not model_id:
            continue

        pricing = m.get("pricing", {})
        try:
            input_price = float(pricing.get("prompt", 0) or 0)
            output_price = float(pricing.get("completion", 0) or 0)
        except (ValueError, TypeError):
            input_price = output_price = 0.0

        ctx = m.get("context_length") or 4096
        provider = model_id.split("/")[0] if "/" in model_id else "unknown"
        arch = m.get("architecture", {}) or {}
        modality = arch.get("modality", "") or ""
        supported_parameters = m.get("supported_parameters", []) or []
        supports_fine_tuning = any(
            "fine" in str(p).lower() and "tune" in str(p).lower()
            for p in supported_parameters
        )

        models.append({
            "id": model_id,
            "name": m.get("name", model_id),
            "provider": provider,
            "input_price": input_price,
            "output_price": output_price,
            "blended_price": (input_price + output_price) / 2,
            "context_length": int(ctx),
            "supports_function_calling": model_id in FUNCTION_CALLING_MODELS,
            "supports_json_mode": model_id in JSON_MODE_MODELS,
            "is_multimodal": (
                model_id in MULTIMODAL_MODELS
                or "image" in modality.lower()
                or "vision" in modality.lower()
            ),
            "is_open_source": provider in OPEN_SOURCE_PROVIDERS,
            "supports_fine_tuning": supports_fine_tuning,
            "reliability_score": m.get("reliability_score", 0.0),
            "deployment_constraints": m.get("deployment_constraints", []),
            "integration_constraints": m.get("integration_constraints", []),
            "supported_sdks": m.get("supported_sdks", []),
            "regions": m.get("regions", []),
            "description": m.get("description", ""),
        })

    return models

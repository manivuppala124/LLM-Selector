"""
Artificial Analysis data service.
Uses real API when AA_API_KEY is set, otherwise returns curated mock data.
"""
import httpx
from typing import Dict
from app.core.config import settings

# Curated mock data based on publicly available benchmarks
MOCK_AA_DATA: Dict[str, dict] = {
    "gpt-4o": {
        "intelligence_index": 88, "coding_index": 85, "agentic_index": 82,
        "tokens_per_second": 65, "ttft": 450,
    },
    "gpt-4o-mini": {
        "intelligence_index": 72, "coding_index": 68, "agentic_index": 64,
        "tokens_per_second": 110, "ttft": 280,
    },
    "gpt-4-turbo": {
        "intelligence_index": 85, "coding_index": 82, "agentic_index": 78,
        "tokens_per_second": 48, "ttft": 600,
    },
    "gpt-35-turbo": {
        "intelligence_index": 65, "coding_index": 60, "agentic_index": 55,
        "tokens_per_second": 95, "ttft": 250,
    },
    "claude-35-sonnet": {
        "intelligence_index": 91, "coding_index": 93, "agentic_index": 89,
        "tokens_per_second": 72, "ttft": 380,
    },
    "claude-3-opus": {
        "intelligence_index": 88, "coding_index": 85, "agentic_index": 80,
        "tokens_per_second": 25, "ttft": 800,
    },
    "claude-3-sonnet": {
        "intelligence_index": 79, "coding_index": 76, "agentic_index": 71,
        "tokens_per_second": 55, "ttft": 500,
    },
    "claude-3-haiku": {
        "intelligence_index": 68, "coding_index": 65, "agentic_index": 60,
        "tokens_per_second": 120, "ttft": 200,
    },
    "gemini-pro-15": {
        "intelligence_index": 85, "coding_index": 80, "agentic_index": 75,
        "tokens_per_second": 55, "ttft": 500,
    },
    "gemini-flash-15": {
        "intelligence_index": 72, "coding_index": 68, "agentic_index": 65,
        "tokens_per_second": 150, "ttft": 180,
    },
    "gemini-pro": {
        "intelligence_index": 70, "coding_index": 65, "agentic_index": 60,
        "tokens_per_second": 60, "ttft": 450,
    },
    "llama-3-70b": {
        "intelligence_index": 78, "coding_index": 75, "agentic_index": 70,
        "tokens_per_second": 80, "ttft": 350,
    },
    "llama-3-8b": {
        "intelligence_index": 62, "coding_index": 58, "agentic_index": 50,
        "tokens_per_second": 180, "ttft": 150,
    },
    "llama-31-70b": {
        "intelligence_index": 82, "coding_index": 79, "agentic_index": 76,
        "tokens_per_second": 78, "ttft": 360,
    },
    "llama-31-8b": {
        "intelligence_index": 65, "coding_index": 60, "agentic_index": 55,
        "tokens_per_second": 185, "ttft": 145,
    },
    "llama-31-405b": {
        "intelligence_index": 88, "coding_index": 85, "agentic_index": 82,
        "tokens_per_second": 30, "ttft": 900,
    },
    "mistral-7b": {
        "intelligence_index": 58, "coding_index": 55, "agentic_index": 48,
        "tokens_per_second": 160, "ttft": 180,
    },
    "mixtral-8x7b": {
        "intelligence_index": 72, "coding_index": 70, "agentic_index": 64,
        "tokens_per_second": 90, "ttft": 320,
    },
    "mistral-large": {
        "intelligence_index": 80, "coding_index": 78, "agentic_index": 72,
        "tokens_per_second": 60, "ttft": 400,
    },
    "mistral-medium": {
        "intelligence_index": 73, "coding_index": 70, "agentic_index": 65,
        "tokens_per_second": 75, "ttft": 380,
    },
    "deepseek-r1": {
        "intelligence_index": 92, "coding_index": 94, "agentic_index": 85,
        "tokens_per_second": 40, "ttft": 700,
    },
    "deepseek-chat": {
        "intelligence_index": 80, "coding_index": 82, "agentic_index": 74,
        "tokens_per_second": 70, "ttft": 400,
    },
    "deepseek-coder": {
        "intelligence_index": 72, "coding_index": 90, "agentic_index": 65,
        "tokens_per_second": 85, "ttft": 300,
    },
    "command-r-plus": {
        "intelligence_index": 78, "coding_index": 72, "agentic_index": 76,
        "tokens_per_second": 55, "ttft": 480,
    },
    "command-r": {
        "intelligence_index": 68, "coding_index": 62, "agentic_index": 66,
        "tokens_per_second": 90, "ttft": 320,
    },
    "sonar-large": {
        "intelligence_index": 75, "coding_index": 68, "agentic_index": 65,
        "tokens_per_second": 70, "ttft": 400,
    },
    "sonar-small": {
        "intelligence_index": 62, "coding_index": 55, "agentic_index": 52,
        "tokens_per_second": 130, "ttft": 220,
    },
}

DEFAULT_AA = {
    "intelligence_index": 60,
    "coding_index": 55,
    "agentic_index": 50,
    "tokens_per_second": 60,
    "ttft": 500,
}


async def fetch_aa_data() -> Dict[str, dict]:
    """Return AA benchmark data. Uses mock data when no API key is configured."""
    if not settings.AA_API_KEY:
        return MOCK_AA_DATA

    # Real API call when key is available
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(
                "https://artificialanalysis.ai/api/v1/models",
                headers={"Authorization": f"Bearer {settings.AA_API_KEY}"},
            )
            resp.raise_for_status()
            raw = resp.json()
            result = {}
            for m in raw.get("data", []):
                key = m.get("id", "")
                result[key] = {
                    "intelligence_index": m.get("quality_index", 60),
                    "coding_index": m.get("coding_index", 55),
                    "agentic_index": m.get("agentic_index", 50),
                    "tokens_per_second": m.get("output_tokens_per_second", 60),
                    "ttft": m.get("time_to_first_token_ms", 500),
                }
            return result
    except Exception:
        return MOCK_AA_DATA


def get_aa_entry(aa_data: Dict[str, dict], aa_key: str) -> dict:
    return aa_data.get(aa_key, DEFAULT_AA)

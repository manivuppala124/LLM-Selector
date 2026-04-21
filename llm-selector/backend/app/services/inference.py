from time import perf_counter
from typing import Dict, Any, List

import httpx
from fastapi import HTTPException

from app.core.config import settings

OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions"


def _safe_int(value: Any) -> int:
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0


def _extract_text(message: Dict[str, Any]) -> str:
    content = message.get("content", "")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: List[str] = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                text = item.get("text")
                if isinstance(text, str):
                    parts.append(text)
        return "\n".join(parts).strip()
    return ""


async def run_prompt(
    *,
    model_id: str,
    prompt: str,
    system_prompt: str,
    temperature: float,
    max_tokens: int,
) -> Dict[str, Any]:
    if not settings.OPENROUTER_API_KEY:
        raise HTTPException(500, "OPENROUTER_API_KEY is missing on server")

    messages: List[Dict[str, str]] = []
    if system_prompt.strip():
        messages.append({"role": "system", "content": system_prompt.strip()})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model_id,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    start = perf_counter()
    try:
        async with httpx.AsyncClient(timeout=settings.PROMPTLAB_MODEL_TIMEOUT_SEC) as client:
            response = await client.post(OPENROUTER_CHAT_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.TimeoutException:
        raise HTTPException(504, f"Model '{model_id}' timed out")
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:300] if exc.response is not None else "Unknown provider error"
        raise HTTPException(502, f"Inference failed for '{model_id}': {detail}")
    except Exception:
        raise HTTPException(500, f"Unexpected inference error for '{model_id}'")

    latency_ms = int((perf_counter() - start) * 1000)
    choices = data.get("choices") or []
    first_choice = choices[0] if choices else {}
    message = first_choice.get("message") or {}
    usage = data.get("usage") or {}

    return {
        "output_text": _extract_text(message),
        "finish_reason": first_choice.get("finish_reason"),
        "latency_ms": latency_ms,
        "prompt_tokens": _safe_int(usage.get("prompt_tokens")),
        "completion_tokens": _safe_int(usage.get("completion_tokens")),
        "total_tokens": _safe_int(usage.get("total_tokens")),
    }

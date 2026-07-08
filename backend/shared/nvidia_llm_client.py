import os
import httpx
import json
from dotenv import load_dotenv

load_dotenv()

NVIDIA_NIM_API_KEY = os.getenv("NVIDIA_NIM_API_KEY", os.getenv("NVIDIA_API_KEY"))

async def nvidia_llm_call(prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
    """
    Calls the NVIDIA NIM API using stepfun-ai/step-3.7-flash.
    Returns the generated text.
    """
    if not NVIDIA_NIM_API_KEY:
        raise RuntimeError("NVIDIA_NIM_API_KEY environment variable is missing.")

    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {NVIDIA_NIM_API_KEY}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "stepfun-ai/step-3.7-flash",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 10000,
        "temperature": 0.2, # Low temperature for consistent JSON output
        "top_p": 0.95,
        "stream": False
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(invoke_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            print(f"NVIDIA API Error: {e.response.text}")
            raise
        except Exception as e:
            print(f"Failed to communicate with NVIDIA API: {e}")
            raise

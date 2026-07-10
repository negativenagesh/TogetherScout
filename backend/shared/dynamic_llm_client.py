import os
import httpx
import json
from dotenv import load_dotenv, find_dotenv
from openai import AsyncOpenAI

# Try to find and load .env file dynamically regardless of execution directory
load_dotenv(find_dotenv(usecwd=True))

async def dynamic_llm_call(
    prompt: str, 
    system_prompt: str = "You are a helpful assistant.",
    gemini_api_key: str = None,
    deepseek_api_key: str = None,
    active_model: str = None
) -> str:
    """
    Calls the selected LLM (Gemini, Deepseek, or fallback to NVIDIA NIM).
    Returns the generated text.
    """
    client = None
    model_name = None

    if gemini_api_key and deepseek_api_key:
        if active_model == 'deepseek':
            client = AsyncOpenAI(api_key=deepseek_api_key, base_url="https://api.deepseek.com")
            model_name = "deepseek-v4-flash"
        else:
            client = AsyncOpenAI(api_key=gemini_api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
            model_name = "gemini-2.5-flash"
    elif gemini_api_key:
        client = AsyncOpenAI(api_key=gemini_api_key, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
        model_name = "gemini-2.5-flash"
    elif deepseek_api_key:
        client = AsyncOpenAI(api_key=deepseek_api_key, base_url="https://api.deepseek.com")
        model_name = "deepseek-v4-flash"

    if client and model_name:
        try:
            response = await client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=10000,
                temperature=0.2
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Failed to communicate with {model_name} API: {e}")
            raise

    # Fallback to NVIDIA NIM
    api_key = os.getenv("NVIDIA_NIM_API_KEY", os.getenv("NVIDIA_API_KEY"))
    if not api_key:
        raise RuntimeError("NVIDIA_NIM_API_KEY environment variable is missing and no custom keys were provided.")

    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
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

    async with httpx.AsyncClient(timeout=120.0) as http_client:
        try:
            response = await http_client.post(invoke_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            print(f"NVIDIA API Error: {e.response.text}")
            raise
        except Exception as e:
            print(f"Failed to communicate with NVIDIA API: {e}")
            raise

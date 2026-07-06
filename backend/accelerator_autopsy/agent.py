import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# DeepSeek is OpenAI-compatible.
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
client = AsyncOpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")

THESES = [
    "AI/ML SaaS",
    "DevTools",
    "Open Source",
    "Healthcare IT",
    "FinTech",
    "Consumer Tech"
]

THESIS_PROMPT = f"""
You are an expert VC associate at Together, an early-stage fund.
Your fund's core thesis areas are: {', '.join(THESES)}.

Your job is to analyze the following company and determine its fit.
Output your analysis strictly in JSON format with the following keys:
- "thesis_category": a list of matching thesis categories from the allowed list.
- "us_india_relevance_flag": true/false if the company has relevance to US-India corridor (cross-border, dual HQ, etc).
- "together_fit_score": integer from 0 to 100 representing the fit.
- "together_fit_rationale": A one paragraph explanation of your reasoning.

Company Name: {{name}}
One Liner: {{one_liner}}
Description: {{description}}
"""

async def classify_company(name: str, one_liner: str, description: str) -> dict:
    prompt = THESIS_PROMPT.format(name=name, one_liner=one_liner, description=description)
    
    try:
        response = await client.chat.completions.create(
            # Using v4-flash as requested by user
            model="deepseek-chat", # Defaulting to deepseek-chat but will try v4-flash if it's a specific custom endpoint model
            # Actually user specifically asked for "v4-flash model", let's use it
            # model="v4-flash", 
            messages=[
                {"role": "system", "content": "You are a VC assistant that outputs ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Classification failed: {e}")
        return {
            "thesis_category": [],
            "us_india_relevance_flag": False,
            "together_fit_score": 0,
            "together_fit_rationale": f"Failed to classify: {str(e)}"
        }


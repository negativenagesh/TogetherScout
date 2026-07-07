import os
import json
import httpx
from bs4 import BeautifulSoup
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

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

async def scrape_yc_profile(slug: str) -> str:
    if not slug:
        return ""
    try:
        url = f"https://www.ycombinator.com/companies/{slug}"
        async with httpx.AsyncClient(follow_redirects=True) as c:
            r = await c.get(url, timeout=10.0)
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, 'html.parser')
                main_content = soup.find('main')
                text = main_content.get_text(separator=' ', strip=True) if main_content else soup.get_text(separator=' ', strip=True)
                return text[:4000]
    except Exception as e:
        print(f"YC scrape error for {slug}: {e}")
    return ""

async def scrape_website(url: str) -> str:
    if not url:
        return ""
    if not url.startswith('http'):
        url = 'https://' + url
    try:
        # Some simple headers to avoid immediate blocks
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        async with httpx.AsyncClient(follow_redirects=True, headers=headers) as c:
            r = await c.get(url, timeout=10.0)
            if r.status_code == 200:
                soup = BeautifulSoup(r.text, 'html.parser')
                body = soup.find('body')
                text = body.get_text(separator=' ', strip=True) if body else soup.get_text(separator=' ', strip=True)
                return text[:4000]
    except Exception as e:
        print(f"Website scrape error for {url}: {e}")
    return ""

THESIS_PROMPT = f"""
You are an expert VC associate at Together, an early-stage fund.
Your fund's core thesis areas are: {', '.join(THESES)}.

Your job is to analyze the following company and determine its fit.
Output your analysis strictly in JSON format with the following keys:
- "thesis_category": a list of matching thesis categories from the allowed list.
- "us_india_relevance_flag": true/false if the company has relevance to US-India corridor (cross-border, dual HQ, etc).
- "metrics": A list of exactly 10 objects evaluating the company on the following strict VC metrics:
    ["Market Size", "Team / Founders", "Traction", "Moat / Defensibility", "Business Model", "Product", "Timing", "Go-to-Market", "Risks", "Capital Efficiency"].
    Each object must have:
      - "name": (The name of the metric)
      - "score": (Integer from 0 to 10)
      - "reason": (A 1-2 sentence detailed explanation of the score based on scraped data)
- "together_fit_score": integer from 0 to 100 representing the total fit (should exactly equal the sum of the 10 metric scores).
- "together_fit_rationale": A one paragraph overall explanation of your reasoning.

Company Details:
Name: {{name}}
One Liner: {{one_liner}}
Description: {{description}}

YC Profile Scrape (May contain Founder backgrounds, LinkedIn links, etc.):
{{yc_text}}

Company Website Scrape:
{{website_text}}
"""

async def classify_company(name: str, one_liner: str, description: str, slug: str = "", website: str = "") -> dict:
    yc_text = await scrape_yc_profile(slug) if slug else ""
    website_text = await scrape_website(website) if website else ""

    prompt = THESIS_PROMPT.format(
        name=name, 
        one_liner=one_liner, 
        description=description,
        yc_text=yc_text,
        website_text=website_text
    )
    
    try:
        response = await client.chat.completions.create(
            model="deepseek-chat", 
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
            "metrics": [],
            "together_fit_score": 0,
            "together_fit_rationale": f"Failed to classify: {str(e)}"
        }


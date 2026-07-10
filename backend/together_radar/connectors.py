import httpx
import logging
import json
import asyncio
import os
from typing import Dict, Any, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

TAVILY_KEY = os.getenv("TAVILY_API_KEY")
EXA_KEY = os.getenv("EXA_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

SEC_UA = "TogetherRadar research contact@togetherradar.com"

async def tavily_search(query: str, max_results: int = 20, days: int | None = None) -> str:
    """General-purpose, LLM-ready web search."""
    if not TAVILY_KEY:
        return "Error: TAVILY_API_KEY not configured."
    payload = {
        "api_key": TAVILY_KEY,
        "query": query,
        "search_depth": "advanced",
        "max_results": max_results,
        "include_answer": False,
    }
    if days:
        payload["days"] = days
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post("https://api.tavily.com/search", json=payload)
            r.raise_for_status()
            data = r.json()
            results = [{"title": x["title"], "url": x["url"], "content": x["content"][:300]} for x in data.get("results", [])]
            return json.dumps(results)
    except Exception as e:
        logger.error(f"Tavily search failed: {e}")
        return "[]"

async def exa_search(query: str, num_results: int = 20) -> str:
    """Semantic search for natural language fuzzy queries."""
    if not EXA_KEY:
        return "Error: EXA_API_KEY not configured."
    headers = {"x-api-key": EXA_KEY, "Content-Type": "application/json"}
    payload = {"query": query, "numResults": num_results, "useAutoprompt": True, "contents": {"text": True}}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post("https://api.exa.ai/search", json=payload, headers=headers)
            r.raise_for_status()
            data = r.json()
            results = [{"title": x["title"], "url": x["url"], "text": x.get("text", "")[:300]} for x in data.get("results", [])]
            return json.dumps(results)
    except Exception as e:
        logger.error(f"Exa search failed: {e}")
        return "[]"

async def recent_form_d_filings(count: int = 20) -> str:
    """Pulls recent Form D filings unconditionally."""
    url = f"https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&type=D&dateb=&owner=include&count={count}&output=atom"
    try:
        async with httpx.AsyncClient(timeout=15.0, headers={"User-Agent": SEC_UA}) as client:
            r = await client.get(url)
            r.raise_for_status()
            return r.text[:2000]
    except Exception as e:
        logger.error(f"SEC Atom Feed failed: {e}")
        return "[]"

async def sec_full_text_search(entity: str) -> str:
    """Verifies a specific company name in SEC full text."""
    # The direct EFTS API throws a 403 Forbidden on programmatic access.
    # We use Tavily constrained to SEC Edgar archives.
    return await tavily_search(f"site:sec.gov/Archives/edgar/data {entity}", max_results=5)

async def hn_search(query: str, hits_per_page: int = 20) -> str:
    """Searches HN for who's hiring, launches, and stealth mentions."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get("https://hn.algolia.com/api/v1/search", params={"query": query, "hitsPerPage": hits_per_page})
            r.raise_for_status()
            data = r.json()
            results = [{"title": h.get("title", ""), "url": h.get("url"), "text": h.get("story_text", "")[:300]} for h in data.get("hits", [])]
            return json.dumps(results)
    except Exception as e:
        logger.error(f"HN search failed: {e}")
        return "[]"

async def uspto_search(entity: str) -> str:
    """Uses Tavily to search USPTO data (since the direct USPTO API is complex and requires specific formatted payloads)."""
    return await tavily_search(f"site:uspto.report {entity} trademark", max_results=20)

async def cross_check_rdap(domain: str) -> str:
    """Check RDAP for domain registration."""
    if not domain or domain == "null" or domain == "None":
         return "No domain provided to check."
    url = f"https://rdap.org/domain/{domain}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                events = data.get("events", [])
                registration_date = next((e["eventDate"] for e in events if e["eventAction"] == "registration"), "Unknown")
                return f"Domain {domain} is registered. Registration date: {registration_date}"
            return f"Domain {domain} is not registered or RDAP failed."
    except Exception as e:
        logger.error(f"RDAP lookup failed for {domain}: {e}")
        return f"Error checking domain {domain}: {str(e)}"

async def github_search(query: str) -> str:
    """Search for repos or orgs created by founders."""
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get("https://api.github.com/search/repositories", params={"q": query, "per_page": 20}, headers=headers)
            r.raise_for_status()
            data = r.json()
            results = [{"full_name": i["full_name"], "description": i["description"], "url": i["html_url"]} for i in data.get("items", [])]
            return json.dumps(results)
    except Exception as e:
        logger.error(f"GitHub search failed: {e}")
        return "[]"

async def remoteok_jobs(keyword: str) -> str:
    """Real job postings."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get("https://remoteok.com/api")
            r.raise_for_status()
            jobs = r.json()[1:]
            matches = [j for j in jobs if keyword.lower() in (j.get("description", "") or "").lower() or keyword.lower() in (j.get("position", "") or "").lower()]
            results = [{"company": j.get("company"), "position": j.get("position"), "url": j.get("url")} for j in matches[:20]]
            return json.dumps(results)
    except Exception as e:
        logger.error(f"RemoteOK search failed: {e}")
        return "[]"

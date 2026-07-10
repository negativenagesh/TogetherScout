import os
import json
import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from firecrawl import AsyncFirecrawlApp
from ..shared.models import Founder, FounderEvaluation, MetricBreakdown
from ..shared.dynamic_llm_client import dynamic_llm_call

load_dotenv()

async def fetch_yc_context(founder: Founder):
    """Scrapes the YC company page to find the founder's detailed bio, links, and company info."""
    context_data = {
        "linkedin_url": None, 
        "twitter_url": None,
        "founder_bio": None,
        "company_one_liner": None,
        "company_description": None,
        "team_size": None,
        "location": None
    }
    if not founder.company_slug:
        return context_data
        
    url = f"https://www.ycombinator.com/companies/{founder.company_slug}"
    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            
        soup = BeautifulSoup(response.text, "html.parser")
        divs = soup.find_all('div', attrs={'data-page': True})
        if divs:
            data = json.loads(divs[0]['data-page'])
            company_data = data.get('props', {}).get('company', {})
            
            context_data["company_one_liner"] = company_data.get("one_liner")
            context_data["company_description"] = company_data.get("long_description")
            context_data["team_size"] = company_data.get("team_size")
            context_data["location"] = company_data.get("location")
            
            # Find the specific founder in the list
            founders = company_data.get("founders", [])
            for f in founders:
                full_name = f.get("full_name", "")
                if founder.first_name.lower() in full_name.lower() and founder.last_name.lower() in full_name.lower():
                    context_data["linkedin_url"] = f.get("linkedin_url")
                    context_data["twitter_url"] = f.get("twitter_url")
                    context_data["founder_bio"] = f.get("founder_bio")
                    break
    except Exception as e:
        print(f"Error fetching detailed context for {founder.company_slug}: {e}")
        
    return context_data

async def evaluate_founder_agent(
    founder: Founder,
    gemini_api_key: str = None,
    deepseek_api_key: str = None,
    active_model: str = None
) -> FounderEvaluation:
    # 1. Fetch deep context from YC
    yc_context = await fetch_yc_context(founder)
    if yc_context["linkedin_url"]:
        founder.linkedin_url = yc_context["linkedin_url"]
    if yc_context["twitter_url"]:
        founder.twitter_url = yc_context["twitter_url"]

    # 2. Build context
    context = f"""
You are an elite Silicon Valley Venture Capitalist evaluating a startup founder.
Here is the detailed context scraped directly from their YCombinator profile:

Founder Name: {founder.first_name} {founder.last_name}
Current Company: {founder.current_company}
Role: {', '.join(founder.yc_titles) if founder.yc_titles else 'Founder'}
YC Batch: {', '.join(founder.batches) if founder.batches else 'Unknown'}
Industry: {', '.join(founder.yc_industries) if founder.yc_industries else 'Unknown'}

"""
    if yc_context.get("founder_bio"):
        context += f"\nFounder Biography / Background:\n{yc_context['founder_bio']}\n"
    if yc_context.get("company_one_liner"):
        context += f"\nCompany One-Liner:\n{yc_context['company_one_liner']}\n"
    if yc_context.get("company_description"):
        context += f"\nCompany Description:\n{yc_context['company_description']}\n"
    if yc_context.get("team_size") or yc_context.get("location"):
        context += f"\nCompany Info: Team Size: {yc_context.get('team_size', 'Unknown')}, Location: {yc_context.get('location', 'Unknown')}\n"
    if founder.linkedin_url:
        context += f"\nLinkedIn URL: {founder.linkedin_url}\n"
    if founder.twitter_url:
        context += f"Twitter URL: {founder.twitter_url}\n"

    fc_api_key = os.getenv("FIRECRAWL_API_KEY")
    if fc_api_key and (founder.linkedin_url or founder.twitter_url):
        try:
            fc_app = AsyncFirecrawlApp(api_key=fc_api_key)
            if founder.linkedin_url:
                pass
                # try:
                #     # FireCrawl might still be blocked on LinkedIn, but we attempt it gracefully
                #     res = await fc_app.scrape_url(founder.linkedin_url, formats=['markdown'])
                #     markdown_data = res.get('markdown', '')
                #     if markdown_data and "Failed to scrape" not in markdown_data:
                #         context += f"\n[Scraped LinkedIn Content via FireCrawl]\n{markdown_data[:2500]}\n"
                # except Exception as e:
                #     print(f"FireCrawl LinkedIn scrape failed: {e}")
            
            if founder.twitter_url:
                try:
                    res = await fc_app.scrape_url(founder.twitter_url, formats=['markdown'])
                    markdown_data = res.get('markdown', '')
                    if markdown_data and "Failed to scrape" not in markdown_data:
                        context += f"\n[Scraped Twitter Content via FireCrawl]\n{markdown_data[:2500]}\n"
                except Exception as e:
                    print(f"FireCrawl Twitter scrape failed: {e}")
        except Exception as e:
            print(f"FireCrawl setup failed: {e}")

    prompt = context + """

You must evaluate this founder across 10 specific metrics:
1. Domain Expertise
2. Technical Capability (or relevant functional expertise)
3. Previous Exits / Track Record
4. Academic Pedigree
5. Founder-Market Fit
6. Resilience / Grit
7. Leadership / Vision
8. Execution Speed
9. Strategic Network
10. YC Batch Prestige

For each metric, provide a score from 1 to 10 and a short 1-2 sentence rationale based on your search findings.
Then provide an overall_score from 1 to 100 which represents your holistic conviction in this founder, and an overall_rationale which is a 3-4 sentence paragraph summarizing your thesis on the founder.

Output your response strictly as JSON that matches this schema:
{
  "overall_score": 85,
  "overall_rationale": "...",
  "metrics_breakdown": [
    {"metric_name": "Domain Expertise", "score": 9, "rationale": "..."},
    ...
  ]
}
"""

    system_prompt = "You are an elite Silicon Valley Venture Capitalist evaluating a startup founder. Output ONLY a valid JSON object matching the requested schema."

    try:
        content = await dynamic_llm_call(
            prompt, 
            system_prompt,
            gemini_api_key=gemini_api_key,
            deepseek_api_key=deepseek_api_key,
            active_model=active_model
        )
        # Try to extract JSON from the response (it may have extra text around it)
        json_match = content
        if '{' in content:
            start = content.index('{')
            end = content.rindex('}') + 1
            json_match = content[start:end]
        result = json.loads(json_match)
        metrics = []
        for m in result.get("metrics_breakdown", []):
            metrics.append(MetricBreakdown(
                metric_name=m.get("metric_name", ""),
                score=m.get("score", 0),
                rationale=m.get("rationale", "")
            ))
            
        evaluation = FounderEvaluation(
            overall_score=result.get("overall_score", 0),
            overall_rationale=result.get("overall_rationale", ""),
            metrics_breakdown=metrics
        )
        return evaluation
    except Exception as e:
        print(f"Failed to parse LLM evaluation: {e}")
        # Return a fallback empty evaluation
        return FounderEvaluation(
            overall_score=0,
            overall_rationale="Failed to evaluate founder.",
            metrics_breakdown=[]
        )

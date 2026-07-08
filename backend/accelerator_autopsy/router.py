from fastapi import APIRouter, HTTPException
from typing import List
from ..shared.models import Company
from ..shared.data import get_all_companies, get_company, save_company
from .agent import classify_company
import datetime

router = APIRouter(prefix="/companies", tags=["companies"])

@router.get("/", response_model=List[Company])
async def list_companies():
    return get_all_companies()

from fastapi import Request
import httpx

@router.post("/yc_search")
async def yc_search(request: Request):
    """Proxy endpoint to query YC's public Algolia index."""
    data = await request.json()
    url = "https://45BWZJ1SGC-dsn.algolia.net/1/indexes/YCCompany_production/query"
    headers = {
        "x-algolia-api-key": "NzllNTY5MzJiZGM2OTY2ZTQwMDEzOTNhYWZiZGRjODlhYzVkNjBmOGRjNzJiMWM4ZTU0ZDlhYTZjOTJiMjlhMWFuYWx5dGljc1RhZ3M9eWNkYyZyZXN0cmljdEluZGljZXM9WUNDb21wYW55X3Byb2R1Y3Rpb24lMkNZQ0NvbXBhbnlfQnlfTGF1bmNoX0RhdGVfcHJvZHVjdGlvbiZ0YWdGaWx0ZXJzPSU1QiUyMnljZGNfcHVibGljJTIyJTVE",
        "x-algolia-application-id": "45BWZJ1SGC",
        "content-type": "application/x-www-form-urlencoded"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data)
        return response.json()

@router.post("/founders_yc_search")
async def founders_yc_search(request: Request):
    """Proxy endpoint to query YC's public Algolia index for Founders."""
    data = await request.json()
    url = "https://45BWZJ1SGC-dsn.algolia.net/1/indexes/YCUsers_production/query"
    headers = {
        "x-algolia-api-key": "MTlmOGM5MTk5MjVlYWUyMDg4MGIzZDY4ODUzZTQ2ZWEzZWFlMjI0MTRhNTY2OGUyMTEwNTQ5NGVhZTdmYmFmNWFuYWx5dGljc1RhZ3M9eWNkYyZyZXN0cmljdEluZGljZXM9WUNVc2Vyc19wcm9kdWN0aW9uJnRhZ0ZpbHRlcnM9JTVCJTIyeWNkY19wdWJsaWMlMjIlNUQ=",
        "x-algolia-application-id": "45BWZJ1SGC",
        "content-type": "application/x-www-form-urlencoded"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=data)
        return response.json()

from .topstartups import scrape_topstartups

@router.post("/topstartups_search")
async def topstartups_search(request: Request):
    """Endpoint to scrape topstartups.io based on filters."""
    data = await request.json()
    filters = data.get("filters", {})
    page = data.get("page", 1)
    
    result = await scrape_topstartups(filters, page)
    return result

@router.post("/{company_id}/classify")
async def trigger_classification(company_id: str):
    company = get_company(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    result = await classify_company(
        company.name, 
        company.one_liner, 
        company.description or company.one_liner
    )
    
    company.thesis_category = result.get("thesis_category", [])
    company.us_india_relevance_flag = result.get("us_india_relevance_flag", False)
    company.together_fit_score = result.get("together_fit_score", 0)
    company.together_fit_rationale = result.get("together_fit_rationale", "")
    company.last_updated = datetime.datetime.now().isoformat()
    
    save_company(company)
    return company

from typing import Optional
from pydantic import BaseModel

class ExternalCompanyInput(BaseModel):
    name: str
    one_liner: str
    description: str
    slug: Optional[str] = ""
    website: Optional[str] = ""

@router.post("/evaluate_external")
async def evaluate_external_company(company: ExternalCompanyInput):
    result = await classify_company(
        company.name,
        company.one_liner,
        company.description,
        company.slug,
        company.website
    )
    return result

from ..shared.models import Founder, FounderEvaluation, MetricBreakdown
from ..shared.data import get_founder, save_founder
from ..founder_evaluator.founder_agent import evaluate_founder_agent
import datetime

@router.post("/founders/{founder_id}/evaluate")
async def evaluate_founder_endpoint(founder: Founder):
    # This endpoint receives the founder object directly from the frontend
    # Since we don't sync all Algolia founders to DB initially, we just accept the body.
    
    result = await evaluate_founder_agent(founder)
    
    founder.evaluation = result
    save_founder(founder)
    
    return founder

from ..founder_evaluator.founder_agent import fetch_yc_context

@router.post("/founders/bio")
async def get_founder_bio_endpoint(founder: Founder):
    context = await fetch_yc_context(founder)
    return {
        "founder_bio": context.get("founder_bio"),
        "linkedin_url": context.get("linkedin_url"),
        "twitter_url": context.get("twitter_url")
    }

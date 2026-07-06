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

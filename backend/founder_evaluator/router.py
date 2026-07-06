from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse
from typing import List
from ..shared.models import Founder, Evaluation
from ..shared.data import get_all_founders, get_founder, get_evaluation_for_founder
from .agent import run_evaluation_stream

router = APIRouter(prefix="/founders", tags=["founders"])

@router.get("/", response_model=List[Founder])
async def list_founders():
    return get_all_founders()

@router.get("/{founder_id}", response_model=Founder)
async def get_founder_by_id(founder_id: str):
    f = get_founder(founder_id)
    if not f:
        raise HTTPException(status_code=404, detail="Founder not found")
    return f

@router.get("/{founder_id}/evaluation", response_model=Evaluation)
async def get_founder_evaluation(founder_id: str):
    e = get_evaluation_for_founder(founder_id)
    if not e:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return e

@router.get("/{founder_id}/evaluate_stream")
async def evaluate_founder_stream(founder_id: str):
    f = get_founder(founder_id)
    if not f:
        raise HTTPException(status_code=404, detail="Founder not found")
    
    return EventSourceResponse(run_evaluation_stream(f))

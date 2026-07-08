import os
import json
import asyncio
from dotenv import load_dotenv
from .tools import fetch_github_stats
from ..shared.models import Founder, Evaluation
from ..shared.data import save_evaluation
from ..shared.nvidia_llm_client import nvidia_llm_call
import uuid
import datetime

load_dotenv()

def get_rubric(role: str) -> str:
    if role == "technical":
        return "Evaluate technical depth, prior build experience, open source contributions, and engineering complexity."
    elif role == "business":
        return "Evaluate GTM skills, sales network, previous revenue scale, and leadership experience."
    elif role == "research":
        return "Evaluate publication record, lab affiliations, depth in the specific domain (e.g. NLP, Biotech)."
    else:
        return "Evaluate overall potential and domain expertise."

async def run_evaluation_stream(founder: Founder):
    yield "data: " + json.dumps({"type": "step", "content": f"Starting evaluation for {founder.name} ({founder.role} role)..."}) + "\n\n"
    await asyncio.sleep(0.5)
    
    context = ""
    if founder.role == "technical" and founder.github_url:
        yield "data: " + json.dumps({"type": "step", "content": f"Fetching GitHub stats for {founder.github_url}..."}) + "\n\n"
        stats = await fetch_github_stats(founder.github_url)
        context += f"\nGitHub Stats: {json.dumps(stats)}"
        yield "data: " + json.dumps({"type": "step", "content": f"GitHub stats retrieved: {stats.get('public_repos')} repos."}) + "\n\n"
        await asyncio.sleep(0.5)
        
    rubric = get_rubric(founder.role.value if hasattr(founder.role, 'value') else str(founder.role))
    
    prompt = f"""
You are evaluating a startup founder. 
Name: {founder.bio}
Bio: {founder.bio}
Role: {founder.role}
Context: {context}

Rubric: {rubric}

Output your evaluation strictly in JSON format with the following keys:
- "dimension_scores": a dictionary mapping dimension names (e.g., "Technical Depth", "GTM Execution") to a score out of 10.
- "overall_score": integer 0-100 representing overall conviction.
- "rationale": 2-3 sentences explaining the conviction.
- "evidence": List of bullet points backing up the scores.
- "risk_flags": List of concerns or flags.
- "recommendation": "Strong Yes", "Yes", "Wait", or "No".
"""

    yield "data: " + json.dumps({"type": "step", "content": f"Calling AI Engine..."}) + "\n\n"
    
    try:
        system_prompt = "You are an elite Silicon Valley Venture Capitalist evaluating a startup founder. Output ONLY a valid JSON object matching the requested schema."
        content = await nvidia_llm_call(prompt, system_prompt)
        yield "data: " + json.dumps({"type": "step", "content": "Received reasoning from AI Engine."}) + "\n\n"
        
        # Try to extract JSON from the response
        json_match = content
        if '{' in content:
            start = content.index('{')
            end = content.rindex('}') + 1
            json_match = content[start:end]
        result = json.loads(json_match)
        
        eval_obj = Evaluation(
            id=str(uuid.uuid4()),
            founder_id=founder.id,
            rubric_used=rubric,
            dimension_scores=result.get("dimension_scores", {}),
            overall_score=result.get("overall_score", 0),
            rationale=result.get("rationale", ""),
            evidence=result.get("evidence", []),
            risk_flags=result.get("risk_flags", []),
            recommendation=result.get("recommendation", "Wait"),
            created_at=datetime.datetime.now().isoformat()
        )
        
        save_evaluation(eval_obj)
        
        yield "data: " + json.dumps({"type": "result", "content": eval_obj.model_dump()}) + "\n\n"
        
    except Exception as e:
        yield "data: " + json.dumps({"type": "error", "content": str(e)}) + "\n\n"
        
    yield "data: [DONE]\n\n"

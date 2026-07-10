import os
import json
import asyncio
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Callable, Awaitable
from dotenv import load_dotenv

load_dotenv()

from . import connectors

# Fetch API key
api_key = os.getenv("NVIDIA_NIM_API_KEY", os.getenv("NVIDIA_API_KEY"))
if not api_key:
    raise RuntimeError("NVIDIA_NIM_API_KEY environment variable is missing.")

client = AsyncOpenAI(
    api_key=api_key,
    base_url="https://integrate.api.nvidia.com/v1"
)

MODEL_NAME = "stepfun-ai/step-3.7-flash"

class ToolLog(BaseModel):
    agent_name: str
    tool_name: str
    arguments: Dict[str, Any]
    result: str

class StealthCompanyRecord(BaseModel):
    name: str
    domain: Optional[str] = None
    trademark_status: bool
    form_d_filed: bool
    job_signal: bool
    confidence_score: int = Field(ge=0, le=100)
    evidence: List[str]

class MultiAgentResponse(BaseModel):
    query: str
    logs: List[ToolLog]
    candidates: List[StealthCompanyRecord]
    summary: str

LogCallback = Callable[[Dict[str, Any]], Awaitable[None]]

ALL_TOOLS = {
    "tavily_search": connectors.tavily_search,
    "exa_search": connectors.exa_search,
    "recent_form_d_filings": connectors.recent_form_d_filings,
    "sec_full_text_search": connectors.sec_full_text_search,
    "hn_search": connectors.hn_search,
    "uspto_search": connectors.uspto_search,
    "cross_check_rdap": connectors.cross_check_rdap,
    "github_search": connectors.github_search,
    "remoteok_jobs": connectors.remoteok_jobs,
}

all_tool_schemas = [
    {
        "type": "function",
        "function": {
            "name": "tavily_search",
            "description": "General-purpose, LLM-ready web search. Good for any broad query.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "days": {"type": "integer", "description": "Optional recency filter in days"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "exa_search",
            "description": "Semantic search. Pass natural language sentences like 'founders who recently left OpenAI'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "recent_form_d_filings",
            "description": "Pulls recent Form D filings from SEC EDGAR. No arguments needed.",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "sec_full_text_search",
            "description": "Verifies a specific company/founder name appears in a SEC filing.",
            "parameters": {
                "type": "object",
                "properties": {
                    "entity": {"type": "string"}
                },
                "required": ["entity"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "hn_search",
            "description": "Searches HackerNews 'Who's Hiring' threads and comments for stealth mentions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "uspto_search",
            "description": "Searches for trademark filings by company name.",
            "parameters": {
                "type": "object",
                "properties": {
                    "entity": {"type": "string"}
                },
                "required": ["entity"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "cross_check_rdap",
            "description": "Check if a domain is registered and get its registration date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "domain": {"type": "string"}
                },
                "required": ["domain"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "github_search",
            "description": "Search GitHub for new orgs/repos created by founders.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "remoteok_jobs",
            "description": "Search RemoteOK for job postings by keyword.",
            "parameters": {
                "type": "object",
                "properties": {
                    "keyword": {"type": "string"}
                },
                "required": ["keyword"]
            }
        }
    }
]

async def run_discovery_agent(query: str, logs: List[ToolLog], log_callback: Optional[LogCallback] = None) -> List[str]:
    """Agent 1: Discovery. Finds candidate company names based on VC query."""
    messages = [
        {
            "role": "system",
            "content": (
                "You are the Discovery Agent. Your job is to translate the VC's natural language query into tool calls "
                "to find candidate stealth startups. You have access to 10 powerful tools (Tavily, Exa, SEC, HN, GitHub, RemoteOK, etc.).\n"
                "CRITICAL INSTRUCTIONS:\n"
                "1. Fan out! Call MULTIPLE tools simultaneously (e.g., Exa, Tavily, and HN) with 5-8 different broad phrasing angles to maximize context.\n"
                "2. If tools return '[]' or 'Error', DO NOT GIVE UP. Immediately retry by calling different tools or massively changing your query keywords (e.g., from 'ex-OpenAI stealth' to 'recently founded by OpenAI alumni').\n"
                "3. Once you have a list of candidate company names, output them as a raw JSON list of strings (e.g., ['Company A', 'Company B']). "
                "Do NOT include markdown block formatting, just the raw JSON list."
            )
        },
        {"role": "user", "content": f"VC Query: {query}"}
    ]

    for attempt in range(5):
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            tools=all_tool_schemas,
            temperature=0.2
        )
        
        message = response.choices[0].message
        
        if message.tool_calls:
            messages.append(message)
            
            tasks = []
            for tool_call in message.tool_calls:
                fn_name = tool_call.function.name
                try:
                    fn_args = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    fn_args = {}
                
                if fn_name in ALL_TOOLS:
                    async def run_tool(call_id, name, args):
                        res = await ALL_TOOLS[name](**args)
                        return call_id, name, args, res
                    tasks.append(run_tool(tool_call.id, fn_name, fn_args))
            
            results = await asyncio.gather(*tasks)
            
            for call_id, fn_name, fn_args, result in results:
                truncated_result = str(result)[:500] + "..." if len(str(result)) > 500 else str(result)
                log_entry = ToolLog(agent_name="DiscoveryAgent", tool_name=fn_name, arguments=fn_args, result=truncated_result)
                logs.append(log_entry)
                
                if log_callback:
                    await log_callback({
                        "type": "log",
                        "data": log_entry.model_dump()
                    })

                messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "name": fn_name,
                    "content": str(result)
                })
        else:
            content = message.content.strip() if message.content else ""
            if content.startswith("```json"): content = content[7:-3]
            elif content.startswith("```"): content = content[3:-3]
            try:
                candidates = json.loads(content)
                if isinstance(candidates, list):
                    return candidates
            except:
                return ["Acme AI"]
    return []

async def run_deep_dive_agent(company_name: str, logs: List[ToolLog], log_callback: Optional[LogCallback] = None) -> StealthCompanyRecord:
    """Agent 2: Deep Dive. Evaluates a single candidate."""
    messages = [
        {
            "role": "system",
            "content": (
                "You are the Deep-Dive Agent. Your job is to investigate a specific stealth startup candidate using your cross-check tools. "
                "You have access to tools including USPTO, RDAP, SEC Full Text, Tavily, and Exa.\n"
                "CRITICAL INSTRUCTIONS:\n"
                "1. Call multiple tools in parallel to cross-verify the company's domain, trademarks, SEC forms, and job signals.\n"
                "2. If tools return empty results, try modifying the entity name slightly or use a different tool.\n"
                "3. After gathering evidence, output a raw JSON object matching the StealthCompanyRecord schema.\n"
                "Schema requires: name (str), domain (optional str), trademark_status (bool), form_d_filed (bool), job_signal (bool), confidence_score (int 0-100), evidence (list of str)."
            )
        },
        {"role": "user", "content": f"Investigate if '{company_name}' is a stealth startup."}
    ]

    for _ in range(4):
        response = await client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            tools=all_tool_schemas,
            temperature=0.2
        )
        
        message = response.choices[0].message
        
        if message.tool_calls:
            messages.append(message)
            
            tasks = []
            for tool_call in message.tool_calls:
                fn_name = tool_call.function.name
                try:
                    fn_args = json.loads(tool_call.function.arguments)
                except:
                    fn_args = {}
                
                if fn_name in ALL_TOOLS:
                    async def run_deep_tool(call_id, name, args):
                        res = await ALL_TOOLS[name](**args)
                        return call_id, name, args, res
                    tasks.append(run_deep_tool(tool_call.id, fn_name, fn_args))
            
            results = await asyncio.gather(*tasks)
            for call_id, fn_name, fn_args, result in results:
                truncated_result = str(result)[:500] + "..." if len(str(result)) > 500 else str(result)
                log_entry = ToolLog(agent_name="DeepDiveAgent", tool_name=fn_name, arguments=fn_args, result=truncated_result)
                logs.append(log_entry)
                
                if log_callback:
                    await log_callback({
                        "type": "log",
                        "data": log_entry.model_dump()
                    })

                messages.append({
                    "role": "tool",
                    "tool_call_id": call_id,
                    "name": fn_name,
                    "content": str(result)
                })
        else:
            content = message.content.strip() if message.content else ""
            if content.startswith("```json"): content = content[7:-3]
            elif content.startswith("```"): content = content[3:-3]
            try:
                data = json.loads(content)
                return StealthCompanyRecord(**data)
            except Exception as e:
                return StealthCompanyRecord(
                    name=company_name,
                    trademark_status=False, form_d_filed=False, job_signal=False, confidence_score=0,
                    evidence=[f"Parse error: {e}"]
                )
    
    return StealthCompanyRecord(name=company_name, trademark_status=False, form_d_filed=False, job_signal=False, confidence_score=0, evidence=["Max turns reached"])

async def run_synthesizer_agent_stream(query: str, logs: List[ToolLog], candidates: List[StealthCompanyRecord], log_callback: Optional[LogCallback] = None):
    """Agent 3: Synthesizer (Streaming). Summarizes the findings and answers the user."""
    log_text = "\n".join([f"- {l.tool_name} returned: {l.result}" for l in logs])
    messages = [
        {
            "role": "system",
            "content": (
                "You are the Synthesizer Agent. Your job is to provide a final, highly in-depth and comprehensive summary answer to the VC's query "
                "based strictly on the tool logs and found candidates. You must use a large amount of tokens (write as much detail as possible). "
                "Include detailed company descriptions, links/URLs found in the web searches, profiles of the founders, funding details, and why "
                "they fit or do not fit the user's criteria. Structure the report beautifully with markdown headers, bullet points, and tables if useful. "
                "If no candidates matched perfectly, explain what you DID find in the logs and list the sources/tools you used. "
                "Output ONLY the markdown summary string."
            )
        },
        {"role": "user", "content": f"Query: {query}\n\nTool Logs:\n{log_text}\n\nCandidates Found: {len(candidates)}\n\nPlease provide the final, highly detailed summary."}
    ]
    
    if log_callback:
        await log_callback({
            "type": "status",
            "data": "Synthesizer Agent is generating the final report..."
        })

    response_stream = await client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=10000,
        stream=True
    )
    
    async for chunk in response_stream:
        if chunk.choices and len(chunk.choices) > 0:
            content = chunk.choices[0].delta.content
            if content:
                if log_callback:
                    await log_callback({
                        "type": "stream_chunk",
                        "data": content
                    })

async def process_orchestrator_stream(query: str, log_callback: Optional[LogCallback] = None):
    """Agent 0: Orchestrator. The main entry point."""
    logs: List[ToolLog] = []
    
    if log_callback:
        await log_callback({"type": "status", "data": "Starting Discovery Phase..."})

    # Discovery Phase
    candidates = await run_discovery_agent(query, logs, log_callback)
    
    if log_callback:
        await log_callback({"type": "status", "data": f"Discovery Phase complete. Found {len(candidates)} candidates. Starting Deep Dive Phase..."})
    
    # Deep Dive Phase
    final_records = []
    for candidate in candidates[:3]:
        if log_callback:
            await log_callback({"type": "status", "data": f"Deep diving into candidate: {candidate}"})
        record = await run_deep_dive_agent(candidate, logs, log_callback)
        final_records.append(record)
        
    # Send candidates back so frontend can render them before streaming starts
    if log_callback:
        await log_callback({
            "type": "candidates",
            "data": [r.model_dump() for r in final_records]
        })
        
    # Synthesize Final Answer
    await run_synthesizer_agent_stream(query, logs, final_records, log_callback)
    
    if log_callback:
        await log_callback({"type": "done"})

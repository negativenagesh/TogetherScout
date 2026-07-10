from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
import json
import asyncio
from .agent import process_orchestrator_stream

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

@router.post("/chat")
async def radar_chat(request: Request, body: QueryRequest):
    async def event_generator():
        queue = asyncio.Queue()
        
        async def log_callback(event_data):
            await queue.put(event_data)
            
        async def run_orchestrator():
            try:
                await process_orchestrator_stream(body.query, log_callback)
                await queue.put({"type": "done"})
            except Exception as e:
                import traceback
                traceback.print_exc()
                await queue.put({"type": "error", "data": str(e)})
                await queue.put({"type": "done"})
                
        # Start orchestrator in background task
        task = asyncio.create_task(run_orchestrator())
        
        # Yield a 2KB padding chunk to bust any initial Nginx/Proxy buffering
        yield {"event": "padding", "data": " " * 2048}
        
        while True:
            # Yield events from the queue to the SSE stream
            event = await queue.get()
            yield {"data": json.dumps(event)}
            
            if event.get("type") in ["done", "error"]:
                break
                
    return EventSourceResponse(
        event_generator(),
        ping=15,
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )

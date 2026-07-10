from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
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
        yield f"event: padding\ndata: {' ' * 2048}\n\n"
        
        while True:
            # Yield events from the queue to the SSE stream
            event = await queue.get()
            data_str = json.dumps(event)
            yield f"data: {data_str}\n\n"
            
            if event.get("type") in ["done", "error"]:
                break
                
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )

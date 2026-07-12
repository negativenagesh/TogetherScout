from fastapi import APIRouter, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
from ..shared.db import get_db_pool
from ..shared.utils import get_real_ip, fetch_geoip

router = APIRouter()

class PageViewPayload(BaseModel):
    route: str
    os_name: Optional[str] = None
    browser_name: Optional[str] = None
    resolution: Optional[str] = None
    cpu_cores: Optional[int] = None
    ram_gb: Optional[int] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    referrer: Optional[str] = None

async def log_page_view_task(payload: PageViewPayload, ip: str):
    pool = await get_db_pool()
    if not pool:
        return

    geo = await fetch_geoip(ip)
    
    try:
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO visitors_audit (
                    route, ip_address, country, region, city, zip, lat, lon, isp, org,
                    os_name, browser_name, resolution, cpu_cores, ram_gb, timezone, language, referrer
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            """, 
                payload.route, ip, geo.get("country"), geo.get("region"), geo.get("city"), geo.get("zip"),
                geo.get("lat"), geo.get("lon"), geo.get("isp"), geo.get("org"),
                payload.os_name, payload.browser_name, payload.resolution, payload.cpu_cores, payload.ram_gb,
                payload.timezone, payload.language, payload.referrer
            )
    except Exception as e:
        print(f"Failed to log page view: {e}")

@router.post("/page_view")
async def record_page_view(payload: PageViewPayload, request: Request, background_tasks: BackgroundTasks):
    ip = get_real_ip(request)
    background_tasks.add_task(log_page_view_task, payload, ip)
    return {"status": "ok"}

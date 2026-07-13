from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .shared.data import seed_data
from .accelerator_autopsy.router import router as companies_router
from .founder_evaluator.router import router as founders_router
from .together_radar.router import router as radar_router
from .audit.router import router as audit_router
from .video.router import router as video_router
from .shared.db import close_db_pool

app = FastAPI(title="TogetherScout API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False, 
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    seed_data()
    print("In-memory data seeded.")

app.include_router(companies_router, prefix="/api")
app.include_router(founders_router, prefix="/api")
app.include_router(radar_router, prefix="/api/radar")
app.include_router(audit_router, prefix="/api/audit")
app.include_router(video_router, prefix="/api/video")

@app.on_event("shutdown")
async def shutdown_event():
    await close_db_pool()

@app.get("/")
def read_root():
    return {"message": "TogetherScout API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

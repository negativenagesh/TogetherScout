from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .shared.data import seed_data
from .accelerator_autopsy.router import router as companies_router
from .founder_evaluator.router import router as founders_router
from .together_radar.router import router as radar_router

app = FastAPI(title="TogetherScout API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow any origin (frontend) to connect
    allow_credentials=False, # Must be False when origin is *
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

@app.get("/")
def read_root():
    return {"message": "TogetherScout API is running"}

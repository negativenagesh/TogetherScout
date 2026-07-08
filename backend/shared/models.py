from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class StatusEnum(str, Enum):
    ACTIVE = "Active"
    ACQUIRED = "Acquired"
    PUBLIC = "Public"
    INACTIVE = "Inactive"

class StageEnum(str, Enum):
    SEED = "Seed"
    EARLY = "Early"
    GROWTH = "Growth"

class RoleEnum(str, Enum):
    TECHNICAL = "technical"
    BUSINESS = "business"
    DESIGN = "design"
    RESEARCH = "research"

class Company(BaseModel):
    id: str
    name: str
    one_liner: str
    description: Optional[str] = None
    source: str
    batch: str
    batch_year: str
    status: Optional[StatusEnum] = None
    stage: Optional[StageEnum] = None
    region: str
    country: Optional[str] = None
    city: Optional[str] = None
    team_size: Optional[int] = None
    is_hiring: bool = False
    website: Optional[str] = None
    logo_url: Optional[str] = None
    thesis_category: List[str] = []
    us_india_relevance_flag: bool = False
    together_fit_score: Optional[int] = None
    together_fit_rationale: Optional[str] = None
    last_updated: Optional[str] = None

class MetricBreakdown(BaseModel):
    metric_name: str
    score: int
    rationale: str

class FounderEvaluation(BaseModel):
    overall_score: int = Field(0, description="Overall conviction score out of 100")
    overall_rationale: str = Field("", description="A 3-4 sentence paragraph summarizing the holistic thesis on this founder")
    metrics_breakdown: List[MetricBreakdown] = []

class Founder(BaseModel):
    id: str
    first_name: str
    last_name: str
    avatar_thumb: Optional[str] = None
    current_company: Optional[str] = None
    company_slug: Optional[str] = None
    current_title: Optional[str] = None
    yc_industries: List[str] = []
    yc_titles: List[str] = []
    batches: List[str] = []
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    evaluation: Optional[FounderEvaluation] = None

class Evaluation(BaseModel):
    id: str
    founder_id: str
    rubric_used: str
    dimension_scores: Dict[str, int] = {}
    overall_score: int
    rationale: str
    evidence: List[str] = []
    risk_flags: List[str] = []
    recommendation: str
    created_at: str

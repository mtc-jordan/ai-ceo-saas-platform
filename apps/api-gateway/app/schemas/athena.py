"""Athena - AI Executive Advisor Schemas."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class ScenarioType(str, Enum):
    GROWTH = "growth"
    COST_REDUCTION = "cost_reduction"
    MARKET_EXPANSION = "market_expansion"
    PRODUCT_LAUNCH = "product_launch"
    ACQUISITION = "acquisition"
    PRICING = "pricing"
    CUSTOM = "custom"


class ScenarioStatus(str, Enum):
    DRAFT = "draft"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class AlertPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ============== Scenario Schemas ==============

class ScenarioVariable(BaseModel):
    """A variable that can be modified in a scenario."""
    name: str
    display_name: str
    current_value: float
    modified_value: float
    unit: str = ""
    category: str = "general"
    description: Optional[str] = None


class ScenarioOutcome(BaseModel):
    """Calculated outcome from a scenario."""
    metric: str
    display_name: str
    baseline_value: float
    projected_value: float
    change_percent: float
    confidence: float = 0.8
    unit: str = ""


class ScenarioCreate(BaseModel):
    """Create a new scenario."""
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    scenario_type: ScenarioType = ScenarioType.CUSTOM
    time_horizon_months: int = Field(default=12, ge=1, le=120)
    base_assumptions: Dict[str, Any] = Field(default_factory=dict)
    variables: List[Dict[str, Any]] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class ScenarioUpdate(BaseModel):
    """Update an existing scenario."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    scenario_type: Optional[ScenarioType] = None
    status: Optional[ScenarioStatus] = None
    time_horizon_months: Optional[int] = Field(None, ge=1, le=120)
    base_assumptions: Optional[Dict[str, Any]] = None
    variables: Optional[List[Dict[str, Any]]] = None
    is_favorite: Optional[bool] = None
    tags: Optional[List[str]] = None


class ScenarioResponse(BaseModel):
    """Scenario response."""
    id: str
    name: str
    description: Optional[str]
    scenario_type: ScenarioType
    status: ScenarioStatus
    time_horizon_months: int
    base_assumptions: Dict[str, Any]
    variables: List[Dict[str, Any]]
    outcomes: Dict[str, Any]
    ai_analysis: Optional[str]
    ai_recommendations: List[Dict[str, Any]]
    is_favorite: bool
    tags: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScenarioAnalysisRequest(BaseModel):
    """Request to analyze a scenario."""
    variables: List[Dict[str, Any]]
    include_ai_analysis: bool = True


class ScenarioAnalysisResponse(BaseModel):
    """Response from scenario analysis."""
    outcomes: List[ScenarioOutcome]
    ai_analysis: Optional[str]
    ai_recommendations: List[Dict[str, Any]]
    confidence_score: float
    warnings: List[str] = Field(default_factory=list)


# ============== Competitor Schemas ==============

class CompetitorCreate(BaseModel):
    """Create a new competitor."""
    name: str = Field(..., min_length=1, max_length=200)
    website: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    founded_year: Optional[int] = None
    headquarters: Optional[str] = None
    employee_count: Optional[str] = None
    funding_stage: Optional[str] = None
    total_funding: Optional[float] = None
    threat_level: int = Field(default=5, ge=1, le=10)
    market_overlap: float = Field(default=50, ge=0, le=100)
    is_primary: bool = False
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None


class CompetitorUpdate(BaseModel):
    """Update a competitor."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    website: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    founded_year: Optional[int] = None
    headquarters: Optional[str] = None
    employee_count: Optional[str] = None
    funding_stage: Optional[str] = None
    total_funding: Optional[float] = None
    threat_level: Optional[int] = Field(None, ge=1, le=10)
    market_overlap: Optional[float] = Field(None, ge=0, le=100)
    is_primary: Optional[bool] = None
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None


class CompetitorResponse(BaseModel):
    """Competitor response."""
    id: str
    name: str
    website: Optional[str]
    description: Optional[str]
    logo_url: Optional[str]
    industry: Optional[str]
    founded_year: Optional[int]
    headquarters: Optional[str]
    employee_count: Optional[str]
    funding_stage: Optional[str]
    total_funding: Optional[float]
    threat_level: int
    market_overlap: float
    is_primary: bool
    strengths: List[str]
    weaknesses: List[str]
    recent_moves: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompetitorProductCreate(BaseModel):
    """Create a competitor product."""
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    pricing_model: Optional[str] = None
    price_range: Optional[str] = None
    features: List[str] = Field(default_factory=list)
    target_market: Optional[str] = None


class CompetitorUpdateCreate(BaseModel):
    """Create a competitor update/news item."""
    title: str
    summary: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    update_type: str = "general"
    sentiment: str = "neutral"
    importance: int = Field(default=5, ge=1, le=10)
    published_at: Optional[datetime] = None


class CompetitorAnalysisResponse(BaseModel):
    """AI-generated competitor analysis."""
    competitor_id: str
    competitor_name: str
    overall_threat_assessment: str
    strengths: List[str]
    weaknesses: List[str]
    opportunities_against: List[str]
    threats_from: List[str]
    recommended_actions: List[Dict[str, Any]]
    market_position_summary: str


# ============== Market Intelligence Schemas ==============

class MarketIntelligenceCreate(BaseModel):
    """Create market intelligence item."""
    title: str
    summary: Optional[str] = None
    full_content: Optional[str] = None
    category: str
    subcategory: Optional[str] = None
    source_url: Optional[str] = None
    source_name: Optional[str] = None
    source_type: str = "news"
    tags: List[str] = Field(default_factory=list)


class MarketIntelligenceResponse(BaseModel):
    """Market intelligence response."""
    id: str
    title: str
    summary: Optional[str]
    category: str
    subcategory: Optional[str]
    source_url: Optional[str]
    source_name: Optional[str]
    relevance_score: float
    ai_summary: Optional[str]
    ai_implications: List[str]
    ai_action_items: List[Dict[str, Any]]
    tags: List[str]
    is_bookmarked: bool
    published_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class IndustryBenchmarkResponse(BaseModel):
    """Industry benchmark response."""
    id: str
    industry: str
    metric_name: str
    metric_category: Optional[str]
    p25_value: Optional[float]
    p50_value: Optional[float]
    p75_value: Optional[float]
    p90_value: Optional[float]
    company_value: Optional[float]
    company_percentile: Optional[float]
    unit: Optional[str]
    period: Optional[str]

    class Config:
        from_attributes = True


# ============== Strategic Recommendation Schemas ==============

class StrategicRecommendationResponse(BaseModel):
    """Strategic recommendation response."""
    id: str
    title: str
    description: Optional[str]
    rationale: Optional[str]
    category: Optional[str]
    priority: AlertPriority
    potential_impact: Optional[str]
    estimated_roi: Optional[float]
    confidence_score: Optional[float]
    action_items: List[Dict[str, Any]]
    resources_required: List[Dict[str, Any]]
    timeline_weeks: Optional[int]
    status: str
    source_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationStatusUpdate(BaseModel):
    """Update recommendation status."""
    status: str  # pending, in_progress, completed, dismissed
    dismissed_reason: Optional[str] = None


# ============== Executive Summary Schemas ==============

class ExecutiveSummaryResponse(BaseModel):
    """Executive summary response."""
    id: str
    period_type: str
    period_start: datetime
    period_end: datetime
    key_highlights: List[Dict[str, Any]]
    performance_summary: Dict[str, Any]
    competitive_landscape: Dict[str, Any]
    market_trends: List[Dict[str, Any]]
    risks_and_opportunities: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    executive_narrative: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class GenerateSummaryRequest(BaseModel):
    """Request to generate an executive summary."""
    period_type: str = "weekly"  # weekly, monthly, quarterly
    include_competitors: bool = True
    include_market_intel: bool = True
    include_scenarios: bool = True


# ============== Dashboard Schemas ==============

class AthenaDashboardResponse(BaseModel):
    """Athena dashboard overview."""
    active_scenarios_count: int
    tracked_competitors_count: int
    pending_recommendations_count: int
    recent_market_intel_count: int
    top_recommendations: List[StrategicRecommendationResponse]
    competitor_alerts: List[Dict[str, Any]]
    market_trends: List[Dict[str, Any]]
    latest_summary: Optional[ExecutiveSummaryResponse]

"""
GovernAI Schemas - Board Intelligence Platform
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


# ============ ENUMS ============

class MeetingStatusEnum(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MeetingTypeEnum(str, Enum):
    BOARD = "board"
    COMMITTEE = "committee"
    ANNUAL = "annual"
    SPECIAL = "special"
    EMERGENCY = "emergency"


class DocumentTypeEnum(str, Enum):
    AGENDA = "agenda"
    MINUTES = "minutes"
    FINANCIAL_REPORT = "financial_report"
    PRESENTATION = "presentation"
    RESOLUTION = "resolution"
    POLICY = "policy"
    CONTRACT = "contract"
    COMPLIANCE = "compliance"
    OTHER = "other"


class InvestmentStatusEnum(str, Enum):
    PROPOSED = "proposed"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    EXITED = "exited"


class RiskLevelEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ESGCategoryEnum(str, Enum):
    ENVIRONMENTAL = "environmental"
    SOCIAL = "social"
    GOVERNANCE = "governance"


# ============ BOARD MEMBER SCHEMAS ============

class BoardMemberBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    title: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None
    expertise: Optional[List[str]] = None
    committee_memberships: Optional[List[str]] = None
    is_independent: bool = False


class BoardMemberCreate(BoardMemberBase):
    appointed_date: Optional[datetime] = None
    term_end_date: Optional[datetime] = None


class BoardMemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    role: Optional[str] = None
    company: Optional[str] = None
    position: Optional[str] = None
    bio: Optional[str] = None
    expertise: Optional[List[str]] = None
    committee_memberships: Optional[List[str]] = None
    is_independent: Optional[bool] = None
    is_active: Optional[bool] = None


class BoardMemberResponse(BoardMemberBase):
    id: str
    organization_id: str
    appointed_date: Optional[datetime] = None
    term_end_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ BOARD MEETING SCHEMAS ============

class AgendaItemBase(BaseModel):
    order: int
    title: str
    description: Optional[str] = None
    duration_minutes: int = 15
    presenter_name: Optional[str] = None


class AgendaItemCreate(AgendaItemBase):
    presenter_id: Optional[str] = None


class AgendaItemResponse(AgendaItemBase):
    id: str
    meeting_id: str
    is_completed: bool
    notes: Optional[str] = None
    ai_talking_points: Optional[List[str]] = None
    ai_risk_flags: Optional[List[str]] = None

    class Config:
        from_attributes = True


class BoardMeetingBase(BaseModel):
    title: str
    meeting_type: MeetingTypeEnum = MeetingTypeEnum.BOARD
    scheduled_date: datetime
    scheduled_end_date: Optional[datetime] = None
    timezone: str = "UTC"
    location: Optional[str] = None
    virtual_link: Optional[str] = None
    is_virtual: bool = False
    description: Optional[str] = None
    objectives: Optional[List[str]] = None


class BoardMeetingCreate(BoardMeetingBase):
    agenda_items: Optional[List[AgendaItemCreate]] = None


class BoardMeetingUpdate(BaseModel):
    title: Optional[str] = None
    meeting_type: Optional[MeetingTypeEnum] = None
    status: Optional[MeetingStatusEnum] = None
    scheduled_date: Optional[datetime] = None
    scheduled_end_date: Optional[datetime] = None
    location: Optional[str] = None
    virtual_link: Optional[str] = None
    is_virtual: Optional[bool] = None
    description: Optional[str] = None
    objectives: Optional[List[str]] = None


class BoardMeetingResponse(BoardMeetingBase):
    id: str
    organization_id: str
    status: MeetingStatusEnum
    ai_briefing: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_action_items: Optional[List[dict]] = None
    quorum_required: int
    quorum_achieved: Optional[bool] = None
    created_at: datetime
    agenda_items: List[AgendaItemResponse] = []

    class Config:
        from_attributes = True


class MeetingBriefingRequest(BaseModel):
    include_financials: bool = True
    include_risks: bool = True
    include_recommendations: bool = True


class MeetingBriefingResponse(BaseModel):
    meeting_id: str
    briefing: str
    key_topics: List[str]
    risk_alerts: List[dict]
    recommended_actions: List[str]
    generated_at: datetime


# ============ DOCUMENT SCHEMAS ============

class BoardDocumentBase(BaseModel):
    title: str
    document_type: DocumentTypeEnum = DocumentTypeEnum.OTHER
    description: Optional[str] = None
    is_confidential: bool = False
    access_level: str = "board"


class BoardDocumentCreate(BoardDocumentBase):
    meeting_id: Optional[str] = None
    agenda_item_id: Optional[str] = None
    content: Optional[str] = None


class BoardDocumentResponse(BoardDocumentBase):
    id: str
    organization_id: str
    meeting_id: Optional[str] = None
    status: str
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    ai_summary: Optional[str] = None
    ai_key_points: Optional[List[str]] = None
    version: int
    created_at: datetime

    class Config:
        from_attributes = True


# ============ RESOLUTION SCHEMAS ============

class ResolutionBase(BaseModel):
    title: str
    description: str
    resolution_type: str = "ordinary"
    approval_threshold: float = 50.0
    requires_supermajority: bool = False


class ResolutionCreate(ResolutionBase):
    meeting_id: Optional[str] = None
    voting_deadline: Optional[datetime] = None


class ResolutionVoteCreate(BaseModel):
    vote: str  # for, against, abstain
    comments: Optional[str] = None


class ResolutionResponse(ResolutionBase):
    id: str
    organization_id: str
    meeting_id: Optional[str] = None
    resolution_number: Optional[str] = None
    status: str
    votes_for: int
    votes_against: int
    votes_abstain: int
    voting_deadline: Optional[datetime] = None
    ai_impact_analysis: Optional[str] = None
    ai_recommendation: Optional[str] = None
    ai_reasoning: Optional[str] = None
    created_at: datetime
    passed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============ INVESTMENT SCHEMAS ============

class InvestmentBase(BaseModel):
    name: str
    investment_type: str = "equity"
    target_company: Optional[str] = None
    target_website: Optional[str] = None
    industry: Optional[str] = None
    description: Optional[str] = None
    investment_amount: Optional[float] = None
    currency: str = "USD"
    ownership_percentage: Optional[float] = None
    valuation: Optional[float] = None
    expected_irr: Optional[float] = None
    expected_multiple: Optional[float] = None
    risk_level: RiskLevelEnum = RiskLevelEnum.MEDIUM
    risk_factors: Optional[List[str]] = None


class InvestmentCreate(InvestmentBase):
    investment_date: Optional[datetime] = None
    expected_exit_date: Optional[datetime] = None


class InvestmentUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[InvestmentStatusEnum] = None
    current_value: Optional[float] = None
    actual_irr: Optional[float] = None
    actual_multiple: Optional[float] = None
    risk_level: Optional[RiskLevelEnum] = None
    risk_factors: Optional[List[str]] = None


class InvestmentResponse(InvestmentBase):
    id: str
    organization_id: str
    status: str
    current_value: Optional[float] = None
    actual_irr: Optional[float] = None
    actual_multiple: Optional[float] = None
    investment_date: Optional[datetime] = None
    expected_exit_date: Optional[datetime] = None
    ai_analysis: Optional[str] = None
    ai_recommendation: Optional[str] = None
    ai_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class InvestmentAnalysisRequest(BaseModel):
    include_comparables: bool = True
    include_risks: bool = True
    include_projections: bool = True


class InvestmentAnalysisResponse(BaseModel):
    investment_id: str
    analysis: str
    recommendation: str
    score: float
    risk_assessment: dict
    comparable_deals: List[dict]
    projections: dict
    generated_at: datetime


# ============ COMPLIANCE SCHEMAS ============

class ComplianceItemBase(BaseModel):
    title: str
    category: str
    regulation: Optional[str] = None
    description: Optional[str] = None
    risk_level: RiskLevelEnum = RiskLevelEnum.MEDIUM
    due_date: Optional[datetime] = None
    responsible_party: Optional[str] = None
    evidence_required: Optional[str] = None


class ComplianceItemCreate(ComplianceItemBase):
    pass


class ComplianceItemUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    risk_level: Optional[RiskLevelEnum] = None
    evidence_provided: Optional[str] = None
    next_review_date: Optional[datetime] = None


class ComplianceItemResponse(ComplianceItemBase):
    id: str
    organization_id: str
    status: str
    last_review_date: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    ai_risk_assessment: Optional[str] = None
    ai_recommendations: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============ ESG SCHEMAS ============

class ESGMetricBase(BaseModel):
    category: ESGCategoryEnum
    metric_name: str
    description: Optional[str] = None
    current_value: Optional[float] = None
    target_value: Optional[float] = None
    unit: Optional[str] = None
    reporting_period: Optional[str] = None


class ESGMetricCreate(ESGMetricBase):
    weight: float = 1.0


class ESGMetricResponse(ESGMetricBase):
    id: str
    organization_id: str
    score: Optional[float] = None
    industry_average: Optional[float] = None
    best_in_class: Optional[float] = None
    ai_trend_analysis: Optional[str] = None
    ai_improvement_suggestions: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ESGReportCreate(BaseModel):
    title: str
    reporting_period: str
    report_type: str = "annual"


class ESGReportResponse(BaseModel):
    id: str
    organization_id: str
    title: str
    reporting_period: str
    report_type: str
    environmental_score: Optional[float] = None
    social_score: Optional[float] = None
    governance_score: Optional[float] = None
    overall_score: Optional[float] = None
    executive_summary: Optional[str] = None
    highlights: Optional[List[str]] = None
    challenges: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    ai_analysis: Optional[str] = None
    ai_recommendations: Optional[List[str]] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ DASHBOARD SCHEMAS ============

class GovernAIDashboard(BaseModel):
    upcoming_meetings: int
    pending_resolutions: int
    active_investments: int
    compliance_alerts: int
    esg_score: Optional[float] = None
    recent_meetings: List[dict]
    pending_actions: List[dict]
    risk_summary: dict

"""
GovernAI Models - Board Intelligence Platform
"""
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base
import enum


# ============ ENUMS ============

class MeetingStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MeetingType(str, enum.Enum):
    BOARD = "board"
    COMMITTEE = "committee"
    ANNUAL = "annual"
    SPECIAL = "special"
    EMERGENCY = "emergency"


class DocumentType(str, enum.Enum):
    AGENDA = "agenda"
    MINUTES = "minutes"
    FINANCIAL_REPORT = "financial_report"
    PRESENTATION = "presentation"
    RESOLUTION = "resolution"
    POLICY = "policy"
    CONTRACT = "contract"
    COMPLIANCE = "compliance"
    OTHER = "other"


class DocumentStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    ARCHIVED = "archived"


class InvestmentStatus(str, enum.Enum):
    PROPOSED = "proposed"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    EXITED = "exited"


class InvestmentType(str, enum.Enum):
    EQUITY = "equity"
    DEBT = "debt"
    CONVERTIBLE = "convertible"
    REAL_ESTATE = "real_estate"
    VENTURE = "venture"
    PRIVATE_EQUITY = "private_equity"
    PUBLIC_EQUITY = "public_equity"
    OTHER = "other"


class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ComplianceStatus(str, enum.Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PENDING_REVIEW = "pending_review"
    REMEDIATION = "remediation"


class ESGCategory(str, enum.Enum):
    ENVIRONMENTAL = "environmental"
    SOCIAL = "social"
    GOVERNANCE = "governance"


# ============ BOARD MEMBERS ============

class BoardMember(Base):
    __tablename__ = "board_members"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False)
    
    # Personal Info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50))
    photo_url = Column(String(500))
    
    # Role Info
    title = Column(String(100))  # e.g., "Chairman", "Director", "Independent Director"
    role = Column(String(50))  # e.g., "chair", "member", "secretary"
    committee_memberships = Column(JSON)  # List of committee names
    
    # Professional Info
    company = Column(String(200))
    position = Column(String(200))
    bio = Column(Text)
    expertise = Column(JSON)  # List of expertise areas
    
    # Term Info
    appointed_date = Column(DateTime)
    term_end_date = Column(DateTime)
    is_independent = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships removed due to no foreign keys


# ============ BOARD MEETINGS ============

class BoardMeeting(Base):
    __tablename__ = "board_meetings"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False)
    
    # Meeting Info
    title = Column(String(255), nullable=False)
    meeting_type = Column(Enum(MeetingType), default=MeetingType.BOARD)
    status = Column(Enum(MeetingStatus), default=MeetingStatus.DRAFT)
    
    # Schedule
    scheduled_date = Column(DateTime, nullable=False)
    scheduled_end_date = Column(DateTime)
    timezone = Column(String(50), default="UTC")
    location = Column(String(255))
    virtual_link = Column(String(500))
    is_virtual = Column(Boolean, default=False)
    
    # Content
    description = Column(Text)
    objectives = Column(JSON)  # List of meeting objectives
    
    # AI-Generated Content
    ai_briefing = Column(Text)  # AI-generated pre-meeting briefing
    ai_summary = Column(Text)  # AI-generated post-meeting summary
    ai_action_items = Column(JSON)  # AI-extracted action items
    
    # Metadata
    quorum_required = Column(Integer, default=50)  # Percentage
    quorum_achieved = Column(Boolean)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(String(36))
    
    # Relationships


class AgendaItem(Base):
    __tablename__ = "agenda_items"
    
    id = Column(String(36), primary_key=True)
    meeting_id = Column(String(36), nullable=False)
    
    # Item Info
    order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    duration_minutes = Column(Integer, default=15)
    
    # Presenter
    presenter_id = Column(String(36))
    presenter_name = Column(String(200))
    
    # Status
    is_completed = Column(Boolean, default=False)
    notes = Column(Text)
    
    # AI Analysis
    ai_talking_points = Column(JSON)  # AI-suggested talking points
    ai_risk_flags = Column(JSON)  # AI-identified risks
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships


class MeetingAttendance(Base):
    __tablename__ = "meeting_attendances"
    
    id = Column(String(36), primary_key=True)
    meeting_id = Column(String(36), nullable=False)
    member_id = Column(String(36), nullable=False)
    
    # Attendance Info
    status = Column(String(20), default="invited")  # invited, confirmed, attended, absent, excused
    attended = Column(Boolean)
    joined_at = Column(DateTime)
    left_at = Column(DateTime)
    notes = Column(Text)
    
    # Proxy
    is_proxy = Column(Boolean, default=False)
    proxy_for_id = Column(String(36))
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships


# ============ DOCUMENTS ============

class BoardDocument(Base):
    __tablename__ = "board_documents"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False)
    meeting_id = Column(String(36))
    agenda_item_id = Column(String(36))
    
    # Document Info
    title = Column(String(255), nullable=False)
    document_type = Column(Enum(DocumentType), default=DocumentType.OTHER)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.DRAFT)
    
    # File Info
    file_name = Column(String(255))
    file_url = Column(String(500))
    file_size = Column(Integer)  # bytes
    mime_type = Column(String(100))
    
    # Content
    description = Column(Text)
    content = Column(Text)  # For text-based documents
    
    # AI Analysis
    ai_summary = Column(Text)  # AI-generated summary
    ai_key_points = Column(JSON)  # AI-extracted key points
    ai_risk_assessment = Column(Text)  # AI risk analysis
    
    # Version Control
    version = Column(Integer, default=1)
    parent_document_id = Column(String(36))
    
    # Access Control
    is_confidential = Column(Boolean, default=False)
    access_level = Column(String(20), default="board")  # board, committee, public
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(String(36))
    
    # Relationships


# ============ RESOLUTIONS ============

class Resolution(Base):
    __tablename__ = "resolutions"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False)
    meeting_id = Column(String(36))
    
    # Resolution Info
    resolution_number = Column(String(50))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    resolution_type = Column(String(50))  # ordinary, special, written
    
    # Status
    status = Column(String(20), default="proposed")  # proposed, voting, passed, failed, withdrawn
    
    # Voting
    votes_for = Column(Integer, default=0)
    votes_against = Column(Integer, default=0)
    votes_abstain = Column(Integer, default=0)
    voting_deadline = Column(DateTime)
    
    # Requirements
    approval_threshold = Column(Float, default=50.0)  # Percentage needed to pass
    requires_supermajority = Column(Boolean, default=False)
    
    # AI Analysis
    ai_impact_analysis = Column(Text)
    ai_recommendation = Column(String(20))  # approve, reject, defer
    ai_reasoning = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    passed_at = Column(DateTime)
    
    # Relationships


class ResolutionVote(Base):
    __tablename__ = "resolution_votes"
    
    id = Column(String(36), primary_key=True)
    resolution_id = Column(String(36), nullable=False)
    member_id = Column(String(36), nullable=False)
    
    # Vote Info
    vote = Column(String(10), nullable=False)  # for, against, abstain
    comments = Column(Text)
    voted_at = Column(DateTime, server_default=func.now())
    
    # Relationships


# ============ INVESTMENTS ============

class Investment(Base):
    __tablename__ = "investments"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False)
    
    # Investment Info
    name = Column(String(255), nullable=False)
    investment_type = Column(Enum(InvestmentType), default=InvestmentType.EQUITY)
    status = Column(Enum(InvestmentStatus), default=InvestmentStatus.PROPOSED)
    
    # Company/Asset Info
    target_company = Column(String(255))
    target_website = Column(String(500))
    industry = Column(String(100))
    description = Column(Text)
    
    # Financial Details
    investment_amount = Column(Float)
    currency = Column(String(3), default="USD")
    ownership_percentage = Column(Float)
    valuation = Column(Float)
    current_value = Column(Float)
    
    # Returns
    expected_irr = Column(Float)  # Internal Rate of Return
    actual_irr = Column(Float)
    expected_multiple = Column(Float)
    actual_multiple = Column(Float)
    
    # Timeline
    investment_date = Column(DateTime)
    expected_exit_date = Column(DateTime)
    actual_exit_date = Column(DateTime)
    holding_period_months = Column(Integer)
    
    # Risk Assessment
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.MEDIUM)
    risk_factors = Column(JSON)  # List of risk factors
    
    # AI Analysis
    ai_analysis = Column(Text)
    ai_recommendation = Column(String(20))  # invest, pass, hold, exit
    ai_score = Column(Float)  # 0-100
    ai_comparable_deals = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(String(36))
    
    # Relationships


class InvestmentMetric(Base):
    __tablename__ = "investment_metrics"
    
    id = Column(String(36), primary_key=True)
    investment_id = Column(String(36), ForeignKey("investments.id"), nullable=False)
    
    # Metric Info
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float)
    metric_unit = Column(String(50))
    period = Column(String(20))  # Q1 2024, 2024, etc.
    
    # Comparison
    previous_value = Column(Float)
    change_percentage = Column(Float)
    
    # Timestamps
    recorded_at = Column(DateTime, server_default=func.now())
    
    # Relationships


# ============ ESG & COMPLIANCE ============

class ComplianceItem(Base):
    __tablename__ = "compliance_items"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False)
    
    # Compliance Info
    title = Column(String(255), nullable=False)
    category = Column(String(50))  # regulatory, legal, internal, industry
    regulation = Column(String(255))  # e.g., "SOX", "GDPR", "SEC Rule 10b-5"
    description = Column(Text)
    
    # Status
    status = Column(Enum(ComplianceStatus), default=ComplianceStatus.PENDING_REVIEW)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.MEDIUM)
    
    # Dates
    due_date = Column(DateTime)
    last_review_date = Column(DateTime)
    next_review_date = Column(DateTime)
    
    # Responsibility
    responsible_party = Column(String(200))
    reviewer_id = Column(String(36))
    
    # Evidence
    evidence_required = Column(Text)
    evidence_provided = Column(Text)
    evidence_documents = Column(JSON)  # List of document IDs
    
    # AI Analysis
    ai_risk_assessment = Column(Text)
    ai_recommendations = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ESGMetric(Base):
    __tablename__ = "esg_metrics"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False)
    
    # ESG Info
    category = Column(Enum(ESGCategory), nullable=False)
    metric_name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Values
    current_value = Column(Float)
    target_value = Column(Float)
    unit = Column(String(50))
    
    # Scoring
    score = Column(Float)  # 0-100
    weight = Column(Float, default=1.0)
    
    # Benchmarks
    industry_average = Column(Float)
    best_in_class = Column(Float)
    
    # Period
    reporting_period = Column(String(20))
    
    # AI Insights
    ai_trend_analysis = Column(Text)
    ai_improvement_suggestions = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ESGReport(Base):
    __tablename__ = "esg_reports"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False)
    
    # Report Info
    title = Column(String(255), nullable=False)
    reporting_period = Column(String(50))
    report_type = Column(String(50))  # annual, quarterly, special
    
    # Scores
    environmental_score = Column(Float)
    social_score = Column(Float)
    governance_score = Column(Float)
    overall_score = Column(Float)
    
    # Content
    executive_summary = Column(Text)
    highlights = Column(JSON)
    challenges = Column(JSON)
    goals = Column(JSON)
    
    # AI Generated
    ai_generated = Column(Boolean, default=False)
    ai_analysis = Column(Text)
    ai_recommendations = Column(JSON)
    
    # Status
    status = Column(String(20), default="draft")  # draft, review, published
    published_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    created_by = Column(String(36))

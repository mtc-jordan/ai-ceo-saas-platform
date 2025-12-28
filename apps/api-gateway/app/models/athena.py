"""Athena - AI Executive Advisor Models."""
import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, String, Text, Float, Integer, Boolean, DateTime, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import enum

from app.db.session import Base


class ScenarioType(str, enum.Enum):
    GROWTH = "growth"
    COST_REDUCTION = "cost_reduction"
    MARKET_EXPANSION = "market_expansion"
    PRODUCT_LAUNCH = "product_launch"
    ACQUISITION = "acquisition"
    PRICING = "pricing"
    CUSTOM = "custom"


class ScenarioStatus(str, enum.Enum):
    DRAFT = "draft"
    ANALYZING = "analyzing"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class CompetitorStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ACQUIRED = "acquired"
    DEFUNCT = "defunct"


class AlertPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ============== Scenario Planning Models ==============

class Scenario(Base):
    """Strategic scenario for what-if analysis."""
    __tablename__ = "scenarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    name = Column(String(200), nullable=False)
    description = Column(Text)
    scenario_type = Column(SQLEnum(ScenarioType), default=ScenarioType.CUSTOM)
    status = Column(SQLEnum(ScenarioStatus), default=ScenarioStatus.DRAFT)
    
    # Base assumptions (JSON structure)
    base_assumptions = Column(JSON, default=dict)
    # Variables to modify in scenario
    variables = Column(JSON, default=list)
    # Calculated outcomes
    outcomes = Column(JSON, default=dict)
    # AI-generated analysis
    ai_analysis = Column(Text)
    ai_recommendations = Column(JSON, default=list)
    
    # Timeline
    time_horizon_months = Column(Integer, default=12)
    
    # Metadata
    is_favorite = Column(Boolean, default=False)
    tags = Column(ARRAY(String), default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", backref="scenarios")
    created_by = relationship("User", backref="created_scenarios")
    versions = relationship("ScenarioVersion", back_populates="scenario", cascade="all, delete-orphan")


class ScenarioVersion(Base):
    """Version history for scenarios."""
    __tablename__ = "scenario_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("scenarios.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    
    variables = Column(JSON, default=list)
    outcomes = Column(JSON, default=dict)
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    scenario = relationship("Scenario", back_populates="versions")


class ScenarioComparison(Base):
    """Compare multiple scenarios side by side."""
    __tablename__ = "scenario_comparisons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    name = Column(String(200), nullable=False)
    description = Column(Text)
    scenario_ids = Column(ARRAY(UUID(as_uuid=True)), default=list)
    comparison_metrics = Column(JSON, default=list)
    ai_recommendation = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)


# ============== Competitor Tracking Models ==============

class Competitor(Base):
    """Tracked competitor company."""
    __tablename__ = "competitors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    name = Column(String(200), nullable=False)
    website = Column(String(500))
    description = Column(Text)
    logo_url = Column(String(500))
    
    # Company info
    industry = Column(String(100))
    founded_year = Column(Integer)
    headquarters = Column(String(200))
    employee_count = Column(String(50))  # Range like "50-100"
    funding_stage = Column(String(50))
    total_funding = Column(Float)
    
    # Competitive positioning
    threat_level = Column(Integer, default=5)  # 1-10 scale
    market_overlap = Column(Float, default=0)  # Percentage 0-100
    
    # Tracking
    status = Column(SQLEnum(CompetitorStatus), default=CompetitorStatus.ACTIVE)
    is_primary = Column(Boolean, default=False)
    
    # Social/web presence
    linkedin_url = Column(String(500))
    twitter_handle = Column(String(100))
    crunchbase_url = Column(String(500))
    
    # AI-generated insights
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    recent_moves = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", backref="competitors")
    updates = relationship("CompetitorUpdate", back_populates="competitor", cascade="all, delete-orphan")
    products = relationship("CompetitorProduct", back_populates="competitor", cascade="all, delete-orphan")


class CompetitorUpdate(Base):
    """News and updates about competitors."""
    __tablename__ = "competitor_updates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    competitor_id = Column(UUID(as_uuid=True), ForeignKey("competitors.id"), nullable=False)
    
    title = Column(String(500), nullable=False)
    summary = Column(Text)
    source_url = Column(String(1000))
    source_name = Column(String(200))
    
    update_type = Column(String(50))  # funding, product, hiring, partnership, etc.
    sentiment = Column(String(20))  # positive, negative, neutral
    importance = Column(Integer, default=5)  # 1-10
    
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    competitor = relationship("Competitor", back_populates="updates")


class CompetitorProduct(Base):
    """Competitor's products/services."""
    __tablename__ = "competitor_products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    competitor_id = Column(UUID(as_uuid=True), ForeignKey("competitors.id"), nullable=False)
    
    name = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    pricing_model = Column(String(100))
    price_range = Column(String(100))
    
    features = Column(JSON, default=list)
    target_market = Column(String(200))
    
    # Comparison to our product
    overlap_score = Column(Float, default=0)  # 0-100
    competitive_advantage = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    competitor = relationship("Competitor", back_populates="products")


# ============== Market Intelligence Models ==============

class MarketIntelligence(Base):
    """Market trends and intelligence data."""
    __tablename__ = "market_intelligence"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    title = Column(String(500), nullable=False)
    summary = Column(Text)
    full_content = Column(Text)
    
    category = Column(String(100))  # industry_trend, regulation, technology, economic
    subcategory = Column(String(100))
    
    source_url = Column(String(1000))
    source_name = Column(String(200))
    source_type = Column(String(50))  # news, report, social, government
    
    relevance_score = Column(Float, default=0)  # 0-100
    impact_assessment = Column(Text)
    
    # AI analysis
    ai_summary = Column(Text)
    ai_implications = Column(JSON, default=list)
    ai_action_items = Column(JSON, default=list)
    
    published_at = Column(DateTime)
    expires_at = Column(DateTime)  # When this intel becomes stale
    
    tags = Column(ARRAY(String), default=list)
    is_bookmarked = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    organization = relationship("Organization", backref="market_intelligence")


class IndustryBenchmark(Base):
    """Industry benchmark data for comparison."""
    __tablename__ = "industry_benchmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    industry = Column(String(100), nullable=False)
    metric_name = Column(String(100), nullable=False)
    metric_category = Column(String(100))  # financial, operational, growth, etc.
    
    # Benchmark values
    p25_value = Column(Float)  # 25th percentile
    p50_value = Column(Float)  # Median
    p75_value = Column(Float)  # 75th percentile
    p90_value = Column(Float)  # Top 10%
    
    # Your company's value
    company_value = Column(Float)
    company_percentile = Column(Float)
    
    unit = Column(String(50))
    period = Column(String(50))  # Q1 2024, FY 2023, etc.
    source = Column(String(200))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ============== Strategic Recommendations Models ==============

class StrategicRecommendation(Base):
    """AI-generated strategic recommendations."""
    __tablename__ = "strategic_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    title = Column(String(300), nullable=False)
    description = Column(Text)
    rationale = Column(Text)
    
    category = Column(String(100))  # growth, efficiency, risk, opportunity
    priority = Column(SQLEnum(AlertPriority), default=AlertPriority.MEDIUM)
    
    # Impact assessment
    potential_impact = Column(Text)
    estimated_roi = Column(Float)
    confidence_score = Column(Float)  # 0-100
    
    # Implementation
    action_items = Column(JSON, default=list)
    resources_required = Column(JSON, default=list)
    timeline_weeks = Column(Integer)
    
    # Status tracking
    status = Column(String(50), default="pending")  # pending, in_progress, completed, dismissed
    dismissed_reason = Column(Text)
    
    # Source data that led to this recommendation
    source_type = Column(String(50))  # scenario, competitor, market, metrics
    source_id = Column(UUID(as_uuid=True))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    organization = relationship("Organization", backref="strategic_recommendations")


class ExecutiveSummary(Base):
    """Weekly/monthly executive summary."""
    __tablename__ = "executive_summaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    period_type = Column(String(20))  # weekly, monthly, quarterly
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Summary sections
    key_highlights = Column(JSON, default=list)
    performance_summary = Column(JSON, default=dict)
    competitive_landscape = Column(JSON, default=dict)
    market_trends = Column(JSON, default=list)
    risks_and_opportunities = Column(JSON, default=dict)
    recommendations = Column(JSON, default=list)
    
    # Full narrative
    executive_narrative = Column(Text)
    
    # Metrics snapshot
    metrics_snapshot = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    organization = relationship("Organization", backref="executive_summaries")

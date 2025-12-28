"""Athena Market Intelligence and Strategic Recommendations API Endpoints."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import Organization
from app.models.athena import AlertPriority
from app.schemas.athena import (
    MarketIntelligenceCreate, MarketIntelligenceResponse,
    IndustryBenchmarkResponse, StrategicRecommendationResponse,
    ExecutiveSummaryResponse, GenerateSummaryRequest,
    RecommendationStatusUpdate
)
from app.services.athena.market_intelligence_service import MarketIntelligenceService
from app.api.v1.endpoints.settings import get_user_organization

router = APIRouter()


# ============== Market Intelligence ==============

@router.post("/intelligence", response_model=MarketIntelligenceResponse)
async def create_intelligence(
    data: MarketIntelligenceCreate,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Create a market intelligence item."""
    service = MarketIntelligenceService(db)
    intel = await service.create_intelligence(org.id, data)
    return MarketIntelligenceResponse(
        id=str(intel.id),
        title=intel.title,
        summary=intel.summary,
        category=intel.category,
        subcategory=intel.subcategory,
        source_url=intel.source_url,
        source_name=intel.source_name,
        relevance_score=intel.relevance_score,
        ai_summary=intel.ai_summary,
        ai_implications=intel.ai_implications or [],
        ai_action_items=intel.ai_action_items or [],
        tags=intel.tags or [],
        is_bookmarked=intel.is_bookmarked,
        published_at=intel.published_at,
        created_at=intel.created_at
    )


@router.get("/intelligence", response_model=List[MarketIntelligenceResponse])
async def list_intelligence(
    category: Optional[str] = None,
    is_bookmarked: Optional[bool] = None,
    min_relevance: Optional[float] = Query(None, ge=0, le=100),
    days: int = Query(default=30, le=365),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """List market intelligence items."""
    service = MarketIntelligenceService(db)
    items = await service.list_intelligence(
        org.id, category, is_bookmarked, min_relevance, days, limit, offset
    )
    return [
        MarketIntelligenceResponse(
            id=str(i.id),
            title=i.title,
            summary=i.summary,
            category=i.category,
            subcategory=i.subcategory,
            source_url=i.source_url,
            source_name=i.source_name,
            relevance_score=i.relevance_score,
            ai_summary=i.ai_summary,
            ai_implications=i.ai_implications or [],
            ai_action_items=i.ai_action_items or [],
            tags=i.tags or [],
            is_bookmarked=i.is_bookmarked,
            published_at=i.published_at,
            created_at=i.created_at
        )
        for i in items
    ]


@router.get("/intelligence/trending")
async def get_trending_topics(
    days: int = Query(default=7, le=30),
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get trending topics from market intelligence."""
    service = MarketIntelligenceService(db)
    return await service.get_trending_topics(org.id, days)


@router.post("/intelligence/{intel_id}/bookmark")
async def toggle_bookmark(
    intel_id: UUID,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Toggle bookmark status for an intelligence item."""
    service = MarketIntelligenceService(db)
    is_bookmarked = await service.toggle_bookmark(intel_id, org.id)
    return {"is_bookmarked": is_bookmarked}


# ============== Industry Benchmarks ==============

@router.get("/benchmarks", response_model=List[IndustryBenchmarkResponse])
async def list_benchmarks(
    industry: Optional[str] = None,
    metric_category: Optional[str] = None,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """List industry benchmarks."""
    service = MarketIntelligenceService(db)
    benchmarks = await service.list_benchmarks(org.id, industry, metric_category)
    return [
        IndustryBenchmarkResponse(
            id=str(b.id),
            industry=b.industry,
            metric_name=b.metric_name,
            metric_category=b.metric_category,
            p25_value=b.p25_value,
            p50_value=b.p50_value,
            p75_value=b.p75_value,
            p90_value=b.p90_value,
            company_value=b.company_value,
            company_percentile=b.company_percentile,
            unit=b.unit,
            period=b.period
        )
        for b in benchmarks
    ]


@router.get("/benchmarks/summary")
async def get_benchmark_summary(
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get summary of company performance vs benchmarks."""
    service = MarketIntelligenceService(db)
    return await service.get_benchmark_summary(org.id)


@router.post("/benchmarks")
async def create_benchmark(
    industry: str,
    metric_name: str,
    metric_category: str,
    p25: float,
    p50: float,
    p75: float,
    p90: float,
    company_value: Optional[float] = None,
    unit: str = "",
    period: str = "",
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Create an industry benchmark."""
    service = MarketIntelligenceService(db)
    benchmark = await service.create_benchmark(
        org.id, industry, metric_name, metric_category,
        {"p25": p25, "p50": p50, "p75": p75, "p90": p90, "unit": unit, "period": period},
        company_value
    )
    return {
        "id": str(benchmark.id),
        "industry": benchmark.industry,
        "metric_name": benchmark.metric_name,
        "company_percentile": benchmark.company_percentile
    }


# ============== Strategic Recommendations ==============

@router.get("/recommendations", response_model=List[StrategicRecommendationResponse])
async def list_recommendations(
    status: Optional[str] = None,
    category: Optional[str] = None,
    priority: Optional[AlertPriority] = None,
    limit: int = Query(default=50, le=100),
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """List strategic recommendations."""
    service = MarketIntelligenceService(db)
    recs = await service.list_recommendations(org.id, status, category, priority, limit)
    return [
        StrategicRecommendationResponse(
            id=str(r.id),
            title=r.title,
            description=r.description,
            rationale=r.rationale,
            category=r.category,
            priority=r.priority,
            potential_impact=r.potential_impact,
            estimated_roi=r.estimated_roi,
            confidence_score=r.confidence_score,
            action_items=r.action_items or [],
            resources_required=r.resources_required or [],
            timeline_weeks=r.timeline_weeks,
            status=r.status,
            source_type=r.source_type,
            created_at=r.created_at
        )
        for r in recs
    ]


@router.patch("/recommendations/{rec_id}/status")
async def update_recommendation_status(
    rec_id: UUID,
    data: RecommendationStatusUpdate,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Update recommendation status."""
    service = MarketIntelligenceService(db)
    rec = await service.update_recommendation_status(
        rec_id, org.id, data.status, data.dismissed_reason
    )
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    return {"status": rec.status}


# ============== Executive Summaries ==============

@router.post("/summaries/generate", response_model=ExecutiveSummaryResponse)
async def generate_executive_summary(
    request: GenerateSummaryRequest,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Generate an executive summary."""
    service = MarketIntelligenceService(db)
    summary = await service.generate_executive_summary(org.id, request)
    return ExecutiveSummaryResponse(
        id=str(summary.id),
        period_type=summary.period_type,
        period_start=summary.period_start,
        period_end=summary.period_end,
        key_highlights=summary.key_highlights or [],
        performance_summary=summary.performance_summary or {},
        competitive_landscape=summary.competitive_landscape or {},
        market_trends=summary.market_trends or [],
        risks_and_opportunities=summary.risks_and_opportunities or {},
        recommendations=summary.recommendations or [],
        executive_narrative=summary.executive_narrative,
        created_at=summary.created_at
    )


@router.get("/summaries/latest", response_model=Optional[ExecutiveSummaryResponse])
async def get_latest_summary(
    period_type: Optional[str] = None,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get the most recent executive summary."""
    service = MarketIntelligenceService(db)
    summary = await service.get_latest_summary(org.id, period_type)
    if not summary:
        return None
    return ExecutiveSummaryResponse(
        id=str(summary.id),
        period_type=summary.period_type,
        period_start=summary.period_start,
        period_end=summary.period_end,
        key_highlights=summary.key_highlights or [],
        performance_summary=summary.performance_summary or {},
        competitive_landscape=summary.competitive_landscape or {},
        market_trends=summary.market_trends or [],
        risks_and_opportunities=summary.risks_and_opportunities or {},
        recommendations=summary.recommendations or [],
        executive_narrative=summary.executive_narrative,
        created_at=summary.created_at
    )


@router.get("/summaries", response_model=List[ExecutiveSummaryResponse])
async def list_summaries(
    period_type: Optional[str] = None,
    limit: int = Query(default=10, le=50),
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """List executive summaries."""
    service = MarketIntelligenceService(db)
    summaries = await service.list_summaries(org.id, period_type, limit)
    return [
        ExecutiveSummaryResponse(
            id=str(s.id),
            period_type=s.period_type,
            period_start=s.period_start,
            period_end=s.period_end,
            key_highlights=s.key_highlights or [],
            performance_summary=s.performance_summary or {},
            competitive_landscape=s.competitive_landscape or {},
            market_trends=s.market_trends or [],
            risks_and_opportunities=s.risks_and_opportunities or {},
            recommendations=s.recommendations or [],
            executive_narrative=s.executive_narrative,
            created_at=s.created_at
        )
        for s in summaries
    ]


# ============== Dashboard ==============

@router.get("/dashboard")
async def get_athena_dashboard(
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get Athena dashboard overview."""
    from app.services.athena.scenario_service import ScenarioService
    from app.services.athena.competitor_service import CompetitorService
    
    scenario_service = ScenarioService(db)
    competitor_service = CompetitorService(db)
    intel_service = MarketIntelligenceService(db)
    
    # Get counts and data
    scenarios = await scenario_service.list_scenarios(org.id, limit=100)
    competitors = await competitor_service.list_competitors(org.id, limit=100)
    recommendations = await intel_service.list_recommendations(org.id, status="pending", limit=5)
    intel = await intel_service.list_intelligence(org.id, days=7, limit=5)
    latest_summary = await intel_service.get_latest_summary(org.id)
    competitive_landscape = await competitor_service.get_competitive_landscape(org.id)
    
    return {
        "active_scenarios_count": len([s for s in scenarios if s.status.value != "archived"]),
        "tracked_competitors_count": len(competitors),
        "pending_recommendations_count": len(recommendations),
        "recent_market_intel_count": len(intel),
        "top_recommendations": [
            {
                "id": str(r.id),
                "title": r.title,
                "priority": r.priority.value if r.priority else "medium",
                "category": r.category
            }
            for r in recommendations
        ],
        "competitor_alerts": competitive_landscape.get("recent_activity", [])[:5],
        "market_trends": [
            {
                "title": i.title,
                "category": i.category,
                "relevance": i.relevance_score
            }
            for i in intel
        ],
        "latest_summary": {
            "id": str(latest_summary.id),
            "period_type": latest_summary.period_type,
            "created_at": latest_summary.created_at.isoformat()
        } if latest_summary else None
    }

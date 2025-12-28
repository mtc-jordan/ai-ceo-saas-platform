"""Market Intelligence Service."""
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func

from app.models.athena import (
    MarketIntelligence, IndustryBenchmark,
    StrategicRecommendation, ExecutiveSummary,
    AlertPriority
)
from app.schemas.athena import (
    MarketIntelligenceCreate, MarketIntelligenceResponse,
    IndustryBenchmarkResponse, StrategicRecommendationResponse,
    ExecutiveSummaryResponse, GenerateSummaryRequest
)


class MarketIntelligenceService:
    """Service for market intelligence and strategic insights."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ============== Market Intelligence ==============

    async def create_intelligence(
        self,
        org_id: UUID,
        data: MarketIntelligenceCreate
    ) -> MarketIntelligence:
        """Create a new market intelligence item."""
        intel = MarketIntelligence(
            organization_id=org_id,
            title=data.title,
            summary=data.summary,
            full_content=data.full_content,
            category=data.category,
            subcategory=data.subcategory,
            source_url=data.source_url,
            source_name=data.source_name,
            source_type=data.source_type,
            tags=data.tags,
            relevance_score=50.0  # Default, can be updated by AI
        )
        self.db.add(intel)
        await self.db.commit()
        await self.db.refresh(intel)
        return intel

    async def get_intelligence(self, intel_id: UUID, org_id: UUID) -> Optional[MarketIntelligence]:
        """Get a market intelligence item by ID."""
        result = await self.db.execute(
            select(MarketIntelligence)
            .where(MarketIntelligence.id == intel_id)
            .where(MarketIntelligence.organization_id == org_id)
        )
        return result.scalar_one_or_none()

    async def list_intelligence(
        self,
        org_id: UUID,
        category: Optional[str] = None,
        is_bookmarked: Optional[bool] = None,
        min_relevance: Optional[float] = None,
        days: int = 30,
        limit: int = 50,
        offset: int = 0
    ) -> List[MarketIntelligence]:
        """List market intelligence items."""
        since = datetime.utcnow() - timedelta(days=days)
        query = (
            select(MarketIntelligence)
            .where(MarketIntelligence.organization_id == org_id)
            .where(MarketIntelligence.created_at >= since)
        )
        
        if category:
            query = query.where(MarketIntelligence.category == category)
        if is_bookmarked is not None:
            query = query.where(MarketIntelligence.is_bookmarked == is_bookmarked)
        if min_relevance:
            query = query.where(MarketIntelligence.relevance_score >= min_relevance)
        
        query = query.order_by(
            MarketIntelligence.relevance_score.desc(),
            MarketIntelligence.created_at.desc()
        ).limit(limit).offset(offset)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def toggle_bookmark(self, intel_id: UUID, org_id: UUID) -> bool:
        """Toggle bookmark status."""
        intel = await self.get_intelligence(intel_id, org_id)
        if not intel:
            return False
        intel.is_bookmarked = not intel.is_bookmarked
        await self.db.commit()
        return intel.is_bookmarked

    async def get_trending_topics(self, org_id: UUID, days: int = 7) -> List[Dict[str, Any]]:
        """Get trending topics from recent intelligence."""
        intel_items = await self.list_intelligence(org_id, days=days, limit=100)
        
        # Count tag occurrences
        tag_counts = {}
        category_counts = {}
        
        for item in intel_items:
            for tag in (item.tags or []):
                tag_counts[tag] = tag_counts.get(tag, 0) + 1
            if item.category:
                category_counts[item.category] = category_counts.get(item.category, 0) + 1
        
        # Sort by count
        trending_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        trending_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            "trending_tags": [{"tag": t, "count": c} for t, c in trending_tags],
            "trending_categories": [{"category": c, "count": n} for c, n in trending_categories],
            "total_items": len(intel_items)
        }

    # ============== Industry Benchmarks ==============

    async def create_benchmark(
        self,
        org_id: UUID,
        industry: str,
        metric_name: str,
        metric_category: str,
        values: Dict[str, float],
        company_value: Optional[float] = None
    ) -> IndustryBenchmark:
        """Create an industry benchmark."""
        # Calculate company percentile if value provided
        company_percentile = None
        if company_value is not None:
            p25 = values.get("p25", 0)
            p50 = values.get("p50", 0)
            p75 = values.get("p75", 0)
            p90 = values.get("p90", 0)
            
            if company_value <= p25:
                company_percentile = 25 * (company_value / p25) if p25 > 0 else 0
            elif company_value <= p50:
                company_percentile = 25 + 25 * ((company_value - p25) / (p50 - p25)) if p50 > p25 else 25
            elif company_value <= p75:
                company_percentile = 50 + 25 * ((company_value - p50) / (p75 - p50)) if p75 > p50 else 50
            elif company_value <= p90:
                company_percentile = 75 + 15 * ((company_value - p75) / (p90 - p75)) if p90 > p75 else 75
            else:
                company_percentile = 90 + 10 * min(1, (company_value - p90) / p90) if p90 > 0 else 90
        
        benchmark = IndustryBenchmark(
            organization_id=org_id,
            industry=industry,
            metric_name=metric_name,
            metric_category=metric_category,
            p25_value=values.get("p25"),
            p50_value=values.get("p50"),
            p75_value=values.get("p75"),
            p90_value=values.get("p90"),
            company_value=company_value,
            company_percentile=company_percentile,
            unit=values.get("unit", ""),
            period=values.get("period", "")
        )
        self.db.add(benchmark)
        await self.db.commit()
        await self.db.refresh(benchmark)
        return benchmark

    async def list_benchmarks(
        self,
        org_id: UUID,
        industry: Optional[str] = None,
        metric_category: Optional[str] = None
    ) -> List[IndustryBenchmark]:
        """List industry benchmarks."""
        query = select(IndustryBenchmark).where(IndustryBenchmark.organization_id == org_id)
        
        if industry:
            query = query.where(IndustryBenchmark.industry == industry)
        if metric_category:
            query = query.where(IndustryBenchmark.metric_category == metric_category)
        
        query = query.order_by(IndustryBenchmark.metric_category, IndustryBenchmark.metric_name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_benchmark_summary(self, org_id: UUID) -> Dict[str, Any]:
        """Get summary of company performance vs benchmarks."""
        benchmarks = await self.list_benchmarks(org_id)
        
        if not benchmarks:
            return {
                "total_metrics": 0,
                "above_median": 0,
                "below_median": 0,
                "top_quartile": 0,
                "areas_of_strength": [],
                "areas_for_improvement": []
            }
        
        above_median = 0
        below_median = 0
        top_quartile = 0
        strengths = []
        improvements = []
        
        for b in benchmarks:
            if b.company_percentile is not None:
                if b.company_percentile >= 50:
                    above_median += 1
                else:
                    below_median += 1
                
                if b.company_percentile >= 75:
                    top_quartile += 1
                    strengths.append(b.metric_name)
                elif b.company_percentile < 25:
                    improvements.append(b.metric_name)
        
        return {
            "total_metrics": len(benchmarks),
            "above_median": above_median,
            "below_median": below_median,
            "top_quartile": top_quartile,
            "areas_of_strength": strengths[:5],
            "areas_for_improvement": improvements[:5]
        }

    # ============== Strategic Recommendations ==============

    async def create_recommendation(
        self,
        org_id: UUID,
        title: str,
        description: str,
        category: str,
        priority: AlertPriority,
        rationale: Optional[str] = None,
        action_items: Optional[List[Dict]] = None,
        source_type: Optional[str] = None,
        source_id: Optional[UUID] = None
    ) -> StrategicRecommendation:
        """Create a strategic recommendation."""
        rec = StrategicRecommendation(
            organization_id=org_id,
            title=title,
            description=description,
            rationale=rationale,
            category=category,
            priority=priority,
            action_items=action_items or [],
            source_type=source_type,
            source_id=source_id,
            status="pending"
        )
        self.db.add(rec)
        await self.db.commit()
        await self.db.refresh(rec)
        return rec

    async def list_recommendations(
        self,
        org_id: UUID,
        status: Optional[str] = None,
        category: Optional[str] = None,
        priority: Optional[AlertPriority] = None,
        limit: int = 50
    ) -> List[StrategicRecommendation]:
        """List strategic recommendations."""
        query = select(StrategicRecommendation).where(
            StrategicRecommendation.organization_id == org_id
        )
        
        if status:
            query = query.where(StrategicRecommendation.status == status)
        if category:
            query = query.where(StrategicRecommendation.category == category)
        if priority:
            query = query.where(StrategicRecommendation.priority == priority)
        
        # Order by priority (critical first) then by date
        query = query.order_by(
            StrategicRecommendation.priority.desc(),
            StrategicRecommendation.created_at.desc()
        ).limit(limit)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_recommendation_status(
        self,
        rec_id: UUID,
        org_id: UUID,
        status: str,
        dismissed_reason: Optional[str] = None
    ) -> Optional[StrategicRecommendation]:
        """Update recommendation status."""
        result = await self.db.execute(
            select(StrategicRecommendation)
            .where(StrategicRecommendation.id == rec_id)
            .where(StrategicRecommendation.organization_id == org_id)
        )
        rec = result.scalar_one_or_none()
        if not rec:
            return None
        
        rec.status = status
        if dismissed_reason:
            rec.dismissed_reason = dismissed_reason
        rec.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(rec)
        return rec

    # ============== Executive Summaries ==============

    async def generate_executive_summary(
        self,
        org_id: UUID,
        request: GenerateSummaryRequest,
        scenario_service: Optional[Any] = None,
        competitor_service: Optional[Any] = None,
        ai_service: Optional[Any] = None
    ) -> ExecutiveSummary:
        """Generate an executive summary."""
        # Determine period
        now = datetime.utcnow()
        if request.period_type == "weekly":
            period_start = now - timedelta(days=7)
        elif request.period_type == "monthly":
            period_start = now - timedelta(days=30)
        else:  # quarterly
            period_start = now - timedelta(days=90)
        
        # Gather data
        key_highlights = []
        performance_summary = {}
        competitive_landscape = {}
        market_trends = []
        risks_and_opportunities = {"risks": [], "opportunities": []}
        recommendations = []
        
        # Get recommendations
        recs = await self.list_recommendations(org_id, status="pending", limit=10)
        for r in recs:
            recommendations.append({
                "title": r.title,
                "priority": r.priority.value if r.priority else "medium",
                "category": r.category
            })
            key_highlights.append(f"New recommendation: {r.title}")
        
        # Get market intelligence
        intel = await self.list_intelligence(org_id, days=7 if request.period_type == "weekly" else 30)
        for i in intel[:5]:
            market_trends.append({
                "title": i.title,
                "category": i.category,
                "relevance": i.relevance_score
            })
        
        # Get benchmarks
        benchmark_summary = await self.get_benchmark_summary(org_id)
        performance_summary["benchmark_position"] = benchmark_summary
        
        # Build narrative
        narrative = self._build_narrative(
            request.period_type,
            key_highlights,
            performance_summary,
            market_trends,
            recommendations
        )
        
        # Create summary
        summary = ExecutiveSummary(
            organization_id=org_id,
            period_type=request.period_type,
            period_start=period_start,
            period_end=now,
            key_highlights=key_highlights,
            performance_summary=performance_summary,
            competitive_landscape=competitive_landscape,
            market_trends=market_trends,
            risks_and_opportunities=risks_and_opportunities,
            recommendations=recommendations,
            executive_narrative=narrative
        )
        self.db.add(summary)
        await self.db.commit()
        await self.db.refresh(summary)
        return summary

    async def get_latest_summary(
        self,
        org_id: UUID,
        period_type: Optional[str] = None
    ) -> Optional[ExecutiveSummary]:
        """Get the most recent executive summary."""
        query = select(ExecutiveSummary).where(ExecutiveSummary.organization_id == org_id)
        
        if period_type:
            query = query.where(ExecutiveSummary.period_type == period_type)
        
        query = query.order_by(ExecutiveSummary.created_at.desc()).limit(1)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def list_summaries(
        self,
        org_id: UUID,
        period_type: Optional[str] = None,
        limit: int = 10
    ) -> List[ExecutiveSummary]:
        """List executive summaries."""
        query = select(ExecutiveSummary).where(ExecutiveSummary.organization_id == org_id)
        
        if period_type:
            query = query.where(ExecutiveSummary.period_type == period_type)
        
        query = query.order_by(ExecutiveSummary.created_at.desc()).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    def _build_narrative(
        self,
        period_type: str,
        highlights: List[str],
        performance: Dict,
        trends: List[Dict],
        recommendations: List[Dict]
    ) -> str:
        """Build executive narrative."""
        period_name = {
            "weekly": "This Week",
            "monthly": "This Month",
            "quarterly": "This Quarter"
        }.get(period_type, "This Period")
        
        narrative = f"# Executive Summary - {period_name}\n\n"
        
        if highlights:
            narrative += "## Key Highlights\n"
            for h in highlights[:5]:
                narrative += f"- {h}\n"
            narrative += "\n"
        
        if trends:
            narrative += "## Market Trends\n"
            for t in trends[:3]:
                narrative += f"- **{t.get('title', 'Trend')}** ({t.get('category', 'General')})\n"
            narrative += "\n"
        
        if recommendations:
            narrative += "## Recommended Actions\n"
            for r in recommendations[:3]:
                priority = r.get('priority', 'medium').upper()
                narrative += f"- [{priority}] {r.get('title', 'Action')}\n"
        
        return narrative

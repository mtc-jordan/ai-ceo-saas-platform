"""Competitor Tracking Service."""
from typing import List, Dict, Any, Optional
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func

from app.models.athena import (
    Competitor, CompetitorUpdate, CompetitorProduct,
    CompetitorStatus
)
from app.schemas.athena import (
    CompetitorCreate, CompetitorUpdate as CompetitorUpdateSchema,
    CompetitorResponse, CompetitorProductCreate, CompetitorUpdateCreate,
    CompetitorAnalysisResponse
)


class CompetitorService:
    """Service for tracking and analyzing competitors."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_competitor(
        self,
        org_id: UUID,
        data: CompetitorCreate
    ) -> Competitor:
        """Create a new competitor to track."""
        competitor = Competitor(
            organization_id=org_id,
            name=data.name,
            website=data.website,
            description=data.description,
            industry=data.industry,
            founded_year=data.founded_year,
            headquarters=data.headquarters,
            employee_count=data.employee_count,
            funding_stage=data.funding_stage,
            total_funding=data.total_funding,
            threat_level=data.threat_level,
            market_overlap=data.market_overlap,
            is_primary=data.is_primary,
            linkedin_url=data.linkedin_url,
            twitter_handle=data.twitter_handle,
            status=CompetitorStatus.ACTIVE
        )
        self.db.add(competitor)
        await self.db.commit()
        await self.db.refresh(competitor)
        return competitor

    async def get_competitor(self, competitor_id: UUID, org_id: UUID) -> Optional[Competitor]:
        """Get a competitor by ID."""
        result = await self.db.execute(
            select(Competitor)
            .where(Competitor.id == competitor_id)
            .where(Competitor.organization_id == org_id)
        )
        return result.scalar_one_or_none()

    async def list_competitors(
        self,
        org_id: UUID,
        is_primary: Optional[bool] = None,
        status: Optional[CompetitorStatus] = None,
        min_threat_level: Optional[int] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Competitor]:
        """List competitors for an organization."""
        query = select(Competitor).where(Competitor.organization_id == org_id)
        
        if is_primary is not None:
            query = query.where(Competitor.is_primary == is_primary)
        if status:
            query = query.where(Competitor.status == status)
        if min_threat_level:
            query = query.where(Competitor.threat_level >= min_threat_level)
        
        query = query.order_by(Competitor.threat_level.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def update_competitor(
        self,
        competitor_id: UUID,
        org_id: UUID,
        data: CompetitorUpdateSchema
    ) -> Optional[Competitor]:
        """Update a competitor."""
        competitor = await self.get_competitor(competitor_id, org_id)
        if not competitor:
            return None
        
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(competitor, key, value)
        
        competitor.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(competitor)
        return competitor

    async def delete_competitor(self, competitor_id: UUID, org_id: UUID) -> bool:
        """Delete a competitor."""
        result = await self.db.execute(
            delete(Competitor)
            .where(Competitor.id == competitor_id)
            .where(Competitor.organization_id == org_id)
        )
        await self.db.commit()
        return result.rowcount > 0

    async def add_competitor_update(
        self,
        competitor_id: UUID,
        org_id: UUID,
        data: CompetitorUpdateCreate
    ) -> Optional[CompetitorUpdate]:
        """Add a news/update item for a competitor."""
        competitor = await self.get_competitor(competitor_id, org_id)
        if not competitor:
            return None
        
        update_item = CompetitorUpdate(
            competitor_id=competitor_id,
            title=data.title,
            summary=data.summary,
            source_url=data.source_url,
            source_name=data.source_name,
            update_type=data.update_type,
            sentiment=data.sentiment,
            importance=data.importance,
            published_at=data.published_at or datetime.utcnow()
        )
        self.db.add(update_item)
        await self.db.commit()
        await self.db.refresh(update_item)
        return update_item

    async def get_competitor_updates(
        self,
        competitor_id: UUID,
        org_id: UUID,
        days: int = 30,
        limit: int = 20
    ) -> List[CompetitorUpdate]:
        """Get recent updates for a competitor."""
        competitor = await self.get_competitor(competitor_id, org_id)
        if not competitor:
            return []
        
        since = datetime.utcnow() - timedelta(days=days)
        result = await self.db.execute(
            select(CompetitorUpdate)
            .where(CompetitorUpdate.competitor_id == competitor_id)
            .where(CompetitorUpdate.created_at >= since)
            .order_by(CompetitorUpdate.importance.desc(), CompetitorUpdate.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def add_competitor_product(
        self,
        competitor_id: UUID,
        org_id: UUID,
        data: CompetitorProductCreate
    ) -> Optional[CompetitorProduct]:
        """Add a product for a competitor."""
        competitor = await self.get_competitor(competitor_id, org_id)
        if not competitor:
            return None
        
        product = CompetitorProduct(
            competitor_id=competitor_id,
            name=data.name,
            description=data.description,
            category=data.category,
            pricing_model=data.pricing_model,
            price_range=data.price_range,
            features=data.features,
            target_market=data.target_market
        )
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def get_competitor_products(
        self,
        competitor_id: UUID,
        org_id: UUID
    ) -> List[CompetitorProduct]:
        """Get products for a competitor."""
        competitor = await self.get_competitor(competitor_id, org_id)
        if not competitor:
            return []
        
        result = await self.db.execute(
            select(CompetitorProduct)
            .where(CompetitorProduct.competitor_id == competitor_id)
            .order_by(CompetitorProduct.overlap_score.desc())
        )
        return list(result.scalars().all())

    async def get_competitive_landscape(self, org_id: UUID) -> Dict[str, Any]:
        """Get overview of competitive landscape."""
        competitors = await self.list_competitors(org_id, limit=100)
        
        if not competitors:
            return {
                "total_competitors": 0,
                "primary_competitors": 0,
                "average_threat_level": 0,
                "threat_distribution": {},
                "recent_activity": []
            }
        
        # Calculate statistics
        primary_count = sum(1 for c in competitors if c.is_primary)
        avg_threat = sum(c.threat_level for c in competitors) / len(competitors)
        
        # Threat distribution
        threat_dist = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        for c in competitors:
            if c.threat_level <= 3:
                threat_dist["low"] += 1
            elif c.threat_level <= 5:
                threat_dist["medium"] += 1
            elif c.threat_level <= 7:
                threat_dist["high"] += 1
            else:
                threat_dist["critical"] += 1
        
        # Get recent activity across all competitors
        recent_updates = []
        for c in competitors[:10]:  # Top 10 by threat
            updates = await self.get_competitor_updates(c.id, org_id, days=7, limit=3)
            for u in updates:
                recent_updates.append({
                    "competitor_name": c.name,
                    "title": u.title,
                    "type": u.update_type,
                    "sentiment": u.sentiment,
                    "date": u.published_at.isoformat() if u.published_at else None
                })
        
        # Sort by date
        recent_updates.sort(key=lambda x: x["date"] or "", reverse=True)
        
        return {
            "total_competitors": len(competitors),
            "primary_competitors": primary_count,
            "average_threat_level": round(avg_threat, 1),
            "threat_distribution": threat_dist,
            "recent_activity": recent_updates[:10]
        }

    async def analyze_competitor(
        self,
        competitor_id: UUID,
        org_id: UUID,
        ai_service: Optional[Any] = None
    ) -> CompetitorAnalysisResponse:
        """Generate AI-powered competitor analysis."""
        competitor = await self.get_competitor(competitor_id, org_id)
        if not competitor:
            raise ValueError("Competitor not found")
        
        # Get updates and products
        updates = await self.get_competitor_updates(competitor_id, org_id, days=90)
        products = await self.get_competitor_products(competitor_id, org_id)
        
        # Default analysis (can be enhanced with AI)
        strengths = competitor.strengths or [
            "Established market presence",
            "Strong brand recognition"
        ]
        weaknesses = competitor.weaknesses or [
            "Limited product range",
            "Higher pricing"
        ]
        
        # Generate opportunities and threats
        opportunities = []
        threats = []
        
        if competitor.market_overlap < 50:
            opportunities.append("Low market overlap - room for differentiation")
        if competitor.threat_level < 5:
            opportunities.append("Competitor not heavily focused on your segment")
        
        if competitor.threat_level >= 7:
            threats.append("High threat level - aggressive competitor")
        if competitor.total_funding and competitor.total_funding > 10000000:
            threats.append("Well-funded competitor with resources to scale")
        
        # Recent moves analysis
        recent_moves = []
        for u in updates[:5]:
            recent_moves.append({
                "title": u.title,
                "type": u.update_type,
                "impact": "high" if u.importance >= 7 else "medium" if u.importance >= 4 else "low"
            })
        
        # Update competitor with analysis
        competitor.strengths = strengths
        competitor.weaknesses = weaknesses
        competitor.recent_moves = recent_moves
        await self.db.commit()
        
        return CompetitorAnalysisResponse(
            competitor_id=str(competitor.id),
            competitor_name=competitor.name,
            overall_threat_assessment=self._get_threat_assessment(competitor.threat_level),
            strengths=strengths,
            weaknesses=weaknesses,
            opportunities_against=opportunities,
            threats_from=threats,
            recommended_actions=[
                {"action": "Monitor pricing changes", "priority": "high"},
                {"action": "Track product launches", "priority": "medium"},
                {"action": "Analyze customer reviews", "priority": "medium"}
            ],
            market_position_summary=f"{competitor.name} is a {'primary' if competitor.is_primary else 'secondary'} competitor with {competitor.market_overlap}% market overlap and threat level {competitor.threat_level}/10."
        )

    def _get_threat_assessment(self, threat_level: int) -> str:
        """Get threat assessment text based on level."""
        if threat_level <= 3:
            return "Low threat - Monitor periodically"
        elif threat_level <= 5:
            return "Moderate threat - Regular monitoring recommended"
        elif threat_level <= 7:
            return "High threat - Active tracking required"
        else:
            return "Critical threat - Immediate attention needed"

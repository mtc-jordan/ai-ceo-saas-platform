"""Athena Competitor Tracking API Endpoints."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import Organization
from app.models.athena import CompetitorStatus
from app.schemas.athena import (
    CompetitorCreate, CompetitorUpdate, CompetitorResponse,
    CompetitorProductCreate, CompetitorUpdateCreate,
    CompetitorAnalysisResponse
)
from app.services.athena.competitor_service import CompetitorService
from app.api.v1.endpoints.settings import get_user_organization

router = APIRouter()


@router.post("", response_model=CompetitorResponse)
async def create_competitor(
    data: CompetitorCreate,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Create a new competitor to track."""
    service = CompetitorService(db)
    competitor = await service.create_competitor(org.id, data)
    return CompetitorResponse(
        id=str(competitor.id),
        name=competitor.name,
        website=competitor.website,
        description=competitor.description,
        logo_url=competitor.logo_url,
        industry=competitor.industry,
        founded_year=competitor.founded_year,
        headquarters=competitor.headquarters,
        employee_count=competitor.employee_count,
        funding_stage=competitor.funding_stage,
        total_funding=competitor.total_funding,
        threat_level=competitor.threat_level,
        market_overlap=competitor.market_overlap,
        is_primary=competitor.is_primary,
        strengths=competitor.strengths or [],
        weaknesses=competitor.weaknesses or [],
        recent_moves=competitor.recent_moves or [],
        created_at=competitor.created_at,
        updated_at=competitor.updated_at
    )


@router.get("", response_model=List[CompetitorResponse])
async def list_competitors(
    is_primary: Optional[bool] = None,
    min_threat_level: Optional[int] = Query(None, ge=1, le=10),
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """List tracked competitors."""
    service = CompetitorService(db)
    competitors = await service.list_competitors(
        org.id, is_primary, None, min_threat_level, limit, offset
    )
    return [
        CompetitorResponse(
            id=str(c.id),
            name=c.name,
            website=c.website,
            description=c.description,
            logo_url=c.logo_url,
            industry=c.industry,
            founded_year=c.founded_year,
            headquarters=c.headquarters,
            employee_count=c.employee_count,
            funding_stage=c.funding_stage,
            total_funding=c.total_funding,
            threat_level=c.threat_level,
            market_overlap=c.market_overlap,
            is_primary=c.is_primary,
            strengths=c.strengths or [],
            weaknesses=c.weaknesses or [],
            recent_moves=c.recent_moves or [],
            created_at=c.created_at,
            updated_at=c.updated_at
        )
        for c in competitors
    ]


@router.get("/landscape")
async def get_competitive_landscape(
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get competitive landscape overview."""
    service = CompetitorService(db)
    return await service.get_competitive_landscape(org.id)


@router.get("/{competitor_id}", response_model=CompetitorResponse)
async def get_competitor(
    competitor_id: UUID,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific competitor."""
    service = CompetitorService(db)
    competitor = await service.get_competitor(competitor_id, org.id)
    if not competitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competitor not found"
        )
    return CompetitorResponse(
        id=str(competitor.id),
        name=competitor.name,
        website=competitor.website,
        description=competitor.description,
        logo_url=competitor.logo_url,
        industry=competitor.industry,
        founded_year=competitor.founded_year,
        headquarters=competitor.headquarters,
        employee_count=competitor.employee_count,
        funding_stage=competitor.funding_stage,
        total_funding=competitor.total_funding,
        threat_level=competitor.threat_level,
        market_overlap=competitor.market_overlap,
        is_primary=competitor.is_primary,
        strengths=competitor.strengths or [],
        weaknesses=competitor.weaknesses or [],
        recent_moves=competitor.recent_moves or [],
        created_at=competitor.created_at,
        updated_at=competitor.updated_at
    )


@router.patch("/{competitor_id}", response_model=CompetitorResponse)
async def update_competitor(
    competitor_id: UUID,
    data: CompetitorUpdate,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Update a competitor."""
    service = CompetitorService(db)
    competitor = await service.update_competitor(competitor_id, org.id, data)
    if not competitor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competitor not found"
        )
    return CompetitorResponse(
        id=str(competitor.id),
        name=competitor.name,
        website=competitor.website,
        description=competitor.description,
        logo_url=competitor.logo_url,
        industry=competitor.industry,
        founded_year=competitor.founded_year,
        headquarters=competitor.headquarters,
        employee_count=competitor.employee_count,
        funding_stage=competitor.funding_stage,
        total_funding=competitor.total_funding,
        threat_level=competitor.threat_level,
        market_overlap=competitor.market_overlap,
        is_primary=competitor.is_primary,
        strengths=competitor.strengths or [],
        weaknesses=competitor.weaknesses or [],
        recent_moves=competitor.recent_moves or [],
        created_at=competitor.created_at,
        updated_at=competitor.updated_at
    )


@router.delete("/{competitor_id}")
async def delete_competitor(
    competitor_id: UUID,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Delete a competitor."""
    service = CompetitorService(db)
    deleted = await service.delete_competitor(competitor_id, org.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competitor not found"
        )
    return {"message": "Competitor deleted successfully"}


@router.post("/{competitor_id}/analyze", response_model=CompetitorAnalysisResponse)
async def analyze_competitor(
    competitor_id: UUID,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Generate AI-powered competitor analysis."""
    service = CompetitorService(db)
    try:
        analysis = await service.analyze_competitor(competitor_id, org.id)
        return analysis
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/{competitor_id}/updates")
async def add_competitor_update(
    competitor_id: UUID,
    data: CompetitorUpdateCreate,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Add a news/update for a competitor."""
    service = CompetitorService(db)
    update = await service.add_competitor_update(competitor_id, org.id, data)
    if not update:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competitor not found"
        )
    return {
        "id": str(update.id),
        "title": update.title,
        "summary": update.summary,
        "update_type": update.update_type,
        "sentiment": update.sentiment,
        "importance": update.importance,
        "created_at": update.created_at
    }


@router.get("/{competitor_id}/updates")
async def get_competitor_updates(
    competitor_id: UUID,
    days: int = Query(default=30, le=365),
    limit: int = Query(default=20, le=100),
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get recent updates for a competitor."""
    service = CompetitorService(db)
    updates = await service.get_competitor_updates(competitor_id, org.id, days, limit)
    return [
        {
            "id": str(u.id),
            "title": u.title,
            "summary": u.summary,
            "source_url": u.source_url,
            "source_name": u.source_name,
            "update_type": u.update_type,
            "sentiment": u.sentiment,
            "importance": u.importance,
            "published_at": u.published_at,
            "created_at": u.created_at
        }
        for u in updates
    ]


@router.post("/{competitor_id}/products")
async def add_competitor_product(
    competitor_id: UUID,
    data: CompetitorProductCreate,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Add a product for a competitor."""
    service = CompetitorService(db)
    product = await service.add_competitor_product(competitor_id, org.id, data)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competitor not found"
        )
    return {
        "id": str(product.id),
        "name": product.name,
        "description": product.description,
        "category": product.category,
        "pricing_model": product.pricing_model,
        "price_range": product.price_range,
        "features": product.features,
        "target_market": product.target_market
    }


@router.get("/{competitor_id}/products")
async def get_competitor_products(
    competitor_id: UUID,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get products for a competitor."""
    service = CompetitorService(db)
    products = await service.get_competitor_products(competitor_id, org.id)
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "description": p.description,
            "category": p.category,
            "pricing_model": p.pricing_model,
            "price_range": p.price_range,
            "features": p.features,
            "target_market": p.target_market,
            "overlap_score": p.overlap_score
        }
        for p in products
    ]

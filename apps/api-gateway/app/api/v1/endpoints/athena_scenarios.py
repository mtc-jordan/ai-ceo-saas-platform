"""Athena Scenario Planning API Endpoints."""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User, Organization
from app.models.athena import ScenarioType, ScenarioStatus
from app.schemas.athena import (
    ScenarioCreate, ScenarioUpdate, ScenarioResponse,
    ScenarioAnalysisRequest, ScenarioAnalysisResponse
)
from app.services.athena.scenario_service import ScenarioService
from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.settings import get_user_organization

router = APIRouter()


@router.get("/templates")
async def get_scenario_templates():
    """Get predefined scenario templates."""
    return ScenarioService.get_scenario_templates()


@router.post("", response_model=ScenarioResponse)
async def create_scenario(
    data: ScenarioCreate,
    current_user: dict = Depends(get_current_user),
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Create a new scenario."""
    service = ScenarioService(db)
    scenario = await service.create_scenario(org.id, current_user.id, data)
    return ScenarioResponse(
        id=str(scenario.id),
        name=scenario.name,
        description=scenario.description,
        scenario_type=scenario.scenario_type,
        status=scenario.status,
        time_horizon_months=scenario.time_horizon_months,
        base_assumptions=scenario.base_assumptions or {},
        variables=scenario.variables or [],
        outcomes=scenario.outcomes or {},
        ai_analysis=scenario.ai_analysis,
        ai_recommendations=scenario.ai_recommendations or [],
        is_favorite=scenario.is_favorite,
        tags=scenario.tags or [],
        created_at=scenario.created_at,
        updated_at=scenario.updated_at
    )


@router.get("", response_model=List[ScenarioResponse])
async def list_scenarios(
    scenario_type: Optional[ScenarioType] = None,
    status: Optional[ScenarioStatus] = None,
    is_favorite: Optional[bool] = None,
    limit: int = Query(default=50, le=100),
    offset: int = Query(default=0, ge=0),
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """List scenarios for the organization."""
    service = ScenarioService(db)
    scenarios = await service.list_scenarios(
        org.id, scenario_type, status, is_favorite, limit, offset
    )
    return [
        ScenarioResponse(
            id=str(s.id),
            name=s.name,
            description=s.description,
            scenario_type=s.scenario_type,
            status=s.status,
            time_horizon_months=s.time_horizon_months,
            base_assumptions=s.base_assumptions or {},
            variables=s.variables or [],
            outcomes=s.outcomes or {},
            ai_analysis=s.ai_analysis,
            ai_recommendations=s.ai_recommendations or [],
            is_favorite=s.is_favorite,
            tags=s.tags or [],
            created_at=s.created_at,
            updated_at=s.updated_at
        )
        for s in scenarios
    ]


@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(
    scenario_id: UUID,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific scenario."""
    service = ScenarioService(db)
    scenario = await service.get_scenario(scenario_id, org.id)
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    return ScenarioResponse(
        id=str(scenario.id),
        name=scenario.name,
        description=scenario.description,
        scenario_type=scenario.scenario_type,
        status=scenario.status,
        time_horizon_months=scenario.time_horizon_months,
        base_assumptions=scenario.base_assumptions or {},
        variables=scenario.variables or [],
        outcomes=scenario.outcomes or {},
        ai_analysis=scenario.ai_analysis,
        ai_recommendations=scenario.ai_recommendations or [],
        is_favorite=scenario.is_favorite,
        tags=scenario.tags or [],
        created_at=scenario.created_at,
        updated_at=scenario.updated_at
    )


@router.patch("/{scenario_id}", response_model=ScenarioResponse)
async def update_scenario(
    scenario_id: UUID,
    data: ScenarioUpdate,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Update a scenario."""
    service = ScenarioService(db)
    scenario = await service.update_scenario(scenario_id, org.id, data)
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    return ScenarioResponse(
        id=str(scenario.id),
        name=scenario.name,
        description=scenario.description,
        scenario_type=scenario.scenario_type,
        status=scenario.status,
        time_horizon_months=scenario.time_horizon_months,
        base_assumptions=scenario.base_assumptions or {},
        variables=scenario.variables or [],
        outcomes=scenario.outcomes or {},
        ai_analysis=scenario.ai_analysis,
        ai_recommendations=scenario.ai_recommendations or [],
        is_favorite=scenario.is_favorite,
        tags=scenario.tags or [],
        created_at=scenario.created_at,
        updated_at=scenario.updated_at
    )


@router.delete("/{scenario_id}")
async def delete_scenario(
    scenario_id: UUID,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Delete a scenario."""
    service = ScenarioService(db)
    deleted = await service.delete_scenario(scenario_id, org.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    return {"message": "Scenario deleted successfully"}


@router.post("/{scenario_id}/analyze", response_model=ScenarioAnalysisResponse)
async def analyze_scenario(
    scenario_id: UUID,
    request: ScenarioAnalysisRequest,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Perform what-if analysis on a scenario."""
    service = ScenarioService(db)
    scenario = await service.get_scenario(scenario_id, org.id)
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    # TODO: Get AI service from settings if include_ai_analysis is True
    ai_service = None
    
    result = await service.analyze_scenario(scenario, request.variables, ai_service)
    return result


@router.post("/{scenario_id}/favorite")
async def toggle_favorite(
    scenario_id: UUID,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Toggle scenario favorite status."""
    service = ScenarioService(db)
    scenario = await service.get_scenario(scenario_id, org.id)
    if not scenario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scenario not found"
        )
    
    from app.schemas.athena import ScenarioUpdate
    updated = await service.update_scenario(
        scenario_id, org.id,
        ScenarioUpdate(is_favorite=not scenario.is_favorite)
    )
    return {"is_favorite": updated.is_favorite}


@router.post("/compare")
async def compare_scenarios(
    name: str,
    scenario_ids: List[UUID],
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Compare multiple scenarios."""
    if len(scenario_ids) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 scenarios required for comparison"
        )
    
    service = ScenarioService(db)
    comparison = await service.compare_scenarios(org.id, scenario_ids, name)
    return {
        "id": str(comparison.id),
        "name": comparison.name,
        "scenario_ids": [str(sid) for sid in comparison.scenario_ids],
        "comparison_metrics": comparison.comparison_metrics,
        "ai_recommendation": comparison.ai_recommendation
    }

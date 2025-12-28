from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.pulse import (
    DataSourceCreate, DataSourceUpdate, DataSourceResponse,
    DashboardCreate, DashboardUpdate, DashboardResponse,
    WidgetCreate, WidgetResponse,
    BriefingResponse,
    AlertResponse, AlertUpdate,
)
from app.services.pulse_service import (
    get_data_sources, get_data_source, create_data_source, update_data_source, delete_data_source,
    get_dashboards, get_dashboard, create_dashboard, update_dashboard,
    get_widgets, create_widget,
    get_latest_briefing, get_briefings,
    get_alerts, mark_alert_read,
)
from app.services.user_service import get_user_organization

router = APIRouter()


# Helper to get organization ID
async def get_org_id(user: dict, db: AsyncSession) -> UUID:
    org = await get_user_organization(db, UUID(user["id"]))
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org.id


# ============ Data Sources ============

@router.get("/data-sources", response_model=List[DataSourceResponse])
async def list_data_sources(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all data sources for the organization."""
    org_id = await get_org_id(current_user, db)
    sources = await get_data_sources(db, org_id)
    return [DataSourceResponse.model_validate(s) for s in sources]


@router.post("/data-sources", response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
async def add_data_source(
    data: DataSourceCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new data source connection."""
    org_id = await get_org_id(current_user, db)
    source = await create_data_source(db, org_id, data)
    return DataSourceResponse.model_validate(source)


@router.get("/data-sources/{source_id}", response_model=DataSourceResponse)
async def get_data_source_detail(
    source_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific data source."""
    org_id = await get_org_id(current_user, db)
    source = await get_data_source(db, source_id, org_id)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    return DataSourceResponse.model_validate(source)


@router.patch("/data-sources/{source_id}", response_model=DataSourceResponse)
async def update_data_source_detail(
    source_id: UUID,
    data: DataSourceUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a data source."""
    org_id = await get_org_id(current_user, db)
    source = await get_data_source(db, source_id, org_id)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    updated = await update_data_source(db, source, data)
    return DataSourceResponse.model_validate(updated)


@router.delete("/data-sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_data_source(
    source_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a data source."""
    org_id = await get_org_id(current_user, db)
    source = await get_data_source(db, source_id, org_id)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    await delete_data_source(db, source)


@router.post("/data-sources/{source_id}/sync", status_code=status.HTTP_202_ACCEPTED)
async def trigger_sync(
    source_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Trigger a data sync for a data source."""
    org_id = await get_org_id(current_user, db)
    source = await get_data_source(db, source_id, org_id)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    # TODO: Enqueue Celery task for sync
    return {"message": "Sync initiated", "source_id": str(source_id)}


# ============ Dashboards ============

@router.get("/dashboards", response_model=List[DashboardResponse])
async def list_dashboards(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all dashboards for the organization."""
    org_id = await get_org_id(current_user, db)
    dashboards = await get_dashboards(db, org_id)
    return [DashboardResponse.model_validate(d) for d in dashboards]


@router.post("/dashboards", response_model=DashboardResponse, status_code=status.HTTP_201_CREATED)
async def add_dashboard(
    data: DashboardCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new dashboard."""
    org_id = await get_org_id(current_user, db)
    dashboard = await create_dashboard(db, org_id, data)
    return DashboardResponse.model_validate(dashboard)


@router.get("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def get_dashboard_detail(
    dashboard_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific dashboard."""
    org_id = await get_org_id(current_user, db)
    dashboard = await get_dashboard(db, dashboard_id, org_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return DashboardResponse.model_validate(dashboard)


@router.patch("/dashboards/{dashboard_id}", response_model=DashboardResponse)
async def update_dashboard_detail(
    dashboard_id: UUID,
    data: DashboardUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a dashboard."""
    org_id = await get_org_id(current_user, db)
    dashboard = await get_dashboard(db, dashboard_id, org_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    updated = await update_dashboard(db, dashboard, data)
    return DashboardResponse.model_validate(updated)


# ============ Widgets ============

@router.get("/dashboards/{dashboard_id}/widgets", response_model=List[WidgetResponse])
async def list_widgets(
    dashboard_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all widgets for a dashboard."""
    org_id = await get_org_id(current_user, db)
    dashboard = await get_dashboard(db, dashboard_id, org_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    widgets = await get_widgets(db, dashboard_id)
    return [WidgetResponse.model_validate(w) for w in widgets]


@router.post("/dashboards/{dashboard_id}/widgets", response_model=WidgetResponse, status_code=status.HTTP_201_CREATED)
async def add_widget(
    dashboard_id: UUID,
    data: WidgetCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Add a widget to a dashboard."""
    org_id = await get_org_id(current_user, db)
    dashboard = await get_dashboard(db, dashboard_id, org_id)
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    widget = await create_widget(db, dashboard_id, data)
    return WidgetResponse.model_validate(widget)


# ============ Briefings ============

@router.get("/briefing", response_model=BriefingResponse)
async def get_todays_briefing(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the latest AI-generated briefing."""
    org_id = await get_org_id(current_user, db)
    briefing = await get_latest_briefing(db, org_id)
    if not briefing:
        raise HTTPException(status_code=404, detail="No briefing available")
    return BriefingResponse.model_validate(briefing)


@router.get("/briefings", response_model=List[BriefingResponse])
async def list_briefings(
    days: int = 7,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get recent briefings."""
    org_id = await get_org_id(current_user, db)
    briefings = await get_briefings(db, org_id, days)
    return [BriefingResponse.model_validate(b) for b in briefings]


# ============ Alerts ============

@router.get("/alerts", response_model=List[AlertResponse])
async def list_alerts(
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get alerts for the organization."""
    org_id = await get_org_id(current_user, db)
    alerts = await get_alerts(db, org_id, unread_only)
    return [AlertResponse.model_validate(a) for a in alerts]


@router.patch("/alerts/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_as_read(
    alert_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Mark an alert as read."""
    org_id = await get_org_id(current_user, db)
    alert = await mark_alert_read(db, alert_id, org_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return AlertResponse.model_validate(alert)

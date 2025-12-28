from uuid import UUID
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pulse import DataSource, Dashboard, Widget, Briefing, Alert
from app.schemas.pulse import (
    DataSourceCreate, DataSourceUpdate,
    DashboardCreate, DashboardUpdate,
    WidgetCreate, WidgetUpdate,
)


# Data Source Services
async def get_data_sources(db: AsyncSession, organization_id: UUID) -> List[DataSource]:
    """Get all data sources for an organization."""
    result = await db.execute(
        select(DataSource)
        .where(DataSource.organization_id == organization_id)
        .order_by(desc(DataSource.created_at))
    )
    return result.scalars().all()


async def get_data_source(db: AsyncSession, source_id: UUID, organization_id: UUID) -> Optional[DataSource]:
    """Get a specific data source."""
    result = await db.execute(
        select(DataSource)
        .where(DataSource.id == source_id, DataSource.organization_id == organization_id)
    )
    return result.scalar_one_or_none()


async def create_data_source(db: AsyncSession, organization_id: UUID, data: DataSourceCreate) -> DataSource:
    """Create a new data source."""
    source = DataSource(
        organization_id=organization_id,
        name=data.name,
        type=data.type,
        credentials=data.credentials,
        config=data.config,
        status='pending',
    )
    db.add(source)
    await db.commit()
    await db.refresh(source)
    return source


async def update_data_source(db: AsyncSession, source: DataSource, data: DataSourceUpdate) -> DataSource:
    """Update a data source."""
    if data.name is not None:
        source.name = data.name
    if data.credentials is not None:
        source.credentials = data.credentials
    if data.config is not None:
        source.config = data.config
    await db.commit()
    await db.refresh(source)
    return source


async def delete_data_source(db: AsyncSession, source: DataSource) -> None:
    """Delete a data source."""
    await db.delete(source)
    await db.commit()


# Dashboard Services
async def get_dashboards(db: AsyncSession, organization_id: UUID) -> List[Dashboard]:
    """Get all dashboards for an organization."""
    result = await db.execute(
        select(Dashboard)
        .where(Dashboard.organization_id == organization_id)
        .order_by(desc(Dashboard.is_default), desc(Dashboard.created_at))
    )
    return result.scalars().all()


async def get_dashboard(db: AsyncSession, dashboard_id: UUID, organization_id: UUID) -> Optional[Dashboard]:
    """Get a specific dashboard with widgets."""
    result = await db.execute(
        select(Dashboard)
        .where(Dashboard.id == dashboard_id, Dashboard.organization_id == organization_id)
    )
    return result.scalar_one_or_none()


async def create_dashboard(db: AsyncSession, organization_id: UUID, data: DashboardCreate) -> Dashboard:
    """Create a new dashboard."""
    dashboard = Dashboard(
        organization_id=organization_id,
        name=data.name,
        description=data.description,
        layout=data.layout,
    )
    db.add(dashboard)
    await db.commit()
    await db.refresh(dashboard)
    return dashboard


async def update_dashboard(db: AsyncSession, dashboard: Dashboard, data: DashboardUpdate) -> Dashboard:
    """Update a dashboard."""
    if data.name is not None:
        dashboard.name = data.name
    if data.description is not None:
        dashboard.description = data.description
    if data.layout is not None:
        dashboard.layout = data.layout
    await db.commit()
    await db.refresh(dashboard)
    return dashboard


# Widget Services
async def get_widgets(db: AsyncSession, dashboard_id: UUID) -> List[Widget]:
    """Get all widgets for a dashboard."""
    result = await db.execute(
        select(Widget)
        .where(Widget.dashboard_id == dashboard_id)
    )
    return result.scalars().all()


async def create_widget(db: AsyncSession, dashboard_id: UUID, data: WidgetCreate) -> Widget:
    """Create a new widget."""
    widget = Widget(
        dashboard_id=dashboard_id,
        name=data.name,
        type=data.type,
        data_source_id=data.data_source_id,
        query=data.query,
        position=data.position,
        config=data.config,
    )
    db.add(widget)
    await db.commit()
    await db.refresh(widget)
    return widget


# Briefing Services
async def get_latest_briefing(db: AsyncSession, organization_id: UUID) -> Optional[Briefing]:
    """Get the latest briefing for an organization."""
    result = await db.execute(
        select(Briefing)
        .where(Briefing.organization_id == organization_id)
        .order_by(desc(Briefing.date))
        .limit(1)
    )
    return result.scalar_one_or_none()


async def get_briefings(db: AsyncSession, organization_id: UUID, days: int = 7) -> List[Briefing]:
    """Get recent briefings for an organization."""
    since = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(
        select(Briefing)
        .where(Briefing.organization_id == organization_id, Briefing.date >= since)
        .order_by(desc(Briefing.date))
    )
    return result.scalars().all()


# Alert Services
async def get_alerts(db: AsyncSession, organization_id: UUID, unread_only: bool = False) -> List[Alert]:
    """Get alerts for an organization."""
    query = select(Alert).where(Alert.organization_id == organization_id)
    if unread_only:
        query = query.where(Alert.is_read == 0, Alert.is_dismissed == 0)
    query = query.order_by(desc(Alert.created_at))
    result = await db.execute(query)
    return result.scalars().all()


async def mark_alert_read(db: AsyncSession, alert_id: UUID, organization_id: UUID) -> Optional[Alert]:
    """Mark an alert as read."""
    result = await db.execute(
        select(Alert)
        .where(Alert.id == alert_id, Alert.organization_id == organization_id)
    )
    alert = result.scalar_one_or_none()
    if alert:
        alert.is_read = 1
        await db.commit()
        await db.refresh(alert)
    return alert

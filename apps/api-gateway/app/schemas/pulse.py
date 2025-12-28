from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime


# Data Source Schemas
class DataSourceCreate(BaseModel):
    name: str
    type: str  # stripe, hubspot, ga4, quickbooks
    credentials: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None


class DataSourceUpdate(BaseModel):
    name: Optional[str] = None
    credentials: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None


class DataSourceResponse(BaseModel):
    id: UUID
    name: str
    type: str
    status: str
    last_sync_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Schemas
class DashboardCreate(BaseModel):
    name: str
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None


class DashboardResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    layout: Optional[Dict[str, Any]]
    is_default: int
    created_at: datetime

    class Config:
        from_attributes = True


# Widget Schemas
class WidgetCreate(BaseModel):
    name: str
    type: str  # line_chart, bar_chart, kpi, table
    data_source_id: Optional[UUID] = None
    query: Dict[str, Any]
    position: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None


class WidgetUpdate(BaseModel):
    name: Optional[str] = None
    query: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None


class WidgetResponse(BaseModel):
    id: UUID
    name: str
    type: str
    data_source_id: Optional[UUID]
    query: Dict[str, Any]
    position: Optional[Dict[str, Any]]
    config: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


# Briefing Schemas
class BriefingResponse(BaseModel):
    id: UUID
    date: datetime
    content: str
    highlights: Optional[List[Dict[str, Any]]]
    alerts: Optional[List[Dict[str, Any]]]
    created_at: datetime

    class Config:
        from_attributes = True


# Alert Schemas
class AlertResponse(BaseModel):
    id: UUID
    type: str
    severity: str
    title: str
    message: str
    data: Optional[Dict[str, Any]]
    is_read: int
    is_dismissed: int
    created_at: datetime

    class Config:
        from_attributes = True


class AlertUpdate(BaseModel):
    is_read: Optional[int] = None
    is_dismissed: Optional[int] = None


# Analytics Schemas
class MetricData(BaseModel):
    name: str
    value: float
    change: Optional[float] = None
    change_period: Optional[str] = None


class ChartData(BaseModel):
    labels: List[str]
    datasets: List[Dict[str, Any]]

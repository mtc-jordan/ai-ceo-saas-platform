"""
Admin Dashboard Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class AdminRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    SUPPORT = "support"


# Feature Flag Schemas
class FeatureFlagCreate(BaseModel):
    name: str
    description: Optional[str] = None
    enabled: bool = False
    enabled_for_plans: List[str] = []
    enabled_for_organizations: List[str] = []
    percentage_rollout: int = 100


class FeatureFlagUpdate(BaseModel):
    description: Optional[str] = None
    enabled: Optional[bool] = None
    enabled_for_plans: Optional[List[str]] = None
    enabled_for_organizations: Optional[List[str]] = None
    percentage_rollout: Optional[int] = None


class FeatureFlagResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    enabled: bool
    enabled_for_plans: List[str]
    enabled_for_organizations: List[str]
    percentage_rollout: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Platform Config Schemas
class PlatformConfigCreate(BaseModel):
    key: str
    value: str
    value_type: str = "string"
    category: str = "general"
    description: Optional[str] = None
    is_secret: bool = False


class PlatformConfigUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None
    is_secret: Optional[bool] = None


class PlatformConfigResponse(BaseModel):
    id: int
    key: str
    value: Optional[str]
    value_type: str
    category: str
    description: Optional[str]
    is_secret: bool
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    timestamp: datetime
    action_type: str
    actor_id: Optional[str]
    actor_email: Optional[str]
    actor_ip: Optional[str]
    target_type: Optional[str]
    target_id: Optional[str]
    description: Optional[str]
    metadata: Optional[Dict[str, Any]]
    organization_id: Optional[str]

    class Config:
        from_attributes = True


# System Health Schemas
class SystemHealthResponse(BaseModel):
    service_name: str
    status: str
    response_time_ms: Optional[float]
    last_check: datetime
    error_count: int


class SystemHealthOverview(BaseModel):
    overall_status: str
    services: List[SystemHealthResponse]
    uptime_percentage: float
    last_incident: Optional[datetime]


# Platform Stats Schemas
class PlatformStatsResponse(BaseModel):
    date: datetime
    total_users: int
    active_users: int
    new_users: int
    total_organizations: int
    active_organizations: int
    new_organizations: int
    total_subscriptions: int
    mrr: float
    arr: float
    churn_rate: float
    api_requests: int
    ai_requests: int
    storage_used_gb: float

    class Config:
        from_attributes = True


class DashboardOverview(BaseModel):
    total_users: int
    active_users_today: int
    total_organizations: int
    total_revenue: float
    mrr: float
    arr: float
    new_users_this_week: int
    new_orgs_this_week: int
    churn_rate: float
    api_requests_today: int
    ai_requests_today: int
    active_subscriptions: Dict[str, int]  # {"free": 100, "pro": 50, "enterprise": 10}


# Admin User Schemas
class AdminUserCreate(BaseModel):
    user_id: str
    email: EmailStr
    role: AdminRole = AdminRole.ADMIN
    permissions: List[str] = []


class AdminUserUpdate(BaseModel):
    role: Optional[AdminRole] = None
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None


class AdminUserResponse(BaseModel):
    id: int
    user_id: str
    email: str
    role: str
    permissions: List[str]
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# Announcement Schemas
class AnnouncementCreate(BaseModel):
    title: str
    content: str
    type: str = "info"
    target_audience: str = "all"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[str] = None
    target_audience: Optional[str] = None
    is_active: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    type: str
    target_audience: str
    is_active: bool
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# User Management Schemas (for admin)
class UserListItem(BaseModel):
    id: str
    email: str
    name: Optional[str]
    organization_name: Optional[str]
    subscription_plan: str
    status: str
    created_at: datetime
    last_login: Optional[datetime]


class UserListResponse(BaseModel):
    users: List[UserListItem]
    total: int
    page: int
    per_page: int


class OrganizationListItem(BaseModel):
    id: str
    name: str
    owner_email: str
    member_count: int
    subscription_plan: str
    mrr: float
    created_at: datetime
    status: str


class OrganizationListResponse(BaseModel):
    organizations: List[OrganizationListItem]
    total: int
    page: int
    per_page: int

"""
Admin Dashboard API endpoints
Platform management for super admins
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta
import random

from app.db.session import get_db
from app.core.security import get_current_user, get_platform_admin
from app.schemas.admin import (
    FeatureFlagCreate, FeatureFlagUpdate, FeatureFlagResponse,
    PlatformConfigCreate, PlatformConfigUpdate, PlatformConfigResponse,
    AuditLogResponse, SystemHealthResponse, SystemHealthOverview,
    PlatformStatsResponse, DashboardOverview,
    AdminUserCreate, AdminUserUpdate, AdminUserResponse,
    AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse,
    UserListResponse, UserListItem,
    OrganizationListResponse, OrganizationListItem
)

router = APIRouter()


# Admin access is now controlled by get_platform_admin dependency
# Only users with is_platform_admin=True can access these endpoints


# ==================== Dashboard Overview ====================

@router.get("/dashboard", response_model=DashboardOverview)
async def get_admin_dashboard(
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Get admin dashboard overview"""
    
    # Demo data - in production, aggregate from database
    return DashboardOverview(
        total_users=12847,
        active_users_today=3421,
        total_organizations=1893,
        total_revenue=1847293.50,
        mrr=154847.25,
        arr=1858167.00,
        new_users_this_week=342,
        new_orgs_this_week=67,
        churn_rate=2.3,
        api_requests_today=847293,
        ai_requests_today=23847,
        active_subscriptions={
            "free": 1247,
            "pro": 523,
            "enterprise": 123
        }
    )


@router.get("/stats/history")
async def get_stats_history(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Get historical platform statistics"""
    
    # Generate demo data
    stats = []
    base_users = 12000
    base_mrr = 140000
    
    for i in range(days, 0, -1):
        date = datetime.now() - timedelta(days=i)
        growth = (days - i) / days
        stats.append({
            "date": date.isoformat(),
            "total_users": int(base_users + (growth * 847)),
            "active_users": int((base_users + (growth * 847)) * 0.27),
            "new_users": random.randint(8, 25),
            "mrr": base_mrr + (growth * 14847),
            "api_requests": random.randint(20000, 35000),
            "ai_requests": random.randint(500, 1500),
        })
    
    return {"stats": stats}


# ==================== User Management ====================

@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    plan: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """List all users with filtering"""
    
    # Demo data
    users = [
        UserListItem(
            id=f"user_{i}",
            email=f"user{i}@example.com",
            name=f"User {i}",
            organization_name=f"Company {i}",
            subscription_plan=["free", "pro", "enterprise"][i % 3],
            status="active" if i % 5 != 0 else "inactive",
            created_at=datetime.now() - timedelta(days=random.randint(1, 365)),
            last_login=datetime.now() - timedelta(hours=random.randint(1, 72))
        )
        for i in range(1, 21)
    ]
    
    return UserListResponse(
        users=users,
        total=12847,
        page=page,
        per_page=per_page
    )


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Get detailed user information"""
    
    return {
        "id": user_id,
        "email": "user@example.com",
        "name": "John Doe",
        "organization": {
            "id": "org_123",
            "name": "Acme Corp",
            "role": "owner"
        },
        "subscription": {
            "plan": "pro",
            "status": "active",
            "started_at": "2024-01-15T00:00:00Z",
            "current_period_end": "2025-01-15T00:00:00Z"
        },
        "activity": {
            "last_login": datetime.now() - timedelta(hours=2),
            "login_count": 147,
            "api_requests_30d": 8472,
            "ai_requests_30d": 234
        },
        "created_at": "2024-01-01T00:00:00Z"
    }


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    status: str,
    reason: Optional[str] = None,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Update user status (activate/suspend/delete)"""
    
    return {
        "success": True,
        "message": f"User status updated to {status}",
        "user_id": user_id
    }


# ==================== Organization Management ====================

@router.get("/organizations", response_model=OrganizationListResponse)
async def list_organizations(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    plan: Optional[str] = None,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """List all organizations"""
    
    orgs = [
        OrganizationListItem(
            id=f"org_{i}",
            name=f"Company {i}",
            owner_email=f"owner{i}@company{i}.com",
            member_count=random.randint(1, 50),
            subscription_plan=["free", "pro", "enterprise"][i % 3],
            mrr=[0, 99, 499][i % 3],
            created_at=datetime.now() - timedelta(days=random.randint(1, 365)),
            status="active"
        )
        for i in range(1, 21)
    ]
    
    return OrganizationListResponse(
        organizations=orgs,
        total=1893,
        page=page,
        per_page=per_page
    )


# ==================== Feature Flags ====================

@router.get("/feature-flags", response_model=List[FeatureFlagResponse])
async def list_feature_flags(
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """List all feature flags"""
    
    # Demo data
    flags = [
        FeatureFlagResponse(
            id=1,
            name="ai_briefings_v2",
            description="New AI briefing generation with GPT-4",
            enabled=True,
            enabled_for_plans=["pro", "enterprise"],
            enabled_for_organizations=[],
            percentage_rollout=100,
            created_at=datetime.now() - timedelta(days=30),
            updated_at=datetime.now() - timedelta(days=5)
        ),
        FeatureFlagResponse(
            id=2,
            name="scenario_planning",
            description="Advanced scenario planning with Monte Carlo simulations",
            enabled=True,
            enabled_for_plans=["enterprise"],
            enabled_for_organizations=["org_123", "org_456"],
            percentage_rollout=50,
            created_at=datetime.now() - timedelta(days=60),
            updated_at=datetime.now() - timedelta(days=10)
        ),
        FeatureFlagResponse(
            id=3,
            name="real_time_alerts",
            description="Real-time push notifications for alerts",
            enabled=False,
            enabled_for_plans=[],
            enabled_for_organizations=[],
            percentage_rollout=0,
            created_at=datetime.now() - timedelta(days=15),
            updated_at=None
        ),
        FeatureFlagResponse(
            id=4,
            name="custom_dashboards",
            description="User-customizable dashboard layouts",
            enabled=True,
            enabled_for_plans=["free", "pro", "enterprise"],
            enabled_for_organizations=[],
            percentage_rollout=100,
            created_at=datetime.now() - timedelta(days=90),
            updated_at=datetime.now() - timedelta(days=1)
        ),
        FeatureFlagResponse(
            id=5,
            name="api_v2",
            description="New API version with GraphQL support",
            enabled=True,
            enabled_for_plans=["enterprise"],
            enabled_for_organizations=[],
            percentage_rollout=25,
            created_at=datetime.now() - timedelta(days=7),
            updated_at=datetime.now()
        ),
    ]
    
    return flags


@router.post("/feature-flags", response_model=FeatureFlagResponse)
async def create_feature_flag(
    flag: FeatureFlagCreate,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Create a new feature flag"""
    
    return FeatureFlagResponse(
        id=6,
        name=flag.name,
        description=flag.description,
        enabled=flag.enabled,
        enabled_for_plans=flag.enabled_for_plans,
        enabled_for_organizations=flag.enabled_for_organizations,
        percentage_rollout=flag.percentage_rollout,
        created_at=datetime.now(),
        updated_at=None
    )


@router.put("/feature-flags/{flag_id}", response_model=FeatureFlagResponse)
async def update_feature_flag(
    flag_id: int,
    flag: FeatureFlagUpdate,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Update a feature flag"""
    
    return FeatureFlagResponse(
        id=flag_id,
        name="updated_flag",
        description=flag.description or "Updated description",
        enabled=flag.enabled if flag.enabled is not None else True,
        enabled_for_plans=flag.enabled_for_plans or [],
        enabled_for_organizations=flag.enabled_for_organizations or [],
        percentage_rollout=flag.percentage_rollout or 100,
        created_at=datetime.now() - timedelta(days=30),
        updated_at=datetime.now()
    )


@router.delete("/feature-flags/{flag_id}")
async def delete_feature_flag(
    flag_id: int,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Delete a feature flag"""
    
    return {"success": True, "message": f"Feature flag {flag_id} deleted"}


# ==================== Platform Configuration ====================

@router.get("/config", response_model=List[PlatformConfigResponse])
async def list_platform_config(
    category: Optional[str] = None,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """List all platform configuration"""
    
    configs = [
        PlatformConfigResponse(
            id=1, key="app_name", value="AI CEO Platform", value_type="string",
            category="general", description="Application name", is_secret=False, updated_at=None
        ),
        PlatformConfigResponse(
            id=2, key="support_email", value="support@aiceo.com", value_type="string",
            category="general", description="Support email address", is_secret=False, updated_at=None
        ),
        PlatformConfigResponse(
            id=3, key="max_team_members_free", value="3", value_type="number",
            category="limits", description="Max team members for free plan", is_secret=False, updated_at=None
        ),
        PlatformConfigResponse(
            id=4, key="max_team_members_pro", value="10", value_type="number",
            category="limits", description="Max team members for pro plan", is_secret=False, updated_at=None
        ),
        PlatformConfigResponse(
            id=5, key="sendgrid_api_key", value="••••••••", value_type="string",
            category="email", description="SendGrid API key", is_secret=True, updated_at=None
        ),
        PlatformConfigResponse(
            id=6, key="stripe_webhook_secret", value="••••••••", value_type="string",
            category="billing", description="Stripe webhook secret", is_secret=True, updated_at=None
        ),
        PlatformConfigResponse(
            id=7, key="ai_rate_limit_free", value="100", value_type="number",
            category="limits", description="AI requests per day for free plan", is_secret=False, updated_at=None
        ),
        PlatformConfigResponse(
            id=8, key="ai_rate_limit_pro", value="1000", value_type="number",
            category="limits", description="AI requests per day for pro plan", is_secret=False, updated_at=None
        ),
        PlatformConfigResponse(
            id=9, key="maintenance_mode", value="false", value_type="boolean",
            category="general", description="Enable maintenance mode", is_secret=False, updated_at=None
        ),
        PlatformConfigResponse(
            id=10, key="trial_days", value="14", value_type="number",
            category="billing", description="Free trial duration in days", is_secret=False, updated_at=None
        ),
    ]
    
    if category:
        configs = [c for c in configs if c.category == category]
    
    return configs


@router.put("/config/{key}")
async def update_platform_config(
    key: str,
    config: PlatformConfigUpdate,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Update a platform configuration value"""
    
    return {
        "success": True,
        "message": f"Configuration '{key}' updated",
        "key": key,
        "value": config.value
    }


# ==================== Audit Logs ====================

@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=100),
    action_type: Optional[str] = None,
    actor_email: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """List audit logs with filtering"""
    
    # Demo data
    actions = [
        ("user_login", "User logged in", "user"),
        ("settings_updated", "Updated organization settings", "organization"),
        ("subscription_created", "Subscribed to Pro plan", "subscription"),
        ("user_created", "New user registered", "user"),
        ("feature_flag_updated", "Updated feature flag 'ai_briefings_v2'", "feature_flag"),
        ("payment_received", "Payment of $99.00 received", "payment"),
        ("api_key_created", "Created new API key", "api_key"),
        ("data_exported", "Exported dashboard data", "export"),
    ]
    
    logs = []
    for i in range(50):
        action = actions[i % len(actions)]
        logs.append(AuditLogResponse(
            id=i + 1,
            timestamp=datetime.now() - timedelta(hours=i),
            action_type=action[0],
            actor_id=f"user_{i % 10}",
            actor_email=f"user{i % 10}@example.com",
            actor_ip=f"192.168.1.{i % 255}",
            target_type=action[2],
            target_id=f"{action[2]}_{i}",
            description=action[1],
            metadata={"browser": "Chrome", "os": "MacOS"},
            organization_id=f"org_{i % 5}"
        ))
    
    return logs


# ==================== System Health ====================

@router.get("/health", response_model=SystemHealthOverview)
async def get_system_health(
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Get system health overview"""
    
    services = [
        SystemHealthResponse(
            service_name="API Server",
            status="healthy",
            response_time_ms=45.2,
            last_check=datetime.now(),
            error_count=0
        ),
        SystemHealthResponse(
            service_name="Database",
            status="healthy",
            response_time_ms=12.8,
            last_check=datetime.now(),
            error_count=0
        ),
        SystemHealthResponse(
            service_name="Redis Cache",
            status="healthy",
            response_time_ms=2.1,
            last_check=datetime.now(),
            error_count=0
        ),
        SystemHealthResponse(
            service_name="AI Service",
            status="healthy",
            response_time_ms=234.5,
            last_check=datetime.now(),
            error_count=2
        ),
        SystemHealthResponse(
            service_name="Email Service",
            status="healthy",
            response_time_ms=89.3,
            last_check=datetime.now(),
            error_count=0
        ),
        SystemHealthResponse(
            service_name="Storage",
            status="healthy",
            response_time_ms=156.7,
            last_check=datetime.now(),
            error_count=0
        ),
    ]
    
    return SystemHealthOverview(
        overall_status="healthy",
        services=services,
        uptime_percentage=99.97,
        last_incident=datetime.now() - timedelta(days=15)
    )


# ==================== Announcements ====================

@router.get("/announcements", response_model=List[AnnouncementResponse])
async def list_announcements(
    active_only: bool = False,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """List all announcements"""
    
    announcements = [
        AnnouncementResponse(
            id=1,
            title="New Feature: AI Briefings V2",
            content="We've upgraded our AI briefing engine with GPT-4 for more accurate insights.",
            type="info",
            target_audience="all",
            is_active=True,
            start_date=datetime.now() - timedelta(days=7),
            end_date=datetime.now() + timedelta(days=7),
            created_at=datetime.now() - timedelta(days=7)
        ),
        AnnouncementResponse(
            id=2,
            title="Scheduled Maintenance",
            content="We'll be performing scheduled maintenance on Dec 28, 2024 from 2-4 AM UTC.",
            type="maintenance",
            target_audience="all",
            is_active=True,
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=4),
            created_at=datetime.now() - timedelta(days=1)
        ),
        AnnouncementResponse(
            id=3,
            title="Holiday Promotion",
            content="Get 20% off annual plans with code HOLIDAY2024!",
            type="info",
            target_audience="free",
            is_active=True,
            start_date=datetime.now() - timedelta(days=3),
            end_date=datetime.now() + timedelta(days=10),
            created_at=datetime.now() - timedelta(days=3)
        ),
    ]
    
    if active_only:
        announcements = [a for a in announcements if a.is_active]
    
    return announcements


@router.post("/announcements", response_model=AnnouncementResponse)
async def create_announcement(
    announcement: AnnouncementCreate,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Create a new announcement"""
    
    return AnnouncementResponse(
        id=4,
        title=announcement.title,
        content=announcement.content,
        type=announcement.type,
        target_audience=announcement.target_audience,
        is_active=True,
        start_date=announcement.start_date,
        end_date=announcement.end_date,
        created_at=datetime.now()
    )


@router.put("/announcements/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement(
    announcement_id: int,
    announcement: AnnouncementUpdate,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Update an announcement"""
    
    return AnnouncementResponse(
        id=announcement_id,
        title=announcement.title or "Updated Announcement",
        content=announcement.content or "Updated content",
        type=announcement.type or "info",
        target_audience=announcement.target_audience or "all",
        is_active=announcement.is_active if announcement.is_active is not None else True,
        start_date=announcement.start_date,
        end_date=announcement.end_date,
        created_at=datetime.now() - timedelta(days=1)
    )


@router.delete("/announcements/{announcement_id}")
async def delete_announcement(
    announcement_id: int,
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Delete an announcement"""
    
    return {"success": True, "message": f"Announcement {announcement_id} deleted"}


# ==================== Revenue Analytics ====================

@router.get("/revenue/analytics")
async def get_revenue_analytics(
    period: str = Query("30d", regex="^(7d|30d|90d|1y)$"),
    current_user: dict = Depends(get_platform_admin),
    db: Session = Depends(get_db)
):
    """Get revenue analytics"""
    
    return {
        "mrr": 154847.25,
        "arr": 1858167.00,
        "mrr_growth": 8.5,
        "total_revenue": 1847293.50,
        "average_revenue_per_user": 81.45,
        "lifetime_value": 2847.32,
        "churn_rate": 2.3,
        "net_revenue_retention": 112.5,
        "revenue_by_plan": {
            "free": 0,
            "pro": 51777.00,
            "enterprise": 103070.25
        },
        "revenue_trend": [
            {"date": "2024-11", "mrr": 142000},
            {"date": "2024-12", "mrr": 154847},
        ],
        "top_customers": [
            {"name": "Acme Corp", "mrr": 4990, "plan": "enterprise"},
            {"name": "TechStart Inc", "mrr": 2495, "plan": "enterprise"},
            {"name": "Global Solutions", "mrr": 1990, "plan": "enterprise"},
        ]
    }

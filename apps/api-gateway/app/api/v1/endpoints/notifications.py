"""
Real-Time Notifications API Endpoints
Comprehensive notification system with WebSocket, push, and email support
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

from app.db.session import get_db
from app.core.security import get_current_user
from app.services.email_service import email_service, EmailTemplate

router = APIRouter()


# Pydantic models
class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"
    category: str = "system"
    priority: str = "medium"
    action_url: Optional[str] = None
    action_label: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    data: Optional[dict] = None


class NotificationPreferencesUpdate(BaseModel):
    """Update notification preferences"""
    notifications_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    email_digest_frequency: Optional[str] = None
    digest_time: Optional[str] = None
    digest_timezone: Optional[str] = None
    category_preferences: Optional[dict] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None
    dnd_enabled: Optional[bool] = None
    dnd_until: Optional[datetime] = None
    # Legacy fields
    email_daily_briefing: Optional[bool] = True
    email_weekly_report: Optional[bool] = True
    email_alerts_critical: Optional[bool] = True
    email_alerts_high: Optional[bool] = True
    email_alerts_medium: Optional[bool] = False
    email_alerts_low: Optional[bool] = False
    email_team_updates: Optional[bool] = True
    email_billing_updates: Optional[bool] = True
    email_product_updates: Optional[bool] = True


class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh_key: str
    auth_key: str
    device_name: Optional[str] = None
    device_type: Optional[str] = "web"


class SendEmailRequest(BaseModel):
    """Request to send an email"""
    to_email: EmailStr
    template: str
    template_data: Dict[str, Any] = {}


class TestEmailRequest(BaseModel):
    """Request to send a test email"""
    to_email: EmailStr
    template: str = "welcome"


# WebSocket connections store
websocket_connections: Dict[str, List[WebSocket]] = {}


# Mock notification service
class NotificationService:
    def __init__(self):
        self.notifications = []
    
    async def get_notifications(self, user_id: str, page: int = 1, page_size: int = 20, 
                                unread_only: bool = False, category: Optional[str] = None):
        notifications = self._get_mock_notifications(user_id)
        if unread_only:
            notifications = [n for n in notifications if not n["is_read"]]
        if category:
            notifications = [n for n in notifications if n["category"] == category]
        
        total = len(notifications)
        start = (page - 1) * page_size
        end = start + page_size
        
        return {
            "notifications": notifications[start:end],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
            "unread_count": len([n for n in self._get_mock_notifications(user_id) if not n["is_read"]])
        }
    
    async def get_unread_count(self, user_id: str):
        notifications = self._get_mock_notifications(user_id)
        unread = [n for n in notifications if not n["is_read"]]
        counts = {"total": len(unread)}
        for n in unread:
            cat = n["category"]
            counts[cat] = counts.get(cat, 0) + 1
        return counts
    
    async def create_notification(self, user_id: str, **kwargs):
        notification = {
            "id": f"notif-{len(self.notifications) + 100}",
            "user_id": user_id,
            **kwargs,
            "is_read": False,
            "is_archived": False,
            "created_at": datetime.utcnow().isoformat()
        }
        self.notifications.append(notification)
        
        # Send via WebSocket if connected
        if user_id in websocket_connections:
            for ws in websocket_connections[user_id]:
                try:
                    await ws.send_json({"type": "notification", "data": notification})
                except:
                    pass
        
        return notification
    
    async def mark_as_read(self, user_id: str, notification_id: str):
        return {"id": notification_id, "is_read": True, "read_at": datetime.utcnow().isoformat()}
    
    async def mark_all_as_read(self, user_id: str, category: Optional[str] = None):
        return {"marked_count": 8}
    
    async def archive_notification(self, user_id: str, notification_id: str):
        return {"id": notification_id, "is_archived": True, "archived_at": datetime.utcnow().isoformat()}
    
    async def delete_notification(self, user_id: str, notification_id: str):
        return True
    
    async def get_preferences(self, user_id: str):
        return {
            "user_id": user_id,
            "notifications_enabled": True,
            "push_enabled": True,
            "email_enabled": True,
            "sound_enabled": True,
            "email_digest_frequency": "daily",
            "digest_time": "09:00",
            "digest_timezone": "America/New_York",
            "category_preferences": {
                "system": {"in_app": True, "push": True, "email": True},
                "meeting": {"in_app": True, "push": True, "email": True},
                "okr": {"in_app": True, "push": True, "email": False},
                "document": {"in_app": True, "push": False, "email": False},
                "report": {"in_app": True, "push": False, "email": True},
                "alert": {"in_app": True, "push": True, "email": True},
                "reminder": {"in_app": True, "push": True, "email": False},
                "workflow": {"in_app": True, "push": True, "email": False},
                "integration": {"in_app": True, "push": False, "email": False}
            },
            "quiet_hours_enabled": True,
            "quiet_hours_start": "22:00",
            "quiet_hours_end": "08:00",
            "dnd_enabled": False,
            "dnd_until": None,
            "email_daily_briefing": True,
            "email_weekly_report": True,
            "email_alerts_critical": True,
            "email_alerts_high": True,
            "email_alerts_medium": False,
            "email_alerts_low": False,
            "email_team_updates": True,
            "email_billing_updates": True,
            "email_product_updates": True
        }
    
    async def update_preferences(self, user_id: str, preferences: dict):
        current = await self.get_preferences(user_id)
        current.update(preferences)
        current["updated_at"] = datetime.utcnow().isoformat()
        return current
    
    async def register_push_subscription(self, user_id: str, endpoint: str, p256dh_key: str, 
                                         auth_key: str, device_info: dict = None):
        return {
            "id": f"push-sub-{hash(endpoint) % 10000}",
            "user_id": user_id,
            "endpoint": endpoint[:50] + "...",
            "device_name": device_info.get("device_name", "Web Browser") if device_info else "Web Browser",
            "device_type": device_info.get("device_type", "web") if device_info else "web",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
    
    async def unregister_push_subscription(self, user_id: str, subscription_id: str):
        return True
    
    async def send_test_notification(self, user_id: str, channel: str = "all"):
        notification = await self.create_notification(
            user_id=user_id,
            title="Test Notification",
            message="This is a test notification to verify your settings are working correctly.",
            type="info",
            category="system",
            priority="low"
        )
        return {"success": True, "notification": notification, "channel": channel}
    
    async def get_digest_history(self, user_id: str, limit: int = 10):
        now = datetime.utcnow()
        from datetime import timedelta
        return [
            {
                "id": f"digest-{i}",
                "frequency": "daily",
                "period_start": (now - timedelta(days=i+1)).isoformat(),
                "period_end": (now - timedelta(days=i)).isoformat(),
                "notification_count": 8 + i,
                "sent_at": (now - timedelta(days=i)).isoformat(),
                "opened_at": (now - timedelta(days=i, hours=2)).isoformat() if i < 5 else None
            }
            for i in range(limit)
        ]
    
    async def generate_digest(self, user_id: str, frequency: str):
        now = datetime.utcnow()
        from datetime import timedelta
        
        if frequency == "daily":
            period_start = now - timedelta(days=1)
        elif frequency == "weekly":
            period_start = now - timedelta(weeks=1)
        else:
            period_start = now - timedelta(hours=1)
        
        return {
            "user_id": user_id,
            "frequency": frequency,
            "period_start": period_start.isoformat(),
            "period_end": now.isoformat(),
            "notification_count": 12,
            "summary": {
                "meetings": 3,
                "okr_updates": 4,
                "documents": 2,
                "alerts": 2,
                "workflows": 1
            },
            "highlights": [
                {"title": "Q4 Strategy Review", "type": "meeting"},
                {"title": "Revenue target reached 85%", "type": "okr"},
                {"title": "New board presentation shared", "type": "document"}
            ]
        }
    
    def _get_mock_notifications(self, user_id: str):
        from datetime import timedelta
        now = datetime.utcnow()
        
        return [
            {
                "id": "notif-1",
                "user_id": user_id,
                "title": "Meeting Starting Soon",
                "message": "Q4 Strategy Review starts in 15 minutes",
                "type": "warning",
                "category": "meeting",
                "priority": "high",
                "action_url": "/app/meetings/1",
                "action_label": "Join Meeting",
                "icon": "video",
                "is_read": False,
                "is_archived": False,
                "created_at": (now - timedelta(minutes=5)).isoformat()
            },
            {
                "id": "notif-2",
                "user_id": user_id,
                "title": "OKR Update Required",
                "message": "Your Q4 goal 'Increase MRR' is due for an update",
                "type": "action_required",
                "category": "okr",
                "priority": "medium",
                "action_url": "/app/okr",
                "action_label": "Update Progress",
                "icon": "target",
                "is_read": False,
                "is_archived": False,
                "created_at": (now - timedelta(hours=1)).isoformat()
            },
            {
                "id": "notif-3",
                "user_id": user_id,
                "title": "New Document Shared",
                "message": "Sarah Chen shared 'Q4 Financial Report' with you",
                "type": "info",
                "category": "document",
                "priority": "low",
                "action_url": "/app/documents",
                "action_label": "View Document",
                "icon": "document",
                "is_read": False,
                "is_archived": False,
                "created_at": (now - timedelta(hours=2)).isoformat()
            },
            {
                "id": "notif-4",
                "user_id": user_id,
                "title": "Action Item Overdue",
                "message": "Follow up with enterprise leads is now overdue",
                "type": "error",
                "category": "reminder",
                "priority": "urgent",
                "action_url": "/app/meetings/action-items",
                "action_label": "View Task",
                "icon": "alert",
                "is_read": False,
                "is_archived": False,
                "created_at": (now - timedelta(hours=3)).isoformat()
            },
            {
                "id": "notif-5",
                "user_id": user_id,
                "title": "Weekly Report Ready",
                "message": "Your Executive Summary for Week 51 is ready to view",
                "type": "success",
                "category": "report",
                "priority": "medium",
                "action_url": "/app/reports",
                "action_label": "View Report",
                "icon": "chart",
                "is_read": True,
                "read_at": (now - timedelta(hours=4)).isoformat(),
                "is_archived": False,
                "created_at": (now - timedelta(hours=5)).isoformat()
            },
            {
                "id": "notif-6",
                "user_id": user_id,
                "title": "Revenue Alert",
                "message": "MRR dropped 5% compared to last week",
                "type": "warning",
                "category": "alert",
                "priority": "high",
                "action_url": "/app/predictive-bi",
                "action_label": "View Analytics",
                "icon": "trending-down",
                "is_read": True,
                "read_at": (now - timedelta(hours=6)).isoformat(),
                "is_archived": False,
                "created_at": (now - timedelta(hours=8)).isoformat()
            },
            {
                "id": "notif-7",
                "user_id": user_id,
                "title": "Workflow Completed",
                "message": "Monthly report generation workflow completed successfully",
                "type": "success",
                "category": "workflow",
                "priority": "low",
                "action_url": "/app/workflows",
                "action_label": "View Workflow",
                "icon": "check-circle",
                "is_read": True,
                "is_archived": False,
                "created_at": (now - timedelta(days=1)).isoformat()
            },
            {
                "id": "notif-8",
                "user_id": user_id,
                "title": "Integration Connected",
                "message": "Slack integration has been successfully connected",
                "type": "success",
                "category": "integration",
                "priority": "low",
                "action_url": "/app/meetings/integrations",
                "action_label": "View Integrations",
                "icon": "link",
                "is_read": True,
                "is_archived": False,
                "created_at": (now - timedelta(days=2)).isoformat()
            }
        ]


notification_service = NotificationService()


# WebSocket endpoint
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time notifications"""
    await websocket.accept()
    user_id = "user-123"  # In production, get from auth token
    
    if user_id not in websocket_connections:
        websocket_connections[user_id] = []
    websocket_connections[user_id].append(websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        websocket_connections[user_id].remove(websocket)


# Notification endpoints
@router.get("")
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get paginated notifications for current user"""
    return await notification_service.get_notifications(
        user_id=str(current_user.get("id", "user-123")),
        page=page,
        page_size=page_size,
        unread_only=unread_only,
        category=category
    )


@router.get("/unread-count")
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get unread notification counts"""
    return await notification_service.get_unread_count(
        user_id=str(current_user.get("id", "user-123"))
    )


@router.post("")
async def create_notification(
    notification: NotificationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new notification"""
    return await notification_service.create_notification(
        user_id=str(current_user.get("id", "user-123")),
        title=notification.title,
        message=notification.message,
        type=notification.type,
        category=notification.category,
        priority=notification.priority,
        action_url=notification.action_url,
        action_label=notification.action_label,
        entity_type=notification.entity_type,
        entity_id=notification.entity_id,
        data=notification.data
    )


@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Mark a notification as read"""
    return await notification_service.mark_as_read(
        user_id=str(current_user.get("id", "user-123")),
        notification_id=notification_id
    )


@router.put("/read-all")
async def mark_all_as_read(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Mark all notifications as read"""
    return await notification_service.mark_all_as_read(
        user_id=str(current_user.get("id", "user-123")),
        category=category
    )


@router.put("/{notification_id}/archive")
async def archive_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Archive a notification"""
    return await notification_service.archive_notification(
        user_id=str(current_user.get("id", "user-123")),
        notification_id=notification_id
    )


@router.delete("/{notification_id}")
async def delete_notification(notification_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a notification"""
    success = await notification_service.delete_notification(
        user_id=str(current_user.get("id", "user-123")),
        notification_id=notification_id
    )
    return {"success": success}


# Preferences endpoints
@router.get("/preferences")
async def get_notification_preferences(current_user: dict = Depends(get_current_user)):
    """Get user's notification preferences"""
    return await notification_service.get_preferences(
        user_id=str(current_user.get("id", "user-123"))
    )


@router.put("/preferences")
async def update_notification_preferences(
    preferences: NotificationPreferencesUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update user's notification preferences"""
    return await notification_service.update_preferences(
        user_id=str(current_user.get("id", "user-123")),
        preferences=preferences.dict(exclude_none=True)
    )


# Push subscription endpoints
@router.post("/push/subscribe")
async def subscribe_push(
    subscription: PushSubscriptionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Register a push notification subscription"""
    return await notification_service.register_push_subscription(
        user_id=str(current_user.get("id", "user-123")),
        endpoint=subscription.endpoint,
        p256dh_key=subscription.p256dh_key,
        auth_key=subscription.auth_key,
        device_info={
            "device_name": subscription.device_name,
            "device_type": subscription.device_type
        }
    )


@router.delete("/push/subscribe/{subscription_id}")
async def unsubscribe_push(subscription_id: str, current_user: dict = Depends(get_current_user)):
    """Unregister a push subscription"""
    success = await notification_service.unregister_push_subscription(
        user_id=str(current_user.get("id", "user-123")),
        subscription_id=subscription_id
    )
    return {"success": success}


# Test endpoints
@router.post("/test")
async def send_test_notification(
    channel: str = Query("all"),
    current_user: dict = Depends(get_current_user)
):
    """Send a test notification"""
    return await notification_service.send_test_notification(
        user_id=str(current_user.get("id", "user-123")),
        channel=channel
    )


@router.post("/send-test")
async def send_test_email(
    request: TestEmailRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
):
    """Send a test email"""
    template_map = {
        "welcome": EmailTemplate.WELCOME,
        "invitation": EmailTemplate.TEAM_INVITATION,
        "daily_briefing": EmailTemplate.DAILY_BRIEFING,
        "alert": EmailTemplate.ALERT_NOTIFICATION,
        "subscription": EmailTemplate.SUBSCRIPTION_CONFIRMATION,
    }
    
    template = template_map.get(request.template, EmailTemplate.WELCOME)
    
    test_data = {
        "name": "Test User",
        "login_url": "https://app.aiceo.com/login",
        "inviter_name": "John Doe",
        "organization_name": "Test Organization",
        "role": "Admin",
        "invite_url": "https://app.aiceo.com/invite/test",
        "date": "December 24, 2024",
        "briefing": "This is a test briefing. Your revenue is up 15% this week!",
        "metrics": {"Revenue": "$125K", "Users": "1,234", "Growth": "+15%"},
        "alert_type": "Revenue Alert",
        "title": "Revenue Milestone Reached",
        "message": "Congratulations! You've reached $100K MRR.",
        "severity": "low",
        "plan_name": "Pro",
        "amount": "$99",
        "billing_period": "monthly",
    }
    
    result = await email_service.send_template_email(
        to_email=request.to_email,
        template=template,
        template_data=test_data,
        to_name="Test User"
    )
    
    return result


# Digest endpoints
@router.get("/digests")
async def get_digest_history(
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get email digest history"""
    return await notification_service.get_digest_history(
        user_id=str(current_user.get("id", "user-123")),
        limit=limit
    )


@router.post("/digests/preview")
async def preview_digest(
    frequency: str = Query("daily"),
    current_user: dict = Depends(get_current_user)
):
    """Preview what the next digest would look like"""
    return await notification_service.generate_digest(
        user_id=str(current_user.get("id", "user-123")),
        frequency=frequency
    )


# Legacy endpoints
@router.post("/send-invitation")
async def send_invitation_email(
    to_email: EmailStr,
    inviter_name: str,
    organization_name: str,
    role: str,
    invite_url: str,
    message: str = "",
    current_user: dict = Depends(get_current_user),
):
    """Send a team invitation email"""
    result = await email_service.send_template_email(
        to_email=to_email,
        template=EmailTemplate.TEAM_INVITATION,
        template_data={
            "inviter_name": inviter_name,
            "organization_name": organization_name,
            "role": role,
            "invite_url": invite_url,
            "message": message,
        }
    )
    return result


@router.get("/templates")
async def get_email_templates(current_user: dict = Depends(get_current_user)):
    """Get available email templates"""
    return {
        "templates": [
            {"id": "welcome", "name": "Welcome Email", "description": "Sent when a new user signs up"},
            {"id": "team_invitation", "name": "Team Invitation", "description": "Sent when inviting team members"},
            {"id": "password_reset", "name": "Password Reset", "description": "Sent for password reset requests"},
            {"id": "daily_briefing", "name": "Daily Briefing", "description": "Daily AI-generated briefing"},
            {"id": "alert_notification", "name": "Alert Notification", "description": "Sent for important alerts"},
            {"id": "subscription_confirmation", "name": "Subscription Confirmation", "description": "Sent after subscription"},
            {"id": "subscription_cancelled", "name": "Subscription Cancelled", "description": "Sent when subscription is cancelled"},
            {"id": "payment_failed", "name": "Payment Failed", "description": "Sent when payment fails"},
            {"id": "trial_ending", "name": "Trial Ending", "description": "Sent before trial expires"},
            {"id": "weekly_report", "name": "Weekly Report", "description": "Weekly summary report"},
        ]
    }

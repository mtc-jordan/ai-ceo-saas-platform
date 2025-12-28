"""
Real-Time Notifications Service
Handles notification creation, delivery, and management
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from uuid import UUID
import json
import asyncio


class NotificationService:
    """Service for managing notifications"""
    
    def __init__(self):
        self.websocket_connections: Dict[str, List[Any]] = {}
    
    async def create_notification(
        self,
        user_id: UUID,
        title: str,
        message: str,
        notification_type: str = "info",
        category: str = "system",
        priority: str = "medium",
        action_url: Optional[str] = None,
        action_label: Optional[str] = None,
        entity_type: Optional[str] = None,
        entity_id: Optional[UUID] = None,
        data: Optional[Dict] = None,
        organization_id: Optional[UUID] = None
    ) -> Dict[str, Any]:
        """Create a new notification and deliver it"""
        
        notification = {
            "id": str(UUID(int=hash(f"{user_id}{title}{datetime.utcnow().isoformat()}") % (2**128))),
            "user_id": str(user_id),
            "organization_id": str(organization_id) if organization_id else None,
            "title": title,
            "message": message,
            "type": notification_type,
            "category": category,
            "priority": priority,
            "action_url": action_url,
            "action_label": action_label,
            "entity_type": entity_type,
            "entity_id": str(entity_id) if entity_id else None,
            "data": data,
            "is_read": False,
            "is_archived": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Send real-time notification via WebSocket
        await self._send_realtime_notification(user_id, notification)
        
        # Check if push notification should be sent
        prefs = await self.get_user_preferences(user_id)
        if prefs.get("push_enabled") and self._should_send_push(prefs, category):
            await self._send_push_notification(user_id, notification)
        
        # Queue for email digest if needed
        if prefs.get("email_enabled") and self._should_send_email(prefs, category):
            if prefs.get("email_digest_frequency") == "instant":
                await self._send_email_notification(user_id, notification)
            else:
                await self._queue_for_digest(user_id, notification)
        
        return notification
    
    async def get_notifications(
        self,
        user_id: UUID,
        page: int = 1,
        page_size: int = 20,
        unread_only: bool = False,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get paginated notifications for a user"""
        
        # Mock notifications for demo
        notifications = self._get_mock_notifications(user_id)
        
        # Filter
        if unread_only:
            notifications = [n for n in notifications if not n["is_read"]]
        if category:
            notifications = [n for n in notifications if n["category"] == category]
        
        # Paginate
        total = len(notifications)
        start = (page - 1) * page_size
        end = start + page_size
        
        return {
            "notifications": notifications[start:end],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
            "unread_count": len([n for n in notifications if not n["is_read"]])
        }
    
    async def get_unread_count(self, user_id: UUID) -> Dict[str, int]:
        """Get unread notification counts by category"""
        notifications = self._get_mock_notifications(user_id)
        unread = [n for n in notifications if not n["is_read"]]
        
        counts = {"total": len(unread)}
        for n in unread:
            cat = n["category"]
            counts[cat] = counts.get(cat, 0) + 1
        
        return counts
    
    async def mark_as_read(self, user_id: UUID, notification_id: UUID) -> Dict[str, Any]:
        """Mark a notification as read"""
        return {
            "id": str(notification_id),
            "is_read": True,
            "read_at": datetime.utcnow().isoformat()
        }
    
    async def mark_all_as_read(self, user_id: UUID, category: Optional[str] = None) -> Dict[str, int]:
        """Mark all notifications as read"""
        return {"marked_count": 15}
    
    async def archive_notification(self, user_id: UUID, notification_id: UUID) -> Dict[str, Any]:
        """Archive a notification"""
        return {
            "id": str(notification_id),
            "is_archived": True,
            "archived_at": datetime.utcnow().isoformat()
        }
    
    async def delete_notification(self, user_id: UUID, notification_id: UUID) -> bool:
        """Delete a notification"""
        return True
    
    async def get_user_preferences(self, user_id: UUID) -> Dict[str, Any]:
        """Get user notification preferences"""
        return {
            "user_id": str(user_id),
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
            "dnd_until": None
        }
    
    async def update_preferences(self, user_id: UUID, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Update user notification preferences"""
        current = await self.get_user_preferences(user_id)
        current.update(preferences)
        current["updated_at"] = datetime.utcnow().isoformat()
        return current
    
    async def register_push_subscription(
        self,
        user_id: UUID,
        endpoint: str,
        p256dh_key: str,
        auth_key: str,
        device_info: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Register a push notification subscription"""
        return {
            "id": str(UUID(int=hash(endpoint) % (2**128))),
            "user_id": str(user_id),
            "endpoint": endpoint,
            "device_name": device_info.get("device_name") if device_info else "Web Browser",
            "device_type": device_info.get("device_type") if device_info else "web",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat()
        }
    
    async def unregister_push_subscription(self, user_id: UUID, subscription_id: UUID) -> bool:
        """Unregister a push subscription"""
        return True
    
    async def send_test_notification(self, user_id: UUID, channel: str = "all") -> Dict[str, Any]:
        """Send a test notification"""
        notification = await self.create_notification(
            user_id=user_id,
            title="Test Notification",
            message="This is a test notification to verify your settings are working correctly.",
            notification_type="info",
            category="system",
            priority="low"
        )
        return {"success": True, "notification": notification, "channel": channel}
    
    # Private methods
    
    async def _send_realtime_notification(self, user_id: UUID, notification: Dict):
        """Send notification via WebSocket"""
        user_key = str(user_id)
        if user_key in self.websocket_connections:
            for ws in self.websocket_connections[user_key]:
                try:
                    await ws.send_json({"type": "notification", "data": notification})
                except Exception:
                    pass
    
    async def _send_push_notification(self, user_id: UUID, notification: Dict):
        """Send push notification"""
        # In production, use web-push library
        pass
    
    async def _send_email_notification(self, user_id: UUID, notification: Dict):
        """Send email notification immediately"""
        # In production, use email service
        pass
    
    async def _queue_for_digest(self, user_id: UUID, notification: Dict):
        """Queue notification for email digest"""
        pass
    
    def _should_send_push(self, prefs: Dict, category: str) -> bool:
        """Check if push should be sent based on preferences"""
        if not prefs.get("push_enabled"):
            return False
        cat_prefs = prefs.get("category_preferences", {}).get(category, {})
        return cat_prefs.get("push", False)
    
    def _should_send_email(self, prefs: Dict, category: str) -> bool:
        """Check if email should be sent based on preferences"""
        if not prefs.get("email_enabled"):
            return False
        cat_prefs = prefs.get("category_preferences", {}).get(category, {})
        return cat_prefs.get("email", False)
    
    def _get_mock_notifications(self, user_id: UUID) -> List[Dict]:
        """Generate mock notifications for demo"""
        now = datetime.utcnow()
        
        return [
            {
                "id": "notif-1",
                "user_id": str(user_id),
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
                "user_id": str(user_id),
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
                "user_id": str(user_id),
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
                "user_id": str(user_id),
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
                "user_id": str(user_id),
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
                "user_id": str(user_id),
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
                "user_id": str(user_id),
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
                "user_id": str(user_id),
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


class EmailDigestService:
    """Service for managing email digests"""
    
    async def generate_digest(self, user_id: UUID, frequency: str) -> Dict[str, Any]:
        """Generate email digest for a user"""
        now = datetime.utcnow()
        
        if frequency == "daily":
            period_start = now - timedelta(days=1)
        elif frequency == "weekly":
            period_start = now - timedelta(weeks=1)
        elif frequency == "hourly":
            period_start = now - timedelta(hours=1)
        else:
            period_start = now - timedelta(days=1)
        
        return {
            "user_id": str(user_id),
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
    
    async def send_digest(self, user_id: UUID, digest: Dict) -> bool:
        """Send email digest to user"""
        # In production, use email service
        return True
    
    async def get_digest_history(self, user_id: UUID, limit: int = 10) -> List[Dict]:
        """Get digest history for a user"""
        now = datetime.utcnow()
        
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


# Initialize services
notification_service = NotificationService()
email_digest_service = EmailDigestService()

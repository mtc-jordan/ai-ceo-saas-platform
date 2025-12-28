"""
Real-Time Notifications Database Models
"""
from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, Enum, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum


class NotificationType(str, enum.Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    ACTION_REQUIRED = "action_required"


class NotificationCategory(str, enum.Enum):
    SYSTEM = "system"
    MEETING = "meeting"
    OKR = "okr"
    DOCUMENT = "document"
    REPORT = "report"
    ALERT = "alert"
    REMINDER = "reminder"
    WORKFLOW = "workflow"
    INTEGRATION = "integration"


class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class DigestFrequency(str, enum.Enum):
    INSTANT = "instant"
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    NEVER = "never"


class Notification:
    """Individual notification model"""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    
    # Notification content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.INFO)
    category = Column(Enum(NotificationCategory), default=NotificationCategory.SYSTEM)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    
    # Action and linking
    action_url = Column(String(500), nullable=True)
    action_label = Column(String(100), nullable=True)
    entity_type = Column(String(50), nullable=True)  # e.g., "meeting", "document", "goal"
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Metadata
    icon = Column(String(50), nullable=True)
    image_url = Column(String(500), nullable=True)
    data = Column(JSON, nullable=True)  # Additional structured data
    
    # Status
    is_read = Column(Boolean, default=False, index=True)
    read_at = Column(DateTime, nullable=True)
    is_archived = Column(Boolean, default=False, index=True)
    archived_at = Column(DateTime, nullable=True)
    
    # Delivery status
    push_sent = Column(Boolean, default=False)
    push_sent_at = Column(DateTime, nullable=True)
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)


class NotificationPreference:
    """User notification preferences"""
    __tablename__ = "notification_preferences"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    
    # Global settings
    notifications_enabled = Column(Boolean, default=True)
    push_enabled = Column(Boolean, default=True)
    email_enabled = Column(Boolean, default=True)
    sound_enabled = Column(Boolean, default=True)
    
    # Email digest settings
    email_digest_frequency = Column(Enum(DigestFrequency), default=DigestFrequency.DAILY)
    digest_time = Column(String(5), default="09:00")  # HH:MM format
    digest_timezone = Column(String(50), default="UTC")
    
    # Category preferences (JSON for flexibility)
    category_preferences = Column(JSON, default=lambda: {
        "system": {"in_app": True, "push": True, "email": True},
        "meeting": {"in_app": True, "push": True, "email": True},
        "okr": {"in_app": True, "push": True, "email": False},
        "document": {"in_app": True, "push": False, "email": False},
        "report": {"in_app": True, "push": False, "email": True},
        "alert": {"in_app": True, "push": True, "email": True},
        "reminder": {"in_app": True, "push": True, "email": False},
        "workflow": {"in_app": True, "push": True, "email": False},
        "integration": {"in_app": True, "push": False, "email": False}
    })
    
    # Quiet hours
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String(5), default="22:00")
    quiet_hours_end = Column(String(5), default="08:00")
    
    # Do not disturb
    dnd_enabled = Column(Boolean, default=False)
    dnd_until = Column(DateTime, nullable=True)
    
    # Timestamps
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PushSubscription:
    """Web push notification subscriptions"""
    __tablename__ = "push_subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Push subscription data
    endpoint = Column(Text, nullable=False)
    p256dh_key = Column(Text, nullable=False)
    auth_key = Column(Text, nullable=False)
    
    # Device info
    device_name = Column(String(100), nullable=True)
    device_type = Column(String(50), nullable=True)  # web, mobile, desktop
    browser = Column(String(50), nullable=True)
    os = Column(String(50), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)


class EmailDigest:
    """Email digest tracking"""
    __tablename__ = "email_digests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Digest info
    frequency = Column(Enum(DigestFrequency), nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    
    # Content
    notification_count = Column(Integer, default=0)
    notification_ids = Column(JSON, default=list)
    
    # Status
    sent_at = Column(DateTime, nullable=True)
    opened_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)


class NotificationTemplate:
    """Reusable notification templates"""
    __tablename__ = "notification_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    
    # Template info
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    # Template content
    title_template = Column(String(255), nullable=False)
    message_template = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.INFO)
    category = Column(Enum(NotificationCategory), default=NotificationCategory.SYSTEM)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM)
    
    # Default action
    default_action_url = Column(String(500), nullable=True)
    default_action_label = Column(String(100), nullable=True)
    default_icon = Column(String(50), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False)  # System templates can't be deleted
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

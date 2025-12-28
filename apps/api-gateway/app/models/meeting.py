"""Database models for AI Meeting Assistant module."""
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Boolean, JSON, Float
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship

from app.db.base import Base


class MeetingPlatform(str, Enum):
    """Supported meeting platforms."""
    ZOOM = "zoom"
    GOOGLE_MEET = "google_meet"
    MICROSOFT_TEAMS = "microsoft_teams"
    MANUAL_UPLOAD = "manual_upload"
    OTHER = "other"


class MeetingStatus(str, Enum):
    """Meeting processing status."""
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PROCESSING = "processing"
    TRANSCRIBED = "transcribed"
    ANALYZED = "analyzed"
    FAILED = "failed"


class ActionItemStatus(str, Enum):
    """Action item status."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class ActionItemPriority(str, Enum):
    """Action item priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Meeting(Base):
    """Meeting model for storing meeting information."""
    __tablename__ = "meetings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Meeting details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    platform = Column(String(50), default=MeetingPlatform.MANUAL_UPLOAD.value)
    external_meeting_id = Column(String(255), nullable=True)  # ID from Zoom/Meet/Teams
    meeting_url = Column(String(500), nullable=True)
    
    # Timing
    scheduled_start = Column(DateTime, nullable=True)
    scheduled_end = Column(DateTime, nullable=True)
    actual_start = Column(DateTime, nullable=True)
    actual_end = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, nullable=True)
    
    # Status and processing
    status = Column(String(50), default=MeetingStatus.SCHEDULED.value)
    
    # Media files
    audio_file_url = Column(String(500), nullable=True)
    video_file_url = Column(String(500), nullable=True)
    
    # Transcription
    transcript = Column(Text, nullable=True)
    transcript_segments = Column(JSON, nullable=True)  # [{start, end, speaker, text}]
    transcription_confidence = Column(Float, nullable=True)
    
    # AI Analysis
    summary = Column(Text, nullable=True)
    key_points = Column(JSON, nullable=True)  # List of key discussion points
    decisions = Column(JSON, nullable=True)  # List of decisions made
    topics = Column(JSON, nullable=True)  # Topics discussed with timestamps
    sentiment_analysis = Column(JSON, nullable=True)  # Overall meeting sentiment
    
    # Participants
    participants = Column(JSON, nullable=True)  # [{name, email, role, speaking_time}]
    
    # Metadata
    tags = Column(ARRAY(String), nullable=True)
    metadata = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    follow_ups = relationship("MeetingFollowUp", back_populates="meeting", cascade="all, delete-orphan")


class ActionItem(Base):
    """Action items extracted from meetings."""
    __tablename__ = "action_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Action item details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Assignment
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assignee_name = Column(String(255), nullable=True)  # For external assignees
    assignee_email = Column(String(255), nullable=True)
    
    # Timing
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Status and priority
    status = Column(String(50), default=ActionItemStatus.PENDING.value)
    priority = Column(String(50), default=ActionItemPriority.MEDIUM.value)
    
    # Context from meeting
    context = Column(Text, nullable=True)  # Relevant transcript excerpt
    timestamp_in_meeting = Column(Integer, nullable=True)  # Seconds into meeting
    
    # AI confidence
    ai_extracted = Column(Boolean, default=True)
    confidence_score = Column(Float, nullable=True)
    
    # Reminders
    reminder_sent = Column(Boolean, default=False)
    reminder_count = Column(Integer, default=0)
    next_reminder_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="action_items")


class MeetingFollowUp(Base):
    """Follow-up reminders and notifications for meetings."""
    __tablename__ = "meeting_follow_ups"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    meeting_id = Column(UUID(as_uuid=True), ForeignKey("meetings.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Follow-up details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    follow_up_type = Column(String(50), nullable=False)  # reminder, check_in, escalation
    
    # Recipient
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    recipient_email = Column(String(255), nullable=True)
    
    # Scheduling
    scheduled_at = Column(DateTime, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    
    # Status
    is_sent = Column(Boolean, default=False)
    is_acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)
    
    # Notification channels
    send_email = Column(Boolean, default=True)
    send_in_app = Column(Boolean, default=True)
    send_slack = Column(Boolean, default=False)
    send_teams = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="follow_ups")


class MeetingIntegration(Base):
    """User's connected meeting platform integrations."""
    __tablename__ = "meeting_integrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Platform details
    platform = Column(String(50), nullable=False)
    
    # OAuth tokens (encrypted in production)
    access_token = Column(Text, nullable=True)
    refresh_token = Column(Text, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    
    # Platform-specific data
    platform_user_id = Column(String(255), nullable=True)
    platform_email = Column(String(255), nullable=True)
    webhook_url = Column(String(500), nullable=True)
    
    # Settings
    auto_transcribe = Column(Boolean, default=True)
    auto_analyze = Column(Boolean, default=True)
    sync_calendar = Column(Boolean, default=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    last_synced_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MeetingTemplate(Base):
    """Templates for recurring meeting types."""
    __tablename__ = "meeting_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Template details
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    meeting_type = Column(String(100), nullable=True)  # standup, board, review, etc.
    
    # Default settings
    default_duration_minutes = Column(Integer, default=60)
    default_participants = Column(JSON, nullable=True)
    
    # AI analysis settings
    extract_action_items = Column(Boolean, default=True)
    generate_summary = Column(Boolean, default=True)
    identify_decisions = Column(Boolean, default=True)
    track_topics = Column(Boolean, default=True)
    
    # Follow-up settings
    auto_create_follow_ups = Column(Boolean, default=True)
    follow_up_delay_hours = Column(Integer, default=24)
    
    # Agenda template
    agenda_template = Column(JSON, nullable=True)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

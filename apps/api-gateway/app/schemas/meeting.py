"""Pydantic schemas for AI Meeting Assistant module."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


class MeetingPlatformEnum(str, Enum):
    ZOOM = "zoom"
    GOOGLE_MEET = "google_meet"
    MICROSOFT_TEAMS = "microsoft_teams"
    MANUAL_UPLOAD = "manual_upload"
    OTHER = "other"


class MeetingStatusEnum(str, Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PROCESSING = "processing"
    TRANSCRIBED = "transcribed"
    ANALYZED = "analyzed"
    FAILED = "failed"


class ActionItemStatusEnum(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class ActionItemPriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# ============ Meeting Schemas ============

class ParticipantInfo(BaseModel):
    name: str
    email: Optional[str] = None
    role: Optional[str] = None
    speaking_time_seconds: Optional[int] = None


class TranscriptSegment(BaseModel):
    start_time: float
    end_time: float
    speaker: Optional[str] = None
    text: str
    confidence: Optional[float] = None


class TopicInfo(BaseModel):
    topic: str
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    summary: Optional[str] = None


class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    platform: MeetingPlatformEnum = MeetingPlatformEnum.MANUAL_UPLOAD
    external_meeting_id: Optional[str] = None
    meeting_url: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    participants: Optional[List[ParticipantInfo]] = None
    tags: Optional[List[str]] = None


class MeetingUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    participants: Optional[List[ParticipantInfo]] = None
    tags: Optional[List[str]] = None
    status: Optional[MeetingStatusEnum] = None


class MeetingResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    platform: str
    external_meeting_id: Optional[str] = None
    meeting_url: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: str
    has_transcript: bool = False
    has_summary: bool = False
    participants: Optional[List[ParticipantInfo]] = None
    tags: Optional[List[str]] = None
    action_items_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MeetingDetailResponse(MeetingResponse):
    transcript: Optional[str] = None
    transcript_segments: Optional[List[TranscriptSegment]] = None
    transcription_confidence: Optional[float] = None
    summary: Optional[str] = None
    key_points: Optional[List[str]] = None
    decisions: Optional[List[str]] = None
    topics: Optional[List[TopicInfo]] = None
    sentiment_analysis: Optional[Dict[str, Any]] = None


class MeetingListResponse(BaseModel):
    meetings: List[MeetingResponse]
    total: int
    page: int
    page_size: int


# ============ Transcription Schemas ============

class TranscriptionRequest(BaseModel):
    meeting_id: str
    audio_url: Optional[str] = None
    video_url: Optional[str] = None
    language: str = "en"


class TranscriptionResponse(BaseModel):
    meeting_id: str
    status: str
    transcript: Optional[str] = None
    segments: Optional[List[TranscriptSegment]] = None
    confidence: Optional[float] = None
    duration_seconds: Optional[float] = None


# ============ AI Analysis Schemas ============

class AnalysisRequest(BaseModel):
    meeting_id: str
    extract_action_items: bool = True
    generate_summary: bool = True
    identify_decisions: bool = True
    track_topics: bool = True
    analyze_sentiment: bool = False


class MeetingSummary(BaseModel):
    executive_summary: str
    key_points: List[str]
    decisions: List[str]
    topics: List[TopicInfo]
    sentiment: Optional[Dict[str, Any]] = None
    action_items_extracted: int = 0


class AnalysisResponse(BaseModel):
    meeting_id: str
    status: str
    summary: Optional[MeetingSummary] = None
    action_items: Optional[List["ActionItemResponse"]] = None


# ============ Action Item Schemas ============

class ActionItemCreate(BaseModel):
    meeting_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    assignee_name: Optional[str] = None
    assignee_email: Optional[EmailStr] = None
    due_date: Optional[datetime] = None
    priority: ActionItemPriorityEnum = ActionItemPriorityEnum.MEDIUM
    context: Optional[str] = None


class ActionItemUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    assignee_name: Optional[str] = None
    assignee_email: Optional[EmailStr] = None
    due_date: Optional[datetime] = None
    status: Optional[ActionItemStatusEnum] = None
    priority: Optional[ActionItemPriorityEnum] = None


class ActionItemResponse(BaseModel):
    id: str
    meeting_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    assignee_id: Optional[str] = None
    assignee_name: Optional[str] = None
    assignee_email: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: str
    priority: str
    context: Optional[str] = None
    timestamp_in_meeting: Optional[int] = None
    ai_extracted: bool = False
    confidence_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ActionItemListResponse(BaseModel):
    action_items: List[ActionItemResponse]
    total: int
    pending_count: int
    overdue_count: int


# ============ Follow-up Schemas ============

class FollowUpCreate(BaseModel):
    meeting_id: str
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    follow_up_type: str = "reminder"
    recipient_id: Optional[str] = None
    recipient_email: Optional[EmailStr] = None
    scheduled_at: datetime
    send_email: bool = True
    send_in_app: bool = True
    send_slack: bool = False
    send_teams: bool = False


class FollowUpResponse(BaseModel):
    id: str
    meeting_id: str
    title: str
    description: Optional[str] = None
    follow_up_type: str
    recipient_id: Optional[str] = None
    recipient_email: Optional[str] = None
    scheduled_at: datetime
    sent_at: Optional[datetime] = None
    is_sent: bool
    is_acknowledged: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Integration Schemas ============

class IntegrationConnect(BaseModel):
    platform: MeetingPlatformEnum
    authorization_code: Optional[str] = None
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    auto_transcribe: bool = True
    auto_analyze: bool = True
    sync_calendar: bool = True


class IntegrationResponse(BaseModel):
    id: str
    platform: str
    platform_email: Optional[str] = None
    is_active: bool
    auto_transcribe: bool
    auto_analyze: bool
    sync_calendar: bool
    last_synced_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class IntegrationListResponse(BaseModel):
    integrations: List[IntegrationResponse]


# ============ Template Schemas ============

class MeetingTemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    meeting_type: Optional[str] = None
    default_duration_minutes: int = 60
    default_participants: Optional[List[ParticipantInfo]] = None
    extract_action_items: bool = True
    generate_summary: bool = True
    identify_decisions: bool = True
    track_topics: bool = True
    auto_create_follow_ups: bool = True
    follow_up_delay_hours: int = 24
    agenda_template: Optional[List[Dict[str, Any]]] = None


class MeetingTemplateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    meeting_type: Optional[str] = None
    default_duration_minutes: int
    default_participants: Optional[List[ParticipantInfo]] = None
    extract_action_items: bool
    generate_summary: bool
    identify_decisions: bool
    track_topics: bool
    auto_create_follow_ups: bool
    follow_up_delay_hours: int
    agenda_template: Optional[List[Dict[str, Any]]] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Dashboard Schemas ============

class MeetingDashboardStats(BaseModel):
    total_meetings: int
    meetings_this_week: int
    meetings_this_month: int
    total_action_items: int
    pending_action_items: int
    overdue_action_items: int
    completed_action_items: int
    average_meeting_duration: Optional[float] = None
    total_meeting_hours: float
    upcoming_meetings: List[MeetingResponse]
    recent_action_items: List[ActionItemResponse]


# Update forward references
AnalysisResponse.model_rebuild()

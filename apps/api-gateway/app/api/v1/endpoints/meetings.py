"""API endpoints for AI Meeting Assistant module."""
import os
import uuid
import tempfile
from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas.meeting import (
    MeetingCreate, MeetingUpdate, MeetingResponse, MeetingDetailResponse, MeetingListResponse,
    TranscriptionRequest, TranscriptionResponse,
    AnalysisRequest, AnalysisResponse, MeetingSummary,
    ActionItemCreate, ActionItemUpdate, ActionItemResponse, ActionItemListResponse,
    FollowUpCreate, FollowUpResponse,
    IntegrationConnect, IntegrationResponse, IntegrationListResponse,
    MeetingTemplateCreate, MeetingTemplateResponse,
    MeetingDashboardStats, MeetingStatusEnum, ActionItemStatusEnum
)
from app.services.meeting_transcription_service import transcribe_meeting
from app.services.meeting_ai_service import analyze_meeting_transcript, meeting_ai_service
from app.services.meeting_integrations_service import meeting_integrations_service
from app.services.meeting_reminder_service import meeting_reminder_service

router = APIRouter()

# In-memory storage for demo (replace with database in production)
meetings_db = {}
action_items_db = {}
follow_ups_db = {}
integrations_db = {}
templates_db = {}


# ============ Meeting Endpoints ============

@router.get("/dashboard", response_model=MeetingDashboardStats)
async def get_meeting_dashboard(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get meeting dashboard statistics."""
    user_id = current_user["id"]
    now = datetime.utcnow()
    
    # Filter meetings for current user's organization
    user_meetings = [m for m in meetings_db.values() if m.get("created_by_id") == user_id]
    user_action_items = [a for a in action_items_db.values() if a.get("organization_id") == current_user.get("organization_id")]
    
    # Calculate stats
    meetings_this_week = [m for m in user_meetings if m.get("created_at") and (now - datetime.fromisoformat(m["created_at"])).days < 7]
    meetings_this_month = [m for m in user_meetings if m.get("created_at") and (now - datetime.fromisoformat(m["created_at"])).days < 30]
    
    pending_items = [a for a in user_action_items if a.get("status") == "pending"]
    overdue_items = [a for a in pending_items if a.get("due_date") and datetime.fromisoformat(a["due_date"]) < now]
    completed_items = [a for a in user_action_items if a.get("status") == "completed"]
    
    # Calculate total meeting hours
    total_minutes = sum(m.get("duration_minutes", 0) or 0 for m in user_meetings)
    
    # Get upcoming meetings
    upcoming = [m for m in user_meetings if m.get("scheduled_start") and datetime.fromisoformat(m["scheduled_start"]) > now]
    upcoming.sort(key=lambda x: x.get("scheduled_start", ""))
    
    return MeetingDashboardStats(
        total_meetings=len(user_meetings),
        meetings_this_week=len(meetings_this_week),
        meetings_this_month=len(meetings_this_month),
        total_action_items=len(user_action_items),
        pending_action_items=len(pending_items),
        overdue_action_items=len(overdue_items),
        completed_action_items=len(completed_items),
        average_meeting_duration=total_minutes / len(user_meetings) if user_meetings else None,
        total_meeting_hours=total_minutes / 60,
        upcoming_meetings=[MeetingResponse(**m, has_transcript=bool(m.get("transcript")), has_summary=bool(m.get("summary")), action_items_count=len([a for a in action_items_db.values() if a.get("meeting_id") == m["id"]])) for m in upcoming[:5]],
        recent_action_items=[ActionItemResponse(**a) for a in sorted(user_action_items, key=lambda x: x.get("created_at", ""), reverse=True)[:5]]
    )


@router.post("", response_model=MeetingResponse)
async def create_meeting(
    meeting: MeetingCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new meeting."""
    meeting_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    meeting_data = {
        "id": meeting_id,
        "organization_id": current_user.get("organization_id", str(uuid.uuid4())),
        "created_by_id": current_user["id"],
        "title": meeting.title,
        "description": meeting.description,
        "platform": meeting.platform.value,
        "external_meeting_id": meeting.external_meeting_id,
        "meeting_url": meeting.meeting_url,
        "scheduled_start": meeting.scheduled_start.isoformat() if meeting.scheduled_start else None,
        "scheduled_end": meeting.scheduled_end.isoformat() if meeting.scheduled_end else None,
        "status": MeetingStatusEnum.SCHEDULED.value,
        "participants": [p.model_dump() for p in meeting.participants] if meeting.participants else [],
        "tags": meeting.tags,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    
    meetings_db[meeting_id] = meeting_data
    
    return MeetingResponse(
        **meeting_data,
        has_transcript=False,
        has_summary=False,
        action_items_count=0
    )


@router.get("", response_model=MeetingListResponse)
async def list_meetings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    platform: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all meetings for the current user's organization."""
    user_id = current_user["id"]
    
    # Filter meetings
    filtered = [m for m in meetings_db.values() if m.get("created_by_id") == user_id]
    
    if status:
        filtered = [m for m in filtered if m.get("status") == status]
    if platform:
        filtered = [m for m in filtered if m.get("platform") == platform]
    
    # Sort by created_at descending
    filtered.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    # Paginate
    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]
    
    return MeetingListResponse(
        meetings=[MeetingResponse(
            **m,
            has_transcript=bool(m.get("transcript")),
            has_summary=bool(m.get("summary")),
            action_items_count=len([a for a in action_items_db.values() if a.get("meeting_id") == m["id"]])
        ) for m in paginated],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{meeting_id}", response_model=MeetingDetailResponse)
async def get_meeting(
    meeting_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get meeting details including transcript and analysis."""
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    return MeetingDetailResponse(
        **meeting,
        has_transcript=bool(meeting.get("transcript")),
        has_summary=bool(meeting.get("summary")),
        action_items_count=len([a for a in action_items_db.values() if a.get("meeting_id") == meeting_id])
    )


@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    meeting_update: MeetingUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update meeting details."""
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    update_data = meeting_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            if key == "status":
                meeting[key] = value.value
            elif key == "participants":
                meeting[key] = [p.model_dump() for p in value]
            elif isinstance(value, datetime):
                meeting[key] = value.isoformat()
            else:
                meeting[key] = value
    
    meeting["updated_at"] = datetime.utcnow().isoformat()
    
    return MeetingResponse(
        **meeting,
        has_transcript=bool(meeting.get("transcript")),
        has_summary=bool(meeting.get("summary")),
        action_items_count=len([a for a in action_items_db.values() if a.get("meeting_id") == meeting_id])
    )


@router.delete("/{meeting_id}")
async def delete_meeting(
    meeting_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a meeting."""
    if meeting_id not in meetings_db:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    del meetings_db[meeting_id]
    
    # Delete associated action items
    for action_id in list(action_items_db.keys()):
        if action_items_db[action_id].get("meeting_id") == meeting_id:
            del action_items_db[action_id]
    
    return {"message": "Meeting deleted successfully"}


# ============ Transcription Endpoints ============

@router.post("/{meeting_id}/upload", response_model=MeetingResponse)
async def upload_meeting_recording(
    meeting_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a meeting recording for transcription."""
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    # Save uploaded file
    file_ext = os.path.splitext(file.filename)[1] if file.filename else ".mp3"
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
    content = await file.read()
    temp_file.write(content)
    temp_file.close()
    
    # Update meeting status
    meeting["status"] = MeetingStatusEnum.PROCESSING.value
    meeting["updated_at"] = datetime.utcnow().isoformat()
    
    # Add background task for transcription
    background_tasks.add_task(
        process_meeting_recording,
        meeting_id,
        temp_file.name,
        current_user
    )
    
    return MeetingResponse(
        **meeting,
        has_transcript=bool(meeting.get("transcript")),
        has_summary=bool(meeting.get("summary")),
        action_items_count=len([a for a in action_items_db.values() if a.get("meeting_id") == meeting_id])
    )


async def process_meeting_recording(meeting_id: str, file_path: str, user: dict):
    """Background task to transcribe and analyze meeting recording."""
    try:
        meeting = meetings_db.get(meeting_id)
        if not meeting:
            return
        
        # Transcribe
        transcription_result = await transcribe_meeting(
            file_path=file_path,
            language="en",
            include_timestamps=True,
            identify_speakers=True
        )
        
        meeting["transcript"] = transcription_result.get("transcript", "")
        meeting["transcript_segments"] = transcription_result.get("segments", [])
        meeting["transcription_confidence"] = transcription_result.get("confidence")
        meeting["duration_minutes"] = int(transcription_result.get("duration", 0) / 60) if transcription_result.get("duration") else None
        meeting["status"] = MeetingStatusEnum.TRANSCRIBED.value
        
        # Analyze
        analysis_result = await analyze_meeting_transcript(
            meeting["transcript"],
            generate_summary=True,
            extract_action_items=True,
            identify_decisions=True,
            track_topics=True
        )
        
        meeting["summary"] = analysis_result.get("executive_summary", "")
        meeting["key_points"] = analysis_result.get("key_points", [])
        meeting["decisions"] = analysis_result.get("decisions", [])
        meeting["topics"] = analysis_result.get("topics", [])
        meeting["status"] = MeetingStatusEnum.ANALYZED.value
        
        # Create action items
        for item in analysis_result.get("action_items", []):
            action_id = str(uuid.uuid4())
            action_items_db[action_id] = {
                "id": action_id,
                "meeting_id": meeting_id,
                "organization_id": meeting.get("organization_id"),
                **item,
                "status": ActionItemStatusEnum.PENDING.value,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
        
        meeting["updated_at"] = datetime.utcnow().isoformat()
        
    except Exception as e:
        print(f"Error processing meeting: {e}")
        if meeting_id in meetings_db:
            meetings_db[meeting_id]["status"] = MeetingStatusEnum.FAILED.value
    finally:
        # Clean up temp file
        try:
            os.remove(file_path)
        except:
            pass


@router.post("/{meeting_id}/transcribe", response_model=TranscriptionResponse)
async def transcribe_meeting_endpoint(
    meeting_id: str,
    request: TranscriptionRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Transcribe a meeting from URL."""
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    url = request.audio_url or request.video_url
    if not url:
        raise HTTPException(status_code=400, detail="Audio or video URL required")
    
    meeting["status"] = MeetingStatusEnum.PROCESSING.value
    
    # Process in background
    background_tasks.add_task(
        process_meeting_from_url,
        meeting_id,
        url,
        request.language
    )
    
    return TranscriptionResponse(
        meeting_id=meeting_id,
        status="processing"
    )


async def process_meeting_from_url(meeting_id: str, url: str, language: str):
    """Background task to transcribe meeting from URL."""
    try:
        meeting = meetings_db.get(meeting_id)
        if not meeting:
            return
        
        result = await transcribe_meeting(url=url, language=language)
        
        meeting["transcript"] = result.get("transcript", "")
        meeting["transcript_segments"] = result.get("segments", [])
        meeting["transcription_confidence"] = result.get("confidence")
        meeting["status"] = MeetingStatusEnum.TRANSCRIBED.value
        meeting["updated_at"] = datetime.utcnow().isoformat()
        
    except Exception as e:
        print(f"Error transcribing meeting: {e}")
        if meeting_id in meetings_db:
            meetings_db[meeting_id]["status"] = MeetingStatusEnum.FAILED.value


# ============ Analysis Endpoints ============

@router.post("/{meeting_id}/analyze", response_model=AnalysisResponse)
async def analyze_meeting_endpoint(
    meeting_id: str,
    request: AnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Analyze a meeting transcript."""
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if not meeting.get("transcript"):
        raise HTTPException(status_code=400, detail="Meeting has no transcript")
    
    # Analyze
    result = await analyze_meeting_transcript(
        meeting["transcript"],
        generate_summary=request.generate_summary,
        extract_action_items=request.extract_action_items,
        identify_decisions=request.identify_decisions,
        track_topics=request.track_topics,
        analyze_sentiment=request.analyze_sentiment
    )
    
    # Update meeting
    if request.generate_summary:
        meeting["summary"] = result.get("executive_summary", "")
        meeting["key_points"] = result.get("key_points", [])
    if request.identify_decisions:
        meeting["decisions"] = result.get("decisions", [])
    if request.track_topics:
        meeting["topics"] = result.get("topics", [])
    if request.analyze_sentiment:
        meeting["sentiment_analysis"] = result.get("sentiment_analysis")
    
    meeting["status"] = MeetingStatusEnum.ANALYZED.value
    meeting["updated_at"] = datetime.utcnow().isoformat()
    
    # Create action items
    action_items = []
    if request.extract_action_items:
        for item in result.get("action_items", []):
            action_id = str(uuid.uuid4())
            action_data = {
                "id": action_id,
                "meeting_id": meeting_id,
                "organization_id": meeting.get("organization_id"),
                **item,
                "status": ActionItemStatusEnum.PENDING.value,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
            action_items_db[action_id] = action_data
            action_items.append(ActionItemResponse(**action_data))
    
    return AnalysisResponse(
        meeting_id=meeting_id,
        status="completed",
        summary=MeetingSummary(
            executive_summary=result.get("executive_summary", ""),
            key_points=result.get("key_points", []),
            decisions=result.get("decisions", []),
            topics=result.get("topics", []),
            sentiment=result.get("sentiment_analysis"),
            action_items_extracted=len(action_items)
        ),
        action_items=action_items
    )


# ============ Action Item Endpoints ============

@router.get("/action-items", response_model=ActionItemListResponse)
async def list_action_items(
    meeting_id: Optional[str] = None,
    status: Optional[str] = None,
    assignee_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List action items."""
    items = list(action_items_db.values())
    
    if meeting_id:
        items = [i for i in items if i.get("meeting_id") == meeting_id]
    if status:
        items = [i for i in items if i.get("status") == status]
    if assignee_id:
        items = [i for i in items if i.get("assignee_id") == assignee_id]
    
    now = datetime.utcnow()
    pending = [i for i in items if i.get("status") == "pending"]
    overdue = [i for i in pending if i.get("due_date") and datetime.fromisoformat(i["due_date"]) < now]
    
    return ActionItemListResponse(
        action_items=[ActionItemResponse(**i) for i in items],
        total=len(items),
        pending_count=len(pending),
        overdue_count=len(overdue)
    )


@router.post("/action-items", response_model=ActionItemResponse)
async def create_action_item(
    item: ActionItemCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new action item."""
    action_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    action_data = {
        "id": action_id,
        "meeting_id": item.meeting_id,
        "organization_id": current_user.get("organization_id"),
        "title": item.title,
        "description": item.description,
        "assignee_id": item.assignee_id,
        "assignee_name": item.assignee_name,
        "assignee_email": item.assignee_email,
        "due_date": item.due_date.isoformat() if item.due_date else None,
        "status": ActionItemStatusEnum.PENDING.value,
        "priority": item.priority.value,
        "context": item.context,
        "ai_extracted": False,
        "confidence_score": None,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }
    
    action_items_db[action_id] = action_data
    
    return ActionItemResponse(**action_data)


@router.put("/action-items/{item_id}", response_model=ActionItemResponse)
async def update_action_item(
    item_id: str,
    item_update: ActionItemUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an action item."""
    item = action_items_db.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            if key in ["status", "priority"]:
                item[key] = value.value
            elif isinstance(value, datetime):
                item[key] = value.isoformat()
            else:
                item[key] = value
    
    if item_update.status == ActionItemStatusEnum.COMPLETED:
        item["completed_at"] = datetime.utcnow().isoformat()
    
    item["updated_at"] = datetime.utcnow().isoformat()
    
    return ActionItemResponse(**item)


@router.delete("/action-items/{item_id}")
async def delete_action_item(
    item_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete an action item."""
    if item_id not in action_items_db:
        raise HTTPException(status_code=404, detail="Action item not found")
    
    del action_items_db[item_id]
    return {"message": "Action item deleted"}


# ============ Integration Endpoints ============

@router.get("/integrations", response_model=IntegrationListResponse)
async def list_integrations(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List connected meeting platform integrations."""
    user_integrations = [
        i for i in integrations_db.values()
        if i.get("user_id") == current_user["id"]
    ]
    return IntegrationListResponse(
        integrations=[IntegrationResponse(**i) for i in user_integrations]
    )


@router.get("/integrations/{platform}/auth-url")
async def get_integration_auth_url(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """Get OAuth authorization URL for a platform."""
    auth_url = meeting_integrations_service.get_authorization_url(
        platform,
        state=current_user["id"]
    )
    if not auth_url:
        raise HTTPException(status_code=400, detail=f"Unsupported platform: {platform}")
    
    return {"auth_url": auth_url}


@router.post("/integrations/connect", response_model=IntegrationResponse)
async def connect_integration(
    connection: IntegrationConnect,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Connect a meeting platform integration."""
    try:
        result = await meeting_integrations_service.connect_platform(
            connection.platform.value,
            connection.authorization_code
        )
        
        integration_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        integration_data = {
            "id": integration_id,
            "user_id": current_user["id"],
            "organization_id": current_user.get("organization_id"),
            "platform": connection.platform.value,
            "platform_email": result["user_info"].get("email"),
            "platform_user_id": result["user_info"].get("id"),
            "access_token": result["tokens"]["access_token"],
            "refresh_token": result["tokens"].get("refresh_token"),
            "is_active": True,
            "auto_transcribe": connection.auto_transcribe,
            "auto_analyze": connection.auto_analyze,
            "sync_calendar": connection.sync_calendar,
            "created_at": now.isoformat(),
        }
        
        integrations_db[integration_id] = integration_data
        
        return IntegrationResponse(**integration_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/integrations/{integration_id}")
async def disconnect_integration(
    integration_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Disconnect a meeting platform integration."""
    if integration_id not in integrations_db:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    del integrations_db[integration_id]
    return {"message": "Integration disconnected"}


@router.post("/integrations/{integration_id}/sync")
async def sync_integration_meetings(
    integration_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Sync meetings from a connected platform."""
    integration = integrations_db.get(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")
    
    try:
        meetings = await meeting_integrations_service.sync_meetings(
            integration["platform"],
            integration["access_token"]
        )
        
        # Create meetings in our system
        created_count = 0
        for meeting_data in meetings:
            # Check if meeting already exists
            existing = next(
                (m for m in meetings_db.values() 
                 if m.get("external_meeting_id") == meeting_data["id"]),
                None
            )
            
            if not existing:
                meeting_id = str(uuid.uuid4())
                now = datetime.utcnow()
                
                meetings_db[meeting_id] = {
                    "id": meeting_id,
                    "organization_id": current_user.get("organization_id"),
                    "created_by_id": current_user["id"],
                    "title": meeting_data.get("title", "Untitled Meeting"),
                    "platform": meeting_data.get("platform"),
                    "external_meeting_id": meeting_data.get("id"),
                    "meeting_url": meeting_data.get("join_url"),
                    "scheduled_start": meeting_data.get("start_time"),
                    "scheduled_end": meeting_data.get("end_time"),
                    "status": MeetingStatusEnum.SCHEDULED.value,
                    "participants": meeting_data.get("attendees", []),
                    "created_at": now.isoformat(),
                    "updated_at": now.isoformat(),
                }
                created_count += 1
        
        integration["last_synced_at"] = datetime.utcnow().isoformat()
        
        return {
            "message": f"Synced {len(meetings)} meetings, created {created_count} new"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============ Notification Endpoints ============

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Get in-app notifications for the current user."""
    notifications = meeting_reminder_service.get_in_app_notifications(
        current_user["id"],
        unread_only
    )
    return {"notifications": notifications}


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read."""
    success = meeting_reminder_service.mark_notification_read(
        current_user["id"],
        notification_id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}


@router.post("/{meeting_id}/send-summary")
async def send_meeting_summary_email(
    meeting_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send meeting summary email to participants."""
    meeting = meetings_db.get(meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if not meeting.get("summary"):
        raise HTTPException(status_code=400, detail="Meeting has no summary")
    
    # Get action items for this meeting
    action_items = [
        a for a in action_items_db.values()
        if a.get("meeting_id") == meeting_id
    ]
    
    # Get participants
    participants = meeting.get("participants", [])
    if not participants:
        participants = [{"email": current_user.get("email"), "id": current_user["id"]}]
    
    results = await meeting_reminder_service.send_meeting_summary(
        meeting,
        meeting["summary"],
        action_items,
        participants
    )
    
    return {"message": "Summary sent", "results": results}

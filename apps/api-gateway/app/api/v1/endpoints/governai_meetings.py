"""
GovernAI API Endpoints - Board Meetings
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.core.security import get_current_user
from app.services.governai.meeting_service import (
    MeetingService, BoardMemberService, DocumentService, ResolutionService
)
from app.schemas.governai import (
    BoardMeetingCreate, BoardMeetingUpdate, BoardMeetingResponse,
    BoardMemberCreate, BoardMemberUpdate, BoardMemberResponse,
    BoardDocumentCreate, BoardDocumentResponse,
    ResolutionCreate, ResolutionVoteCreate, ResolutionResponse,
    AgendaItemCreate, AgendaItemResponse
)

router = APIRouter()


# ============ BOARD MEETINGS ============

@router.get("/meetings", response_model=List[dict])
async def list_meetings(
    status: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all board meetings"""
    service = MeetingService(db)
    meetings = await service.list_meetings(
        organization_id=current_user.get("organization_id", "demo-org"),
        status=status,
        from_date=from_date,
        to_date=to_date,
        limit=limit
    )
    return meetings


@router.post("/meetings", response_model=dict)
async def create_meeting(
    meeting: BoardMeetingCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new board meeting"""
    service = MeetingService(db)
    result = await service.create_meeting(
        organization_id=current_user.get("organization_id", "demo-org"),
        title=meeting.title,
        scheduled_date=meeting.scheduled_date,
        meeting_type=meeting.meeting_type.value if meeting.meeting_type else "board",
        scheduled_end_date=meeting.scheduled_end_date,
        timezone=meeting.timezone,
        location=meeting.location,
        virtual_link=meeting.virtual_link,
        is_virtual=meeting.is_virtual,
        description=meeting.description,
        objectives=meeting.objectives,
        agenda_items=[item.dict() for item in meeting.agenda_items] if meeting.agenda_items else []
    )
    return result


@router.get("/meetings/{meeting_id}", response_model=dict)
async def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific meeting"""
    service = MeetingService(db)
    meeting = await service.get_meeting(meeting_id)
    if not meeting:
        # Return demo meeting
        return {
            "id": meeting_id,
            "title": "Q4 2024 Board Meeting",
            "meeting_type": "board",
            "status": "scheduled",
            "scheduled_date": datetime.utcnow().isoformat(),
            "location": "Conference Room A",
            "is_virtual": True,
            "virtual_link": "https://zoom.us/j/123456789",
            "description": "Quarterly board meeting to review Q4 performance and 2025 strategy",
            "objectives": [
                "Review Q4 financial results",
                "Approve 2025 budget",
                "Discuss strategic initiatives"
            ],
            "agenda_items": [
                {"id": "1", "order": 1, "title": "Call to Order", "duration_minutes": 5},
                {"id": "2", "order": 2, "title": "Q4 Financial Review", "duration_minutes": 30},
                {"id": "3", "order": 3, "title": "2025 Budget Approval", "duration_minutes": 45},
                {"id": "4", "order": 4, "title": "Strategic Initiatives", "duration_minutes": 30},
                {"id": "5", "order": 5, "title": "New Business", "duration_minutes": 15},
                {"id": "6", "order": 6, "title": "Adjournment", "duration_minutes": 5}
            ]
        }
    return meeting


@router.put("/meetings/{meeting_id}", response_model=dict)
async def update_meeting(
    meeting_id: str,
    meeting: BoardMeetingUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a meeting"""
    service = MeetingService(db)
    result = await service.update_meeting(meeting_id, **meeting.dict(exclude_unset=True))
    return result


@router.post("/meetings/{meeting_id}/agenda-items", response_model=dict)
async def add_agenda_item(
    meeting_id: str,
    item: AgendaItemCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add an agenda item to a meeting"""
    service = MeetingService(db)
    result = await service.add_agenda_item(
        meeting_id=meeting_id,
        title=item.title,
        order=item.order,
        description=item.description,
        duration_minutes=item.duration_minutes,
        presenter_name=item.presenter_name
    )
    return result


@router.get("/meetings/stats/summary", response_model=dict)
async def get_meeting_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get meeting statistics"""
    service = MeetingService(db)
    return await service.get_meeting_stats(
        organization_id=current_user.get("organization_id", "demo-org")
    )


# ============ BOARD MEMBERS ============

@router.get("/members", response_model=List[dict])
async def list_members(
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all board members"""
    service = BoardMemberService(db)
    return await service.list_members(
        organization_id=current_user.get("organization_id", "demo-org"),
        active_only=active_only
    )


@router.post("/members", response_model=dict)
async def create_member(
    member: BoardMemberCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new board member"""
    service = BoardMemberService(db)
    return await service.create_member(
        organization_id=current_user.get("organization_id", "demo-org"),
        **member.dict()
    )


@router.put("/members/{member_id}", response_model=dict)
async def update_member(
    member_id: str,
    member: BoardMemberUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a board member"""
    service = BoardMemberService(db)
    return await service.update_member(member_id, **member.dict(exclude_unset=True))


# ============ DOCUMENTS ============

@router.get("/documents", response_model=List[dict])
async def list_documents(
    meeting_id: Optional[str] = None,
    document_type: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all board documents"""
    service = DocumentService(db)
    return await service.list_documents(
        organization_id=current_user.get("organization_id", "demo-org"),
        meeting_id=meeting_id,
        document_type=document_type,
        limit=limit
    )


@router.post("/documents", response_model=dict)
async def create_document(
    document: BoardDocumentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new document"""
    service = DocumentService(db)
    return await service.create_document(
        organization_id=current_user.get("organization_id", "demo-org"),
        **document.dict()
    )


# ============ RESOLUTIONS ============

@router.get("/resolutions", response_model=List[dict])
async def list_resolutions(
    status: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all resolutions"""
    service = ResolutionService(db)
    return await service.list_resolutions(
        organization_id=current_user.get("organization_id", "demo-org"),
        status=status,
        limit=limit
    )


@router.post("/resolutions", response_model=dict)
async def create_resolution(
    resolution: ResolutionCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new resolution"""
    service = ResolutionService(db)
    return await service.create_resolution(
        organization_id=current_user.get("organization_id", "demo-org"),
        **resolution.dict()
    )


@router.post("/resolutions/{resolution_id}/vote", response_model=dict)
async def cast_vote(
    resolution_id: str,
    vote: ResolutionVoteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Cast a vote on a resolution"""
    service = ResolutionService(db)
    return await service.cast_vote(
        resolution_id=resolution_id,
        member_id=current_user.get("id", "demo-member"),
        vote=vote.vote,
        comments=vote.comments
    )


@router.get("/resolutions/stats/summary", response_model=dict)
async def get_resolution_stats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get resolution statistics"""
    service = ResolutionService(db)
    return await service.get_resolution_stats(
        organization_id=current_user.get("organization_id", "demo-org")
    )

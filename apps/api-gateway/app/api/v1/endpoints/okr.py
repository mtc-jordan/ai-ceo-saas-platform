"""
Goal Tracking & OKRs API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.services.okr_service import okr_service

router = APIRouter()


# Pydantic models for request/response
class KeyResultCreate(BaseModel):
    title: str
    description: Optional[str] = None
    result_type: str = "percentage"
    start_value: float = 0
    target_value: float
    unit: Optional[str] = None
    weight: float = 1.0
    owner_id: Optional[int] = None


class GoalCreate(BaseModel):
    title: str
    description: Optional[str] = None
    level: str = "team"
    owner_id: int
    parent_goal_id: Optional[int] = None
    start_date: datetime
    end_date: datetime
    tags: List[str] = []
    priority: int = 2
    key_results: List[KeyResultCreate] = []


class KeyResultUpdate(BaseModel):
    new_value: float
    note: Optional[str] = None


class GoalCheckIn(BaseModel):
    status: str
    confidence: float
    notes: Optional[str] = None
    blockers: Optional[str] = None
    next_steps: Optional[str] = None


# Dashboard endpoints
@router.get("/dashboard")
async def get_okr_dashboard(
    cycle_id: Optional[int] = None
):
    """Get OKR dashboard overview"""
    return await okr_service.get_goals_dashboard(organization_id=1, cycle_id=cycle_id)


@router.get("/alignment")
async def get_goal_alignment():
    """Get goal alignment tree for visualization"""
    return await okr_service.get_goal_alignment_tree(organization_id=1)


@router.get("/my-goals")
async def get_my_goals():
    """Get goals for current user"""
    return await okr_service.get_my_goals(user_id=1)


# Goal CRUD endpoints
@router.get("/goals")
async def list_goals(
    level: Optional[str] = None,
    status: Optional[str] = None,
    owner_id: Optional[int] = None,
    cycle_id: Optional[int] = None
):
    """List all goals with optional filters"""
    # Mock response
    goals = [
        {
            "id": 1,
            "title": "Achieve $2M ARR",
            "level": "company",
            "status": "on_track",
            "progress": 85,
            "owner": {"id": 1, "name": "John Smith"},
            "key_results_count": 4,
            "due_date": "2024-12-31"
        },
        {
            "id": 2,
            "title": "Expand to 3 New Markets",
            "level": "company",
            "status": "on_track",
            "progress": 66,
            "owner": {"id": 1, "name": "John Smith"},
            "key_results_count": 3,
            "due_date": "2024-12-31"
        },
        {
            "id": 3,
            "title": "Achieve 95% Customer Satisfaction",
            "level": "company",
            "status": "on_track",
            "progress": 78,
            "owner": {"id": 4, "name": "Lisa Wang"},
            "key_results_count": 3,
            "due_date": "2024-12-31"
        }
    ]
    
    if level:
        goals = [g for g in goals if g["level"] == level]
    if status:
        goals = [g for g in goals if g["status"] == status]
    
    return {"goals": goals, "total": len(goals)}


@router.post("/goals")
async def create_goal(goal: GoalCreate):
    """Create a new goal"""
    return await okr_service.create_goal(goal.dict())


@router.get("/goals/{goal_id}")
async def get_goal(goal_id: int):
    """Get detailed goal information"""
    return await okr_service.get_goal_details(goal_id)


@router.put("/goals/{goal_id}")
async def update_goal(goal_id: int, goal: GoalCreate):
    """Update a goal"""
    return {"id": goal_id, "message": "Goal updated successfully", **goal.dict()}


@router.delete("/goals/{goal_id}")
async def delete_goal(goal_id: int):
    """Delete a goal"""
    return {"id": goal_id, "message": "Goal deleted successfully"}


# Key Result endpoints
@router.put("/key-results/{key_result_id}")
async def update_key_result(key_result_id: int, update: KeyResultUpdate):
    """Update a key result's progress"""
    return await okr_service.update_key_result(
        key_result_id, 
        update.new_value, 
        update.note
    )


@router.get("/goals/{goal_id}/progress-history")
async def get_goal_progress_history(goal_id: int):
    """Get historical progress data for a goal"""
    return await okr_service.get_progress_history(goal_id)


# Check-in endpoints
@router.post("/goals/{goal_id}/check-in")
async def create_check_in(goal_id: int, check_in: GoalCheckIn):
    """Record a goal check-in"""
    return await okr_service.check_in_goal(goal_id, check_in.dict())


@router.get("/goals/{goal_id}/check-ins")
async def get_goal_check_ins(goal_id: int):
    """Get all check-ins for a goal"""
    goal = await okr_service.get_goal_details(goal_id)
    return {"check_ins": goal.get("check_ins", [])}


# AI recommendations
@router.get("/goals/{goal_id}/recommendations")
async def get_goal_recommendations(goal_id: int):
    """Get AI-powered recommendations for a goal"""
    return await okr_service.get_ai_recommendations(goal_id)


# Cycle management
@router.get("/cycles")
async def list_cycles():
    """List all OKR cycles"""
    return {
        "cycles": [
            {
                "id": 1,
                "name": "Q4 2024",
                "start_date": "2024-10-01",
                "end_date": "2024-12-31",
                "is_active": True,
                "goals_count": 24
            },
            {
                "id": 2,
                "name": "Q1 2025",
                "start_date": "2025-01-01",
                "end_date": "2025-03-31",
                "is_active": False,
                "goals_count": 0
            }
        ]
    }


@router.post("/cycles")
async def create_cycle(name: str, start_date: datetime, end_date: datetime):
    """Create a new OKR cycle"""
    return {
        "id": 3,
        "name": name,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "message": "Cycle created successfully"
    }

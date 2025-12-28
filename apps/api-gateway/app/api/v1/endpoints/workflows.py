"""
Workflow Automation API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from app.core.security import get_current_user

router = APIRouter()


# Pydantic models
class TriggerCreate(BaseModel):
    type: str  # schedule, event, webhook, manual, condition
    name: str
    cron_expression: Optional[str] = None
    event_source: Optional[str] = None
    event_type: Optional[str] = None
    event_filters: Optional[Dict] = None
    condition_field: Optional[str] = None
    condition_operator: Optional[str] = None
    condition_value: Optional[str] = None


class ActionCreate(BaseModel):
    type: str  # send_notification, send_email, create_task, etc.
    name: str
    order: int = 0
    config: Dict[str, Any] = {}
    condition_enabled: bool = False
    condition_field: Optional[str] = None
    condition_operator: Optional[str] = None
    condition_value: Optional[str] = None


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = "zap"
    color: Optional[str] = "#6366f1"
    triggers: Optional[List[TriggerCreate]] = []
    actions: Optional[List[ActionCreate]] = []


class WorkflowUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    triggers: Optional[List[TriggerCreate]] = None
    actions: Optional[List[ActionCreate]] = None


class ScheduledTaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    task_type: str  # reminder, report, sync
    schedule_type: str  # once, recurring
    scheduled_at: Optional[datetime] = None
    cron_expression: Optional[str] = None
    config: Dict[str, Any] = {}
    notify_on_complete: bool = True
    notify_on_failure: bool = True


class ScheduledTaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    cron_expression: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


# Workflow endpoints

@router.get("")
async def get_workflows(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get paginated workflows for the organization"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.get_workflows(
        organization_id=str(current_user.get("organization_id", "org-123")),
        page=page,
        page_size=page_size,
        status=status,
        category=category
    )


@router.get("/stats")
async def get_workflow_stats(current_user: dict = Depends(get_current_user)):
    """Get workflow statistics"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.get_workflow_stats(
        organization_id=str(current_user.get("organization_id", "org-123"))
    )


@router.get("/templates")
async def get_workflow_templates(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get workflow templates"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.get_templates(category=category)


@router.post("/from-template/{template_id}")
async def create_workflow_from_template(
    template_id: str,
    name: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Create a workflow from a template"""
    from app.services.workflow_service import workflow_service
    
    workflow = await workflow_service.create_from_template(
        template_id=template_id,
        organization_id=str(current_user.get("organization_id", "org-123")),
        user_id=str(current_user.get("id", "user-123")),
        name=name
    )
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return workflow


@router.get("/{workflow_id}")
async def get_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a single workflow"""
    from app.services.workflow_service import workflow_service
    
    workflow = await workflow_service.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return workflow


@router.post("")
async def create_workflow(
    workflow: WorkflowCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new workflow"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.create_workflow(
        organization_id=str(current_user.get("organization_id", "org-123")),
        user_id=str(current_user.get("id", "user-123")),
        name=workflow.name,
        description=workflow.description,
        category=workflow.category,
        triggers=[t.dict() for t in workflow.triggers] if workflow.triggers else [],
        actions=[a.dict() for a in workflow.actions] if workflow.actions else []
    )


@router.put("/{workflow_id}")
async def update_workflow(
    workflow_id: str,
    workflow: WorkflowUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a workflow"""
    from app.services.workflow_service import workflow_service
    
    updates = workflow.dict(exclude_none=True)
    if "triggers" in updates:
        updates["triggers"] = [t if isinstance(t, dict) else t.dict() for t in updates["triggers"]]
    if "actions" in updates:
        updates["actions"] = [a if isinstance(a, dict) else a.dict() for a in updates["actions"]]
    
    return await workflow_service.update_workflow(workflow_id, updates)


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a workflow"""
    from app.services.workflow_service import workflow_service
    
    success = await workflow_service.delete_workflow(workflow_id)
    return {"success": success}


@router.post("/{workflow_id}/activate")
async def activate_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Activate a workflow"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.activate_workflow(workflow_id)


@router.post("/{workflow_id}/pause")
async def pause_workflow(
    workflow_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Pause a workflow"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.pause_workflow(workflow_id)


@router.post("/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: str,
    input_data: Optional[Dict[str, Any]] = None,
    current_user: dict = Depends(get_current_user)
):
    """Manually execute a workflow"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.execute_workflow(
        workflow_id=workflow_id,
        triggered_by="manual",
        input_data=input_data
    )


# Execution endpoints

@router.get("/executions")
async def get_executions(
    workflow_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get workflow executions"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.get_executions(
        workflow_id=workflow_id,
        organization_id=str(current_user.get("organization_id", "org-123")),
        page=page,
        page_size=page_size,
        status=status
    )


@router.get("/executions/{execution_id}")
async def get_execution(
    execution_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a single execution"""
    from app.services.workflow_service import workflow_service
    
    execution = await workflow_service.get_execution(execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    return execution


@router.post("/executions/{execution_id}/cancel")
async def cancel_execution(
    execution_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a running execution"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.cancel_execution(execution_id)


# Scheduled Tasks endpoints

@router.get("/scheduled-tasks")
async def get_scheduled_tasks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    task_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get scheduled tasks"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.get_scheduled_tasks(
        organization_id=str(current_user.get("organization_id", "org-123")),
        page=page,
        page_size=page_size,
        task_type=task_type
    )


@router.post("/scheduled-tasks")
async def create_scheduled_task(
    task: ScheduledTaskCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a scheduled task"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.create_scheduled_task(
        organization_id=str(current_user.get("organization_id", "org-123")),
        user_id=str(current_user.get("id", "user-123")),
        name=task.name,
        task_type=task.task_type,
        schedule_type=task.schedule_type,
        config=task.config,
        scheduled_at=task.scheduled_at,
        cron_expression=task.cron_expression
    )


@router.put("/scheduled-tasks/{task_id}")
async def update_scheduled_task(
    task_id: str,
    task: ScheduledTaskUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a scheduled task"""
    from app.services.workflow_service import workflow_service
    
    return await workflow_service.update_scheduled_task(
        task_id=task_id,
        updates=task.dict(exclude_none=True)
    )


@router.delete("/scheduled-tasks/{task_id}")
async def delete_scheduled_task(
    task_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a scheduled task"""
    from app.services.workflow_service import workflow_service
    
    success = await workflow_service.delete_scheduled_task(task_id)
    return {"success": success}


# Action types endpoint

@router.get("/action-types")
async def get_action_types(current_user: dict = Depends(get_current_user)):
    """Get available action types for workflows"""
    return {
        "action_types": [
            {
                "type": "send_notification",
                "name": "Send Notification",
                "description": "Send an in-app notification",
                "icon": "bell",
                "config_schema": {
                    "title": {"type": "string", "required": True},
                    "message": {"type": "string", "required": True},
                    "priority": {"type": "string", "options": ["low", "medium", "high", "urgent"]},
                    "action_url": {"type": "string"}
                }
            },
            {
                "type": "send_email",
                "name": "Send Email",
                "description": "Send an email to specified recipients",
                "icon": "mail",
                "config_schema": {
                    "to": {"type": "string", "required": True},
                    "subject": {"type": "string", "required": True},
                    "template": {"type": "string"},
                    "body": {"type": "string"}
                }
            },
            {
                "type": "create_task",
                "name": "Create Task",
                "description": "Create a new task or action item",
                "icon": "check-square",
                "config_schema": {
                    "title": {"type": "string", "required": True},
                    "description": {"type": "string"},
                    "assignee": {"type": "string"},
                    "due_date": {"type": "date"},
                    "priority": {"type": "string", "options": ["low", "medium", "high"]}
                }
            },
            {
                "type": "generate_report",
                "name": "Generate Report",
                "description": "Generate an executive report",
                "icon": "file-text",
                "config_schema": {
                    "report_type": {"type": "string", "required": True, "options": ["daily_summary", "weekly_summary", "monthly_summary", "custom"]},
                    "format": {"type": "string", "options": ["pdf", "excel", "pptx"]},
                    "recipients": {"type": "array"}
                }
            },
            {
                "type": "send_slack",
                "name": "Send to Slack",
                "description": "Post a message to a Slack channel",
                "icon": "slack",
                "config_schema": {
                    "channel": {"type": "string", "required": True},
                    "message": {"type": "string", "required": True},
                    "mention_users": {"type": "array"}
                }
            },
            {
                "type": "create_meeting",
                "name": "Create Meeting",
                "description": "Schedule a new meeting",
                "icon": "calendar",
                "config_schema": {
                    "title": {"type": "string", "required": True},
                    "duration": {"type": "number", "required": True},
                    "attendees": {"type": "array"},
                    "description": {"type": "string"}
                }
            },
            {
                "type": "update_okr",
                "name": "Update OKR",
                "description": "Update an OKR progress",
                "icon": "target",
                "config_schema": {
                    "okr_id": {"type": "string", "required": True},
                    "progress": {"type": "number"},
                    "status": {"type": "string", "options": ["on_track", "at_risk", "behind"]}
                }
            },
            {
                "type": "call_api",
                "name": "Call API",
                "description": "Make an HTTP request to an external API",
                "icon": "globe",
                "config_schema": {
                    "url": {"type": "string", "required": True},
                    "method": {"type": "string", "options": ["GET", "POST", "PUT", "DELETE"]},
                    "headers": {"type": "object"},
                    "body": {"type": "object"}
                }
            }
        ]
    }


# Trigger types endpoint

@router.get("/trigger-types")
async def get_trigger_types(current_user: dict = Depends(get_current_user)):
    """Get available trigger types for workflows"""
    return {
        "trigger_types": [
            {
                "type": "schedule",
                "name": "Schedule",
                "description": "Run on a schedule (cron expression)",
                "icon": "clock",
                "config_schema": {
                    "cron_expression": {"type": "string", "required": True},
                    "timezone": {"type": "string", "default": "UTC"}
                }
            },
            {
                "type": "event",
                "name": "Event",
                "description": "Trigger when an event occurs",
                "icon": "zap",
                "config_schema": {
                    "source": {"type": "string", "required": True, "options": ["meeting", "document", "okr", "report", "user"]},
                    "event": {"type": "string", "required": True, "options": ["created", "updated", "deleted", "completed"]},
                    "filters": {"type": "object"}
                }
            },
            {
                "type": "webhook",
                "name": "Webhook",
                "description": "Trigger via HTTP webhook",
                "icon": "link",
                "config_schema": {
                    "secret": {"type": "string"}
                }
            },
            {
                "type": "condition",
                "name": "Condition",
                "description": "Trigger when a condition is met",
                "icon": "git-branch",
                "config_schema": {
                    "field": {"type": "string", "required": True},
                    "operator": {"type": "string", "required": True, "options": ["equals", "not_equals", "greater_than", "less_than", "contains"]},
                    "value": {"type": "string", "required": True}
                }
            },
            {
                "type": "manual",
                "name": "Manual",
                "description": "Trigger manually by user",
                "icon": "play",
                "config_schema": {}
            }
        ]
    }

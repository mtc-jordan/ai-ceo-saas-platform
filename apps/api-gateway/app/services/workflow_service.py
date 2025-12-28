"""
Workflow Automation Service
Handles workflow creation, execution, and scheduling
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from uuid import UUID
import json
import asyncio


class WorkflowService:
    """Service for managing workflows"""
    
    def __init__(self):
        self.workflows = {}
        self.executions = {}
    
    async def get_workflows(
        self,
        organization_id: str,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get paginated workflows for an organization"""
        workflows = self._get_mock_workflows(organization_id)
        
        if status:
            workflows = [w for w in workflows if w["status"] == status]
        if category:
            workflows = [w for w in workflows if w["category"] == category]
        
        total = len(workflows)
        start = (page - 1) * page_size
        end = start + page_size
        
        return {
            "workflows": workflows[start:end],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    
    async def get_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Get a single workflow with full details"""
        workflows = self._get_mock_workflows("org-123")
        for w in workflows:
            if w["id"] == workflow_id:
                return w
        return None
    
    async def create_workflow(
        self,
        organization_id: str,
        user_id: str,
        name: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        triggers: List[Dict] = None,
        actions: List[Dict] = None
    ) -> Dict[str, Any]:
        """Create a new workflow"""
        workflow = {
            "id": f"wf-{len(self.workflows) + 100}",
            "organization_id": organization_id,
            "created_by": user_id,
            "name": name,
            "description": description,
            "category": category or "custom",
            "icon": "zap",
            "color": "#6366f1",
            "status": "draft",
            "triggers": triggers or [],
            "actions": actions or [],
            "total_runs": 0,
            "successful_runs": 0,
            "failed_runs": 0,
            "last_run_at": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        self.workflows[workflow["id"]] = workflow
        return workflow
    
    async def update_workflow(
        self,
        workflow_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a workflow"""
        workflow = await self.get_workflow(workflow_id)
        if workflow:
            workflow.update(updates)
            workflow["updated_at"] = datetime.utcnow().isoformat()
        return workflow
    
    async def delete_workflow(self, workflow_id: str) -> bool:
        """Delete a workflow"""
        if workflow_id in self.workflows:
            del self.workflows[workflow_id]
        return True
    
    async def activate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Activate a workflow"""
        return await self.update_workflow(workflow_id, {"status": "active"})
    
    async def pause_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Pause a workflow"""
        return await self.update_workflow(workflow_id, {"status": "paused"})
    
    async def execute_workflow(
        self,
        workflow_id: str,
        triggered_by: str = "manual",
        input_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Execute a workflow"""
        execution = {
            "id": f"exec-{len(self.executions) + 1000}",
            "workflow_id": workflow_id,
            "status": "running",
            "triggered_by": triggered_by,
            "triggered_at": datetime.utcnow().isoformat(),
            "input_data": input_data,
            "started_at": datetime.utcnow().isoformat(),
            "action_results": []
        }
        
        # Simulate execution
        await asyncio.sleep(0.1)
        
        execution["status"] = "completed"
        execution["completed_at"] = datetime.utcnow().isoformat()
        execution["duration_ms"] = 1250
        execution["output_data"] = {"success": True, "message": "Workflow completed successfully"}
        
        self.executions[execution["id"]] = execution
        return execution
    
    async def get_executions(
        self,
        workflow_id: Optional[str] = None,
        organization_id: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        status: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get workflow executions"""
        executions = self._get_mock_executions(workflow_id)
        
        if status:
            executions = [e for e in executions if e["status"] == status]
        
        total = len(executions)
        start = (page - 1) * page_size
        end = start + page_size
        
        return {
            "executions": executions[start:end],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    
    async def get_execution(self, execution_id: str) -> Dict[str, Any]:
        """Get a single execution with details"""
        executions = self._get_mock_executions(None)
        for e in executions:
            if e["id"] == execution_id:
                return e
        return None
    
    async def cancel_execution(self, execution_id: str) -> Dict[str, Any]:
        """Cancel a running execution"""
        return {
            "id": execution_id,
            "status": "cancelled",
            "cancelled_at": datetime.utcnow().isoformat()
        }
    
    async def get_templates(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get workflow templates"""
        templates = [
            {
                "id": "tpl-1",
                "name": "Daily Report Generation",
                "description": "Automatically generate and send daily executive reports",
                "category": "reporting",
                "icon": "file-text",
                "color": "#10b981",
                "triggers": [{"type": "schedule", "cron": "0 9 * * *"}],
                "actions": [
                    {"type": "generate_report", "config": {"report_type": "daily_summary"}},
                    {"type": "send_email", "config": {"to": "{{user.email}}"}}
                ],
                "usage_count": 156,
                "is_featured": True
            },
            {
                "id": "tpl-2",
                "name": "Meeting Follow-up",
                "description": "Send follow-up emails and create tasks after meetings",
                "category": "meetings",
                "icon": "calendar",
                "color": "#6366f1",
                "triggers": [{"type": "event", "source": "meeting", "event": "completed"}],
                "actions": [
                    {"type": "send_email", "config": {"template": "meeting_followup"}},
                    {"type": "create_task", "config": {"title": "Review meeting notes"}}
                ],
                "usage_count": 89,
                "is_featured": True
            },
            {
                "id": "tpl-3",
                "name": "OKR Progress Reminder",
                "description": "Weekly reminders to update OKR progress",
                "category": "okr",
                "icon": "target",
                "color": "#f59e0b",
                "triggers": [{"type": "schedule", "cron": "0 10 * * 1"}],
                "actions": [
                    {"type": "send_notification", "config": {"title": "Update your OKRs"}},
                    {"type": "send_email", "config": {"template": "okr_reminder"}}
                ],
                "usage_count": 234,
                "is_featured": True
            },
            {
                "id": "tpl-4",
                "name": "Revenue Alert",
                "description": "Alert when revenue drops below threshold",
                "category": "alerts",
                "icon": "alert-triangle",
                "color": "#ef4444",
                "triggers": [{"type": "condition", "field": "revenue_change", "operator": "less_than", "value": "-5"}],
                "actions": [
                    {"type": "send_notification", "config": {"priority": "urgent"}},
                    {"type": "send_slack", "config": {"channel": "#alerts"}}
                ],
                "usage_count": 67,
                "is_featured": False
            },
            {
                "id": "tpl-5",
                "name": "New Document Notification",
                "description": "Notify team when new documents are shared",
                "category": "documents",
                "icon": "file",
                "color": "#8b5cf6",
                "triggers": [{"type": "event", "source": "document", "event": "created"}],
                "actions": [
                    {"type": "send_notification", "config": {"title": "New document shared"}}
                ],
                "usage_count": 45,
                "is_featured": False
            },
            {
                "id": "tpl-6",
                "name": "Weekly Team Sync",
                "description": "Create weekly team sync meetings automatically",
                "category": "meetings",
                "icon": "users",
                "color": "#06b6d4",
                "triggers": [{"type": "schedule", "cron": "0 9 * * 1"}],
                "actions": [
                    {"type": "create_meeting", "config": {"title": "Weekly Team Sync", "duration": 30}}
                ],
                "usage_count": 78,
                "is_featured": False
            }
        ]
        
        if category:
            templates = [t for t in templates if t["category"] == category]
        
        return templates
    
    async def create_from_template(
        self,
        template_id: str,
        organization_id: str,
        user_id: str,
        name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a workflow from a template"""
        templates = await self.get_templates()
        template = next((t for t in templates if t["id"] == template_id), None)
        
        if not template:
            return None
        
        return await self.create_workflow(
            organization_id=organization_id,
            user_id=user_id,
            name=name or template["name"],
            description=template["description"],
            category=template["category"],
            triggers=template["triggers"],
            actions=template["actions"]
        )
    
    # Scheduled Tasks
    
    async def get_scheduled_tasks(
        self,
        organization_id: str,
        page: int = 1,
        page_size: int = 20,
        task_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get scheduled tasks"""
        tasks = self._get_mock_scheduled_tasks(organization_id)
        
        if task_type:
            tasks = [t for t in tasks if t["task_type"] == task_type]
        
        total = len(tasks)
        start = (page - 1) * page_size
        end = start + page_size
        
        return {
            "tasks": tasks[start:end],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    
    async def create_scheduled_task(
        self,
        organization_id: str,
        user_id: str,
        name: str,
        task_type: str,
        schedule_type: str,
        config: Dict[str, Any],
        scheduled_at: Optional[datetime] = None,
        cron_expression: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a scheduled task"""
        task = {
            "id": f"task-{hash(name) % 10000}",
            "organization_id": organization_id,
            "created_by": user_id,
            "name": name,
            "task_type": task_type,
            "schedule_type": schedule_type,
            "scheduled_at": scheduled_at.isoformat() if scheduled_at else None,
            "cron_expression": cron_expression,
            "config": config,
            "is_active": True,
            "next_run_at": (scheduled_at or datetime.utcnow() + timedelta(hours=1)).isoformat(),
            "created_at": datetime.utcnow().isoformat()
        }
        return task
    
    async def update_scheduled_task(self, task_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Update a scheduled task"""
        task = {"id": task_id, **updates, "updated_at": datetime.utcnow().isoformat()}
        return task
    
    async def delete_scheduled_task(self, task_id: str) -> bool:
        """Delete a scheduled task"""
        return True
    
    async def get_workflow_stats(self, organization_id: str) -> Dict[str, Any]:
        """Get workflow statistics"""
        return {
            "total_workflows": 12,
            "active_workflows": 8,
            "paused_workflows": 2,
            "draft_workflows": 2,
            "total_executions_today": 45,
            "successful_executions_today": 42,
            "failed_executions_today": 3,
            "total_executions_week": 312,
            "success_rate": 93.3,
            "avg_execution_time_ms": 1850,
            "scheduled_tasks": 15,
            "upcoming_tasks": 5
        }
    
    def _get_mock_workflows(self, organization_id: str) -> List[Dict]:
        """Generate mock workflows"""
        now = datetime.utcnow()
        
        return [
            {
                "id": "wf-1",
                "organization_id": organization_id,
                "name": "Daily Executive Report",
                "description": "Generate and send daily executive summary report every morning",
                "category": "reporting",
                "icon": "file-text",
                "color": "#10b981",
                "status": "active",
                "triggers": [
                    {"id": "tr-1", "type": "schedule", "name": "Daily at 9 AM", "cron": "0 9 * * *", "is_active": True}
                ],
                "actions": [
                    {"id": "act-1", "type": "generate_report", "name": "Generate Report", "order": 1},
                    {"id": "act-2", "type": "send_email", "name": "Send to Executives", "order": 2}
                ],
                "total_runs": 156,
                "successful_runs": 152,
                "failed_runs": 4,
                "last_run_at": (now - timedelta(hours=3)).isoformat(),
                "last_run_status": "completed",
                "created_at": (now - timedelta(days=60)).isoformat()
            },
            {
                "id": "wf-2",
                "organization_id": organization_id,
                "name": "Meeting Follow-up Automation",
                "description": "Automatically send follow-up emails and create tasks after meetings",
                "category": "meetings",
                "icon": "calendar",
                "color": "#6366f1",
                "status": "active",
                "triggers": [
                    {"id": "tr-2", "type": "event", "name": "Meeting Completed", "source": "meeting", "event": "completed", "is_active": True}
                ],
                "actions": [
                    {"id": "act-3", "type": "send_email", "name": "Send Follow-up Email", "order": 1},
                    {"id": "act-4", "type": "create_task", "name": "Create Review Task", "order": 2},
                    {"id": "act-5", "type": "send_slack", "name": "Post to Slack", "order": 3}
                ],
                "total_runs": 89,
                "successful_runs": 87,
                "failed_runs": 2,
                "last_run_at": (now - timedelta(hours=1)).isoformat(),
                "last_run_status": "completed",
                "created_at": (now - timedelta(days=45)).isoformat()
            },
            {
                "id": "wf-3",
                "organization_id": organization_id,
                "name": "OKR Progress Reminder",
                "description": "Send weekly reminders to update OKR progress",
                "category": "okr",
                "icon": "target",
                "color": "#f59e0b",
                "status": "active",
                "triggers": [
                    {"id": "tr-3", "type": "schedule", "name": "Every Monday", "cron": "0 10 * * 1", "is_active": True}
                ],
                "actions": [
                    {"id": "act-6", "type": "send_notification", "name": "In-App Notification", "order": 1},
                    {"id": "act-7", "type": "send_email", "name": "Email Reminder", "order": 2}
                ],
                "total_runs": 24,
                "successful_runs": 24,
                "failed_runs": 0,
                "last_run_at": (now - timedelta(days=2)).isoformat(),
                "last_run_status": "completed",
                "created_at": (now - timedelta(days=180)).isoformat()
            },
            {
                "id": "wf-4",
                "organization_id": organization_id,
                "name": "Revenue Drop Alert",
                "description": "Alert when daily revenue drops more than 10%",
                "category": "alerts",
                "icon": "alert-triangle",
                "color": "#ef4444",
                "status": "active",
                "triggers": [
                    {"id": "tr-4", "type": "condition", "name": "Revenue Drop", "field": "daily_revenue_change", "operator": "less_than", "value": "-10", "is_active": True}
                ],
                "actions": [
                    {"id": "act-8", "type": "send_notification", "name": "Urgent Alert", "order": 1},
                    {"id": "act-9", "type": "send_slack", "name": "Alert Channel", "order": 2},
                    {"id": "act-10", "type": "send_email", "name": "Email CEO", "order": 3}
                ],
                "total_runs": 3,
                "successful_runs": 3,
                "failed_runs": 0,
                "last_run_at": (now - timedelta(days=15)).isoformat(),
                "last_run_status": "completed",
                "created_at": (now - timedelta(days=90)).isoformat()
            },
            {
                "id": "wf-5",
                "organization_id": organization_id,
                "name": "New Document Notification",
                "description": "Notify relevant team members when documents are shared",
                "category": "documents",
                "icon": "file",
                "color": "#8b5cf6",
                "status": "paused",
                "triggers": [
                    {"id": "tr-5", "type": "event", "name": "Document Created", "source": "document", "event": "created", "is_active": False}
                ],
                "actions": [
                    {"id": "act-11", "type": "send_notification", "name": "Notify Team", "order": 1}
                ],
                "total_runs": 45,
                "successful_runs": 44,
                "failed_runs": 1,
                "last_run_at": (now - timedelta(days=7)).isoformat(),
                "last_run_status": "completed",
                "created_at": (now - timedelta(days=120)).isoformat()
            },
            {
                "id": "wf-6",
                "organization_id": organization_id,
                "name": "Weekly Board Update",
                "description": "Compile and send weekly updates to board members",
                "category": "reporting",
                "icon": "users",
                "color": "#06b6d4",
                "status": "draft",
                "triggers": [
                    {"id": "tr-6", "type": "schedule", "name": "Every Friday", "cron": "0 17 * * 5", "is_active": False}
                ],
                "actions": [
                    {"id": "act-12", "type": "generate_report", "name": "Generate Board Report", "order": 1},
                    {"id": "act-13", "type": "send_email", "name": "Send to Board", "order": 2}
                ],
                "total_runs": 0,
                "successful_runs": 0,
                "failed_runs": 0,
                "last_run_at": None,
                "last_run_status": None,
                "created_at": (now - timedelta(days=3)).isoformat()
            }
        ]
    
    def _get_mock_executions(self, workflow_id: Optional[str]) -> List[Dict]:
        """Generate mock executions"""
        now = datetime.utcnow()
        
        executions = [
            {
                "id": "exec-1",
                "workflow_id": "wf-1",
                "workflow_name": "Daily Executive Report",
                "status": "completed",
                "triggered_by": "schedule",
                "triggered_at": (now - timedelta(hours=3)).isoformat(),
                "started_at": (now - timedelta(hours=3)).isoformat(),
                "completed_at": (now - timedelta(hours=3, minutes=-2)).isoformat(),
                "duration_ms": 1850,
                "action_results": [
                    {"action": "Generate Report", "status": "completed", "duration_ms": 1200},
                    {"action": "Send to Executives", "status": "completed", "duration_ms": 650}
                ]
            },
            {
                "id": "exec-2",
                "workflow_id": "wf-2",
                "workflow_name": "Meeting Follow-up Automation",
                "status": "completed",
                "triggered_by": "event",
                "triggered_at": (now - timedelta(hours=1)).isoformat(),
                "started_at": (now - timedelta(hours=1)).isoformat(),
                "completed_at": (now - timedelta(hours=1, minutes=-1)).isoformat(),
                "duration_ms": 2100,
                "action_results": [
                    {"action": "Send Follow-up Email", "status": "completed", "duration_ms": 800},
                    {"action": "Create Review Task", "status": "completed", "duration_ms": 500},
                    {"action": "Post to Slack", "status": "completed", "duration_ms": 800}
                ]
            },
            {
                "id": "exec-3",
                "workflow_id": "wf-1",
                "workflow_name": "Daily Executive Report",
                "status": "failed",
                "triggered_by": "schedule",
                "triggered_at": (now - timedelta(days=1, hours=3)).isoformat(),
                "started_at": (now - timedelta(days=1, hours=3)).isoformat(),
                "completed_at": (now - timedelta(days=1, hours=3, minutes=-1)).isoformat(),
                "duration_ms": 1500,
                "error_message": "Email service temporarily unavailable",
                "action_results": [
                    {"action": "Generate Report", "status": "completed", "duration_ms": 1200},
                    {"action": "Send to Executives", "status": "failed", "duration_ms": 300, "error": "SMTP connection failed"}
                ]
            },
            {
                "id": "exec-4",
                "workflow_id": "wf-3",
                "workflow_name": "OKR Progress Reminder",
                "status": "completed",
                "triggered_by": "schedule",
                "triggered_at": (now - timedelta(days=2)).isoformat(),
                "started_at": (now - timedelta(days=2)).isoformat(),
                "completed_at": (now - timedelta(days=2, minutes=-1)).isoformat(),
                "duration_ms": 950,
                "action_results": [
                    {"action": "In-App Notification", "status": "completed", "duration_ms": 450},
                    {"action": "Email Reminder", "status": "completed", "duration_ms": 500}
                ]
            },
            {
                "id": "exec-5",
                "workflow_id": "wf-2",
                "workflow_name": "Meeting Follow-up Automation",
                "status": "running",
                "triggered_by": "event",
                "triggered_at": now.isoformat(),
                "started_at": now.isoformat(),
                "completed_at": None,
                "duration_ms": None,
                "action_results": [
                    {"action": "Send Follow-up Email", "status": "completed", "duration_ms": 750},
                    {"action": "Create Review Task", "status": "running", "duration_ms": None}
                ]
            }
        ]
        
        if workflow_id:
            executions = [e for e in executions if e["workflow_id"] == workflow_id]
        
        return executions
    
    def _get_mock_scheduled_tasks(self, organization_id: str) -> List[Dict]:
        """Generate mock scheduled tasks"""
        now = datetime.utcnow()
        
        return [
            {
                "id": "task-1",
                "organization_id": organization_id,
                "name": "Daily Revenue Check",
                "description": "Check daily revenue metrics and alert if below threshold",
                "task_type": "reminder",
                "schedule_type": "recurring",
                "cron_expression": "0 8 * * *",
                "is_active": True,
                "next_run_at": (now + timedelta(hours=2)).isoformat(),
                "last_run_at": (now - timedelta(hours=22)).isoformat(),
                "total_runs": 45,
                "successful_runs": 45,
                "failed_runs": 0
            },
            {
                "id": "task-2",
                "organization_id": organization_id,
                "name": "Weekly Data Sync",
                "description": "Sync data from external sources",
                "task_type": "sync",
                "schedule_type": "recurring",
                "cron_expression": "0 2 * * 0",
                "is_active": True,
                "next_run_at": (now + timedelta(days=3)).isoformat(),
                "last_run_at": (now - timedelta(days=4)).isoformat(),
                "total_runs": 12,
                "successful_runs": 11,
                "failed_runs": 1
            },
            {
                "id": "task-3",
                "organization_id": organization_id,
                "name": "Board Meeting Reminder",
                "description": "Remind about upcoming board meeting",
                "task_type": "reminder",
                "schedule_type": "once",
                "scheduled_at": (now + timedelta(days=5)).isoformat(),
                "is_active": True,
                "next_run_at": (now + timedelta(days=5)).isoformat(),
                "last_run_at": None,
                "total_runs": 0,
                "successful_runs": 0,
                "failed_runs": 0
            },
            {
                "id": "task-4",
                "organization_id": organization_id,
                "name": "Monthly Report Generation",
                "description": "Generate monthly executive report",
                "task_type": "report",
                "schedule_type": "recurring",
                "cron_expression": "0 6 1 * *",
                "is_active": True,
                "next_run_at": (now + timedelta(days=7)).isoformat(),
                "last_run_at": (now - timedelta(days=24)).isoformat(),
                "total_runs": 6,
                "successful_runs": 6,
                "failed_runs": 0
            }
        ]


# Initialize service
workflow_service = WorkflowService()

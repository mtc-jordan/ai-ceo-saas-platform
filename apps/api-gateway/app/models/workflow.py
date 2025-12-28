"""
Workflow Automation Database Models
"""
from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, Enum, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum


class WorkflowStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DRAFT = "draft"
    ARCHIVED = "archived"


class TriggerType(str, enum.Enum):
    SCHEDULE = "schedule"
    EVENT = "event"
    WEBHOOK = "webhook"
    MANUAL = "manual"
    CONDITION = "condition"


class ActionType(str, enum.Enum):
    SEND_NOTIFICATION = "send_notification"
    SEND_EMAIL = "send_email"
    CREATE_TASK = "create_task"
    UPDATE_RECORD = "update_record"
    CALL_API = "call_api"
    GENERATE_REPORT = "generate_report"
    SEND_SLACK = "send_slack"
    CREATE_MEETING = "create_meeting"
    UPDATE_OKR = "update_okr"
    CUSTOM_SCRIPT = "custom_script"


class ConditionOperator(str, enum.Enum):
    EQUALS = "equals"
    NOT_EQUALS = "not_equals"
    GREATER_THAN = "greater_than"
    LESS_THAN = "less_than"
    CONTAINS = "contains"
    NOT_CONTAINS = "not_contains"
    IS_EMPTY = "is_empty"
    IS_NOT_EMPTY = "is_not_empty"
    IN_LIST = "in_list"
    NOT_IN_LIST = "not_in_list"


class ExecutionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    SKIPPED = "skipped"


class Workflow:
    """Main workflow definition"""
    __tablename__ = "workflows"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Basic info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True)  # e.g., "reporting", "notifications", "data"
    icon = Column(String(50), default="zap")
    color = Column(String(20), default="#6366f1")
    
    # Status
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.DRAFT)
    is_template = Column(Boolean, default=False)
    
    # Execution settings
    max_retries = Column(Integer, default=3)
    retry_delay_seconds = Column(Integer, default=60)
    timeout_seconds = Column(Integer, default=300)
    
    # Statistics
    total_runs = Column(Integer, default=0)
    successful_runs = Column(Integer, default=0)
    failed_runs = Column(Integer, default=0)
    last_run_at = Column(DateTime, nullable=True)
    last_run_status = Column(Enum(ExecutionStatus), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WorkflowTrigger:
    """Trigger that starts a workflow"""
    __tablename__ = "workflow_triggers"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False, index=True)
    
    # Trigger type
    trigger_type = Column(Enum(TriggerType), nullable=False)
    name = Column(String(100), nullable=False)
    
    # Schedule trigger config (cron expression)
    cron_expression = Column(String(100), nullable=True)
    timezone = Column(String(50), default="UTC")
    
    # Event trigger config
    event_source = Column(String(50), nullable=True)  # e.g., "meeting", "document", "okr"
    event_type = Column(String(50), nullable=True)  # e.g., "created", "updated", "completed"
    event_filters = Column(JSON, nullable=True)  # Additional filters for the event
    
    # Webhook trigger config
    webhook_url = Column(String(500), nullable=True)
    webhook_secret = Column(String(100), nullable=True)
    
    # Condition trigger config
    condition_field = Column(String(100), nullable=True)
    condition_operator = Column(Enum(ConditionOperator), nullable=True)
    condition_value = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkflowAction:
    """Action to perform in a workflow"""
    __tablename__ = "workflow_actions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False, index=True)
    
    # Action info
    action_type = Column(Enum(ActionType), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    
    # Order in workflow
    order = Column(Integer, default=0)
    
    # Action configuration (JSON for flexibility)
    config = Column(JSON, nullable=False, default=dict)
    
    # Conditional execution
    condition_enabled = Column(Boolean, default=False)
    condition_field = Column(String(100), nullable=True)
    condition_operator = Column(Enum(ConditionOperator), nullable=True)
    condition_value = Column(Text, nullable=True)
    
    # Error handling
    on_error = Column(String(20), default="stop")  # stop, continue, retry
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkflowExecution:
    """Record of a workflow execution"""
    __tablename__ = "workflow_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False, index=True)
    trigger_id = Column(UUID(as_uuid=True), ForeignKey("workflow_triggers.id"), nullable=True)
    
    # Execution info
    status = Column(Enum(ExecutionStatus), default=ExecutionStatus.PENDING)
    triggered_by = Column(String(50), nullable=True)  # "schedule", "event", "manual", etc.
    triggered_at = Column(DateTime, default=datetime.utcnow)
    
    # Input/output
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    
    # Timing
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    
    # Error info
    error_message = Column(Text, nullable=True)
    error_action_id = Column(UUID(as_uuid=True), nullable=True)
    retry_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkflowActionExecution:
    """Record of individual action execution within a workflow"""
    __tablename__ = "workflow_action_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=False, index=True)
    action_id = Column(UUID(as_uuid=True), ForeignKey("workflow_actions.id"), nullable=False)
    
    # Execution info
    status = Column(Enum(ExecutionStatus), default=ExecutionStatus.PENDING)
    order = Column(Integer, default=0)
    
    # Input/output
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    
    # Timing
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    
    # Error info
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)


class ScheduledTask:
    """Standalone scheduled tasks (reminders, recurring tasks)"""
    __tablename__ = "scheduled_tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Task info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    task_type = Column(String(50), nullable=False)  # "reminder", "report", "sync", etc.
    
    # Schedule
    schedule_type = Column(String(20), nullable=False)  # "once", "recurring"
    scheduled_at = Column(DateTime, nullable=True)  # For one-time tasks
    cron_expression = Column(String(100), nullable=True)  # For recurring tasks
    timezone = Column(String(50), default="UTC")
    
    # Task configuration
    config = Column(JSON, nullable=False, default=dict)
    
    # Notification settings
    notify_on_complete = Column(Boolean, default=True)
    notify_on_failure = Column(Boolean, default=True)
    notify_users = Column(JSON, default=list)  # List of user IDs to notify
    
    # Status
    is_active = Column(Boolean, default=True)
    last_run_at = Column(DateTime, nullable=True)
    next_run_at = Column(DateTime, nullable=True)
    
    # Statistics
    total_runs = Column(Integer, default=0)
    successful_runs = Column(Integer, default=0)
    failed_runs = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WorkflowTemplate:
    """Pre-built workflow templates"""
    __tablename__ = "workflow_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Template info
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False)
    icon = Column(String(50), default="zap")
    color = Column(String(20), default="#6366f1")
    
    # Template definition
    triggers = Column(JSON, nullable=False, default=list)
    actions = Column(JSON, nullable=False, default=list)
    
    # Metadata
    is_featured = Column(Boolean, default=False)
    usage_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

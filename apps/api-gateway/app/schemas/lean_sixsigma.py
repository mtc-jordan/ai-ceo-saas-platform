"""
Lean Six Sigma Schemas
Pydantic schemas for DMAIC projects, process mapping, and continuous improvement
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class DMAICPhaseEnum(str, Enum):
    DEFINE = "define"
    MEASURE = "measure"
    ANALYZE = "analyze"
    IMPROVE = "improve"
    CONTROL = "control"
    COMPLETED = "completed"


class ProjectPriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class BeltLevelEnum(str, Enum):
    WHITE = "white"
    YELLOW = "yellow"
    GREEN = "green"
    BLACK = "black"
    MASTER_BLACK = "master_black"


class WasteTypeEnum(str, Enum):
    TRANSPORT = "transport"
    INVENTORY = "inventory"
    MOTION = "motion"
    WAITING = "waiting"
    OVERPRODUCTION = "overproduction"
    OVERPROCESSING = "overprocessing"
    DEFECTS = "defects"
    SKILLS = "skills"


# DMAIC Project Schemas
class DMAICProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    problem_statement: Optional[str] = None
    goal_statement: Optional[str] = None
    business_case: Optional[str] = None
    priority: ProjectPriorityEnum = ProjectPriorityEnum.MEDIUM
    belt_level: BeltLevelEnum = BeltLevelEnum.GREEN
    champion_id: Optional[str] = None
    project_lead_id: Optional[str] = None
    team_members: List[str] = []
    in_scope: List[str] = []
    out_of_scope: List[str] = []
    start_date: Optional[datetime] = None
    target_completion: Optional[datetime] = None
    baseline_metric: Optional[float] = None
    target_metric: Optional[float] = None
    metric_unit: Optional[str] = None
    metric_name: Optional[str] = None
    estimated_savings: float = 0


class DMAICProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    problem_statement: Optional[str] = None
    goal_statement: Optional[str] = None
    business_case: Optional[str] = None
    current_phase: Optional[DMAICPhaseEnum] = None
    priority: Optional[ProjectPriorityEnum] = None
    champion_id: Optional[str] = None
    project_lead_id: Optional[str] = None
    team_members: Optional[List[str]] = None
    in_scope: Optional[List[str]] = None
    out_of_scope: Optional[List[str]] = None
    target_completion: Optional[datetime] = None
    current_metric: Optional[float] = None
    target_metric: Optional[float] = None
    actual_savings: Optional[float] = None
    status: Optional[str] = None
    completion_percentage: Optional[int] = None


class DMAICProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    problem_statement: Optional[str]
    goal_statement: Optional[str]
    business_case: Optional[str]
    current_phase: str
    priority: str
    belt_level: str
    champion_id: Optional[str]
    project_lead_id: Optional[str]
    team_members: List[str]
    in_scope: List[str]
    out_of_scope: List[str]
    start_date: Optional[datetime]
    target_completion: Optional[datetime]
    actual_completion: Optional[datetime]
    baseline_metric: Optional[float]
    target_metric: Optional[float]
    current_metric: Optional[float]
    metric_unit: Optional[str]
    metric_name: Optional[str]
    estimated_savings: float
    actual_savings: float
    implementation_cost: float
    status: str
    completion_percentage: int
    created_at: datetime

    class Config:
        from_attributes = True


# SIPOC Schemas
class SIPOCCreate(BaseModel):
    project_id: str
    process_name: str
    process_description: Optional[str] = None
    suppliers: List[str] = []
    inputs: List[str] = []
    process_steps: List[str] = []
    outputs: List[str] = []
    customers: List[str] = []


class SIPOCResponse(BaseModel):
    id: str
    project_id: str
    process_name: str
    process_description: Optional[str]
    suppliers: List[str]
    inputs: List[str]
    process_steps: List[str]
    outputs: List[str]
    customers: List[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Process Map Schemas
class ProcessStepData(BaseModel):
    step_number: int
    name: str
    description: Optional[str] = None
    step_type: str = "operation"  # operation, transport, delay, inspection, storage, decision
    responsible: Optional[str] = None
    cycle_time: Optional[float] = None
    wait_time: Optional[float] = None
    setup_time: Optional[float] = None
    is_value_add: bool = True
    is_necessary: bool = True
    defect_rate: float = 0
    notes: Optional[str] = None


class ProcessMapCreate(BaseModel):
    project_id: Optional[str] = None
    name: str
    map_type: str = "process"  # process, value_stream, swim_lane
    description: Optional[str] = None
    steps: List[ProcessStepData] = []
    takt_time: Optional[float] = None


class ProcessMapResponse(BaseModel):
    id: str
    project_id: Optional[str]
    name: str
    map_type: str
    description: Optional[str]
    steps: List[Dict[str, Any]]
    total_lead_time: Optional[float]
    total_cycle_time: Optional[float]
    total_wait_time: Optional[float]
    value_add_ratio: Optional[float]
    takt_time: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# Waste Item Schemas
class WasteItemCreate(BaseModel):
    project_id: Optional[str] = None
    waste_type: WasteTypeEnum
    description: str
    location: Optional[str] = None
    frequency: Optional[str] = None
    time_impact: Optional[float] = None
    cost_impact: Optional[float] = None
    quality_impact: Optional[str] = None


class WasteItemUpdate(BaseModel):
    status: Optional[str] = None
    root_cause: Optional[str] = None
    countermeasure: Optional[str] = None


class WasteItemResponse(BaseModel):
    id: str
    project_id: Optional[str]
    waste_type: str
    description: str
    location: Optional[str]
    frequency: Optional[str]
    time_impact: Optional[float]
    cost_impact: Optional[float]
    quality_impact: Optional[str]
    status: str
    root_cause: Optional[str]
    countermeasure: Optional[str]
    identified_date: datetime

    class Config:
        from_attributes = True


# Control Chart Schemas
class DataPointInput(BaseModel):
    timestamp: datetime
    value: float
    subgroup_size: int = 1
    notes: Optional[str] = None


class ControlChartCreate(BaseModel):
    project_id: Optional[str] = None
    chart_name: str
    chart_type: str = "i_mr"  # x_bar, r_chart, p_chart, c_chart, i_mr
    metric_name: Optional[str] = None
    unit: Optional[str] = None
    usl: Optional[float] = None
    lsl: Optional[float] = None
    target: Optional[float] = None
    data_points: List[DataPointInput] = []


class ControlChartResponse(BaseModel):
    id: str
    project_id: Optional[str]
    chart_name: str
    chart_type: str
    metric_name: Optional[str]
    unit: Optional[str]
    ucl: Optional[float]
    lcl: Optional[float]
    center_line: Optional[float]
    usl: Optional[float]
    lsl: Optional[float]
    target: Optional[float]
    data_points: List[Dict[str, Any]]
    cp: Optional[float]
    cpk: Optional[float]
    sigma_level: Optional[float]
    dpmo: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# Pareto Analysis Schemas
class ParetoItemInput(BaseModel):
    category: str
    count: int


class ParetoAnalysisCreate(BaseModel):
    project_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    category_type: Optional[str] = None
    items: List[ParetoItemInput]


class ParetoAnalysisResponse(BaseModel):
    id: str
    project_id: Optional[str]
    name: str
    description: Optional[str]
    category_type: Optional[str]
    items: List[Dict[str, Any]]
    total_count: int
    vital_few_categories: List[str]
    analysis_date: datetime

    class Config:
        from_attributes = True


# Root Cause Analysis Schemas
class FiveWhyInput(BaseModel):
    why_number: int
    question: str
    answer: str


class FishboneCause(BaseModel):
    cause: str
    sub_causes: List[str] = []


class RootCauseAnalysisCreate(BaseModel):
    project_id: Optional[str] = None
    problem_statement: str
    analysis_type: str = "five_whys"  # five_whys, fishbone
    five_whys: List[FiveWhyInput] = []
    fishbone_data: Dict[str, List[FishboneCause]] = {}


class RootCauseAnalysisResponse(BaseModel):
    id: str
    project_id: Optional[str]
    problem_statement: str
    analysis_type: str
    five_whys: List[Dict[str, Any]]
    fishbone_data: Dict[str, Any]
    root_causes: List[str]
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Kaizen Event Schemas
class KaizenGoal(BaseModel):
    metric: str
    baseline: float
    target: float
    actual: Optional[float] = None


class KaizenEventCreate(BaseModel):
    project_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    event_type: str = "standard"  # rapid, standard, blitz
    focus_area: Optional[str] = None
    target_process: Optional[str] = None
    facilitator_id: Optional[str] = None
    team_members: List[str] = []
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    goals: List[KaizenGoal] = []


class KaizenEventUpdate(BaseModel):
    status: Optional[str] = None
    improvements_identified: Optional[List[str]] = None
    improvements_implemented: Optional[List[str]] = None
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    savings_achieved: Optional[float] = None
    lessons_learned: Optional[List[str]] = None


class KaizenEventResponse(BaseModel):
    id: str
    project_id: Optional[str]
    name: str
    description: Optional[str]
    event_type: str
    focus_area: Optional[str]
    target_process: Optional[str]
    facilitator_id: Optional[str]
    team_members: List[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    goals: List[Dict[str, Any]]
    improvements_identified: List[str]
    improvements_implemented: List[str]
    savings_achieved: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Improvement Action Schemas
class ImprovementActionCreate(BaseModel):
    project_id: Optional[str] = None
    kaizen_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    action_type: str = "quick_win"
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    expected_impact: Optional[str] = None
    expected_savings: Optional[float] = None


class ImprovementActionUpdate(BaseModel):
    status: Optional[str] = None
    actual_savings: Optional[float] = None
    verified: Optional[bool] = None
    verification_notes: Optional[str] = None


class ImprovementActionResponse(BaseModel):
    id: str
    project_id: Optional[str]
    kaizen_id: Optional[str]
    title: str
    description: Optional[str]
    action_type: str
    assigned_to: Optional[str]
    due_date: Optional[datetime]
    expected_savings: Optional[float]
    actual_savings: Optional[float]
    status: str
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


# OEE Schemas
class DowntimeLoss(BaseModel):
    reason: str
    duration: float  # minutes


class OEERecordCreate(BaseModel):
    equipment_name: str
    equipment_id: Optional[str] = None
    record_date: datetime
    shift: Optional[str] = None
    planned_production_time: float
    actual_run_time: float
    ideal_cycle_time: float
    total_units_produced: int
    good_units: int
    downtime_losses: List[DowntimeLoss] = []
    notes: Optional[str] = None


class OEERecordResponse(BaseModel):
    id: str
    equipment_name: str
    equipment_id: Optional[str]
    record_date: datetime
    shift: Optional[str]
    availability: float
    performance: float
    quality: float
    oee: float
    total_units_produced: int
    good_units: int
    defective_units: int
    downtime_losses: List[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


# Lean Metrics Schemas
class LeanMetricCreate(BaseModel):
    project_id: Optional[str] = None
    name: str
    category: str  # quality, delivery, cost, safety, morale
    current_value: float
    target_value: Optional[float] = None
    baseline_value: Optional[float] = None
    unit: Optional[str] = None
    red_threshold: Optional[float] = None
    yellow_threshold: Optional[float] = None
    green_threshold: Optional[float] = None


class LeanMetricResponse(BaseModel):
    id: str
    project_id: Optional[str]
    name: str
    category: str
    current_value: float
    target_value: Optional[float]
    baseline_value: Optional[float]
    unit: Optional[str]
    trend: Optional[str]
    trend_percentage: Optional[float]
    history: List[Dict[str, Any]]
    last_updated: datetime

    class Config:
        from_attributes = True


# Dashboard Summary
class LeanSixSigmaDashboard(BaseModel):
    active_projects: int
    completed_projects: int
    total_savings: float
    projects_by_phase: Dict[str, int]
    projects_by_belt: Dict[str, int]
    waste_items_identified: int
    waste_items_eliminated: int
    kaizen_events_completed: int
    average_oee: Optional[float]
    top_projects: List[DMAICProjectResponse]
    recent_improvements: List[ImprovementActionResponse]

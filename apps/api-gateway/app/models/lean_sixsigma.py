"""
Lean Six Sigma Models
Database models for DMAIC projects, process mapping, statistical analysis, and continuous improvement
"""
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON, Enum
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class DMAICPhase(str, enum.Enum):
    DEFINE = "define"
    MEASURE = "measure"
    ANALYZE = "analyze"
    IMPROVE = "improve"
    CONTROL = "control"
    COMPLETED = "completed"


class ProjectPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class BeltLevel(str, enum.Enum):
    WHITE = "white"
    YELLOW = "yellow"
    GREEN = "green"
    BLACK = "black"
    MASTER_BLACK = "master_black"


class WasteType(str, enum.Enum):
    TRANSPORT = "transport"
    INVENTORY = "inventory"
    MOTION = "motion"
    WAITING = "waiting"
    OVERPRODUCTION = "overproduction"
    OVERPROCESSING = "overprocessing"
    DEFECTS = "defects"
    SKILLS = "skills"  # Non-utilized talent


# DMAIC Project
class DMAICProject(Base):
    __tablename__ = "dmaic_projects"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False, index=True)
    
    # Project Info
    name = Column(String(255), nullable=False)
    description = Column(Text)
    problem_statement = Column(Text)
    goal_statement = Column(Text)
    business_case = Column(Text)
    
    # Project Details
    current_phase = Column(String(20), default=DMAICPhase.DEFINE.value)
    priority = Column(String(20), default=ProjectPriority.MEDIUM.value)
    belt_level = Column(String(20), default=BeltLevel.GREEN.value)
    
    # Team
    champion_id = Column(String(36))  # Executive sponsor
    project_lead_id = Column(String(36))  # Belt holder
    team_members = Column(JSON, default=list)  # List of user IDs
    
    # Scope
    in_scope = Column(JSON, default=list)
    out_of_scope = Column(JSON, default=list)
    
    # Timeline
    start_date = Column(DateTime)
    target_completion = Column(DateTime)
    actual_completion = Column(DateTime)
    
    # Metrics
    baseline_metric = Column(Float)
    target_metric = Column(Float)
    current_metric = Column(Float)
    metric_unit = Column(String(50))
    metric_name = Column(String(100))
    
    # Financial Impact
    estimated_savings = Column(Float, default=0)
    actual_savings = Column(Float, default=0)
    implementation_cost = Column(Float, default=0)
    
    # Status
    status = Column(String(20), default="active")  # active, on_hold, completed, cancelled
    completion_percentage = Column(Integer, default=0)
    
    # Phase completion dates
    define_completed = Column(DateTime)
    measure_completed = Column(DateTime)
    analyze_completed = Column(DateTime)
    improve_completed = Column(DateTime)
    control_completed = Column(DateTime)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# SIPOC Diagram (Suppliers, Inputs, Process, Outputs, Customers)
class SIPOCDiagram(Base):
    __tablename__ = "sipoc_diagrams"
    
    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("dmaic_projects.id"), nullable=False)
    organization_id = Column(String(36), nullable=False, index=True)
    
    process_name = Column(String(255), nullable=False)
    process_description = Column(Text)
    
    suppliers = Column(JSON, default=list)  # List of supplier names
    inputs = Column(JSON, default=list)  # List of inputs
    process_steps = Column(JSON, default=list)  # High-level process steps
    outputs = Column(JSON, default=list)  # List of outputs
    customers = Column(JSON, default=list)  # List of customers
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# Process Map / Value Stream Map
class ProcessMap(Base):
    __tablename__ = "process_maps"
    
    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("dmaic_projects.id"))
    organization_id = Column(String(36), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    map_type = Column(String(50), default="process")  # process, value_stream, swim_lane
    description = Column(Text)
    
    # Process steps stored as JSON
    steps = Column(JSON, default=list)
    # Each step: {id, name, type, duration, wait_time, value_add, responsible, notes}
    
    # Value Stream Metrics
    total_lead_time = Column(Float)  # Total time from start to finish
    total_cycle_time = Column(Float)  # Actual processing time
    total_wait_time = Column(Float)  # Non-value-add wait time
    value_add_ratio = Column(Float)  # % of time that adds value
    
    # Takt Time
    takt_time = Column(Float)  # Available time / Customer demand
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# Process Step (for detailed process mapping)
class ProcessStep(Base):
    __tablename__ = "process_steps"
    
    id = Column(String(36), primary_key=True)
    process_map_id = Column(String(36), ForeignKey("process_maps.id"), nullable=False)
    organization_id = Column(String(36), nullable=False, index=True)
    
    step_number = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    step_type = Column(String(50))  # operation, transport, delay, inspection, storage, decision
    responsible = Column(String(255))  # Department or role
    
    # Time metrics
    cycle_time = Column(Float)  # Processing time in minutes
    wait_time = Column(Float)  # Wait time before this step
    setup_time = Column(Float)  # Setup/changeover time
    
    # Value analysis
    is_value_add = Column(Boolean, default=True)
    is_necessary = Column(Boolean, default=True)  # Necessary non-value-add vs pure waste
    
    # Quality
    defect_rate = Column(Float, default=0)  # % defects at this step
    rework_rate = Column(Float, default=0)  # % requiring rework
    
    # Resources
    resources_required = Column(JSON, default=list)
    tools_equipment = Column(JSON, default=list)
    
    notes = Column(Text)
    improvement_opportunities = Column(JSON, default=list)
    
    created_at = Column(DateTime, server_default=func.now())


# Waste Tracking (TIMWOODS)
class WasteItem(Base):
    __tablename__ = "waste_items"
    
    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("dmaic_projects.id"))
    organization_id = Column(String(36), nullable=False, index=True)
    
    waste_type = Column(String(50), nullable=False)  # TIMWOODS categories
    description = Column(Text, nullable=False)
    location = Column(String(255))  # Where in the process
    
    # Impact
    frequency = Column(String(20))  # daily, weekly, monthly, occasional
    time_impact = Column(Float)  # Hours wasted per occurrence
    cost_impact = Column(Float)  # Cost per occurrence
    quality_impact = Column(String(20))  # none, low, medium, high
    
    # Status
    status = Column(String(20), default="identified")  # identified, analyzing, improving, eliminated
    root_cause = Column(Text)
    countermeasure = Column(Text)
    
    identified_by = Column(String(36))
    identified_date = Column(DateTime, server_default=func.now())
    resolved_date = Column(DateTime)
    
    created_at = Column(DateTime, server_default=func.now())


# Control Chart Data
class ControlChartData(Base):
    __tablename__ = "control_chart_data"
    
    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("dmaic_projects.id"))
    organization_id = Column(String(36), nullable=False, index=True)
    
    chart_name = Column(String(255), nullable=False)
    chart_type = Column(String(50))  # x_bar, r_chart, p_chart, c_chart, i_mr
    metric_name = Column(String(100))
    unit = Column(String(50))
    
    # Control Limits
    ucl = Column(Float)  # Upper Control Limit
    lcl = Column(Float)  # Lower Control Limit
    center_line = Column(Float)  # Mean/Target
    
    # Specification Limits
    usl = Column(Float)  # Upper Spec Limit
    lsl = Column(Float)  # Lower Spec Limit
    target = Column(Float)
    
    # Data points stored as JSON array
    data_points = Column(JSON, default=list)
    # Each point: {timestamp, value, subgroup_size, notes}
    
    # Capability metrics
    cp = Column(Float)  # Process Capability
    cpk = Column(Float)  # Process Capability Index
    pp = Column(Float)  # Process Performance
    ppk = Column(Float)  # Process Performance Index
    sigma_level = Column(Float)  # Sigma level (e.g., 6 sigma)
    dpmo = Column(Float)  # Defects Per Million Opportunities
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# Pareto Analysis
class ParetoAnalysis(Base):
    __tablename__ = "pareto_analyses"
    
    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("dmaic_projects.id"))
    organization_id = Column(String(36), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category_type = Column(String(100))  # defect_type, cause, location, etc.
    
    # Data items stored as JSON
    items = Column(JSON, default=list)
    # Each item: {category, count, percentage, cumulative_percentage}
    
    total_count = Column(Integer)
    vital_few_threshold = Column(Float, default=80)  # 80/20 rule
    vital_few_categories = Column(JSON, default=list)  # Categories causing 80% of issues
    
    analysis_date = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())


# Root Cause Analysis (5 Whys / Fishbone)
class RootCauseAnalysis(Base):
    __tablename__ = "root_cause_analyses"
    
    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("dmaic_projects.id"))
    organization_id = Column(String(36), nullable=False, index=True)
    
    problem_statement = Column(Text, nullable=False)
    analysis_type = Column(String(50))  # five_whys, fishbone, fault_tree
    
    # 5 Whys stored as JSON
    five_whys = Column(JSON, default=list)
    # Each: {why_number, question, answer}
    
    # Fishbone categories (6M: Man, Machine, Method, Material, Measurement, Mother Nature)
    fishbone_data = Column(JSON, default=dict)
    # {category: [{cause, sub_causes: []}]}
    
    root_causes = Column(JSON, default=list)  # Identified root causes
    verified = Column(Boolean, default=False)
    verification_method = Column(Text)
    
    created_by = Column(String(36))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# Kaizen Event
class KaizenEvent(Base):
    __tablename__ = "kaizen_events"
    
    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("dmaic_projects.id"))
    organization_id = Column(String(36), nullable=False, index=True)
    
    name = Column(String(255), nullable=False)
    description = Column(Text)
    event_type = Column(String(50))  # rapid, standard, blitz
    
    # Focus area
    focus_area = Column(String(255))
    target_process = Column(String(255))
    
    # Team
    facilitator_id = Column(String(36))
    team_members = Column(JSON, default=list)
    
    # Schedule
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    duration_days = Column(Integer)
    
    # Goals
    goals = Column(JSON, default=list)
    # Each: {metric, baseline, target, actual}
    
    # Improvements
    improvements_identified = Column(JSON, default=list)
    improvements_implemented = Column(JSON, default=list)
    
    # Results
    before_state = Column(JSON, default=dict)
    after_state = Column(JSON, default=dict)
    savings_achieved = Column(Float, default=0)
    
    # Status
    status = Column(String(20), default="planned")  # planned, in_progress, completed
    lessons_learned = Column(JSON, default=list)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# Improvement Action
class ImprovementAction(Base):
    __tablename__ = "improvement_actions"
    
    id = Column(String(36), primary_key=True)
    project_id = Column(String(36), ForeignKey("dmaic_projects.id"))
    kaizen_id = Column(String(36), ForeignKey("kaizen_events.id"))
    organization_id = Column(String(36), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text)
    action_type = Column(String(50))  # quick_win, project, policy_change, training
    
    # Assignment
    assigned_to = Column(String(36))
    due_date = Column(DateTime)
    
    # Impact
    expected_impact = Column(Text)
    expected_savings = Column(Float)
    actual_savings = Column(Float)
    
    # Status
    status = Column(String(20), default="pending")  # pending, in_progress, completed, cancelled
    completion_date = Column(DateTime)
    
    # Verification
    verified = Column(Boolean, default=False)
    verification_notes = Column(Text)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


# Lean Metrics / KPIs
class LeanMetric(Base):
    __tablename__ = "lean_metrics"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False, index=True)
    project_id = Column(String(36), ForeignKey("dmaic_projects.id"))
    
    name = Column(String(100), nullable=False)
    category = Column(String(50))  # quality, delivery, cost, safety, morale
    
    # Current values
    current_value = Column(Float)
    target_value = Column(Float)
    baseline_value = Column(Float)
    unit = Column(String(50))
    
    # Trend
    trend = Column(String(20))  # improving, stable, declining
    trend_percentage = Column(Float)
    
    # Historical data
    history = Column(JSON, default=list)
    # Each: {date, value}
    
    # Thresholds
    red_threshold = Column(Float)  # Below this is red
    yellow_threshold = Column(Float)  # Below this is yellow
    green_threshold = Column(Float)  # Above this is green
    
    last_updated = Column(DateTime, server_default=func.now())
    created_at = Column(DateTime, server_default=func.now())


# OEE (Overall Equipment Effectiveness) Tracking
class OEERecord(Base):
    __tablename__ = "oee_records"
    
    id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), nullable=False, index=True)
    
    equipment_name = Column(String(255), nullable=False)
    equipment_id = Column(String(100))
    
    record_date = Column(DateTime, nullable=False)
    shift = Column(String(20))  # day, night, etc.
    
    # Availability
    planned_production_time = Column(Float)  # minutes
    actual_run_time = Column(Float)
    downtime = Column(Float)
    availability = Column(Float)  # actual_run_time / planned_production_time
    
    # Performance
    ideal_cycle_time = Column(Float)  # minutes per unit
    total_units_produced = Column(Integer)
    performance = Column(Float)  # (ideal_cycle_time * total_units) / actual_run_time
    
    # Quality
    good_units = Column(Integer)
    defective_units = Column(Integer)
    quality = Column(Float)  # good_units / total_units
    
    # OEE
    oee = Column(Float)  # availability * performance * quality
    
    # Losses breakdown
    downtime_losses = Column(JSON, default=list)  # {reason, duration}
    speed_losses = Column(JSON, default=list)
    quality_losses = Column(JSON, default=list)
    
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

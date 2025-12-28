"""
Lean Six Sigma API Endpoints
DMAIC projects, process mapping, statistical tools, and Kaizen events
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime
import uuid

from app.core.security import get_current_user
from app.services.lean_sixsigma_service import (
    LeanSixSigmaService, StatisticalAnalysisService, KaizenService
)
from app.schemas.lean_sixsigma import (
    DMAICProjectCreate, DMAICProjectUpdate, DMAICProjectResponse,
    SIPOCCreate, SIPOCResponse,
    ProcessMapCreate, ProcessMapResponse,
    WasteItemCreate, WasteItemUpdate, WasteItemResponse,
    ControlChartCreate, ControlChartResponse,
    ParetoAnalysisCreate, ParetoAnalysisResponse,
    RootCauseAnalysisCreate, RootCauseAnalysisResponse,
    KaizenEventCreate, KaizenEventUpdate, KaizenEventResponse,
    ImprovementActionCreate, ImprovementActionUpdate, ImprovementActionResponse,
    OEERecordCreate, OEERecordResponse,
    LeanMetricCreate, LeanMetricResponse,
    LeanSixSigmaDashboard
)

router = APIRouter()

# In-memory storage for demo (replace with database in production)
projects_db = {}
sipocs_db = {}
process_maps_db = {}
waste_items_db = {}
control_charts_db = {}
pareto_analyses_db = {}
rca_db = {}
kaizen_events_db = {}
improvement_actions_db = {}
oee_records_db = {}
lean_metrics_db = {}


# ==================== DMAIC Projects ====================

@router.get("/dashboard", response_model=LeanSixSigmaDashboard)
async def get_lean_dashboard(current_user: dict = Depends(get_current_user)):
    """Get Lean Six Sigma dashboard summary"""
    org_id = current_user.get("organization_id", "default")
    
    org_projects = [p for p in projects_db.values() if p.get("organization_id") == org_id]
    org_wastes = [w for w in waste_items_db.values() if w.get("organization_id") == org_id]
    org_kaizens = [k for k in kaizen_events_db.values() if k.get("organization_id") == org_id]
    org_oee = [o for o in oee_records_db.values() if o.get("organization_id") == org_id]
    org_actions = [a for a in improvement_actions_db.values() if a.get("organization_id") == org_id]
    
    active_projects = len([p for p in org_projects if p.get("status") == "active"])
    completed_projects = len([p for p in org_projects if p.get("status") == "completed"])
    total_savings = sum(p.get("actual_savings", 0) for p in org_projects)
    
    # Projects by phase
    projects_by_phase = {}
    for p in org_projects:
        phase = p.get("current_phase", "define")
        projects_by_phase[phase] = projects_by_phase.get(phase, 0) + 1
    
    # Projects by belt level
    projects_by_belt = {}
    for p in org_projects:
        belt = p.get("belt_level", "green")
        projects_by_belt[belt] = projects_by_belt.get(belt, 0) + 1
    
    # Waste stats
    waste_identified = len(org_wastes)
    waste_eliminated = len([w for w in org_wastes if w.get("status") == "eliminated"])
    
    # Kaizen stats
    kaizen_completed = len([k for k in org_kaizens if k.get("status") == "completed"])
    
    # Average OEE
    avg_oee = None
    if org_oee:
        avg_oee = sum(o.get("oee", 0) for o in org_oee) / len(org_oee)
    
    # Top projects (by savings)
    top_projects = sorted(org_projects, key=lambda x: x.get("actual_savings", 0), reverse=True)[:5]
    
    # Recent improvements
    recent_improvements = sorted(org_actions, key=lambda x: x.get("created_at", datetime.min), reverse=True)[:5]
    
    return {
        "active_projects": active_projects,
        "completed_projects": completed_projects,
        "total_savings": total_savings,
        "projects_by_phase": projects_by_phase,
        "projects_by_belt": projects_by_belt,
        "waste_items_identified": waste_identified,
        "waste_items_eliminated": waste_eliminated,
        "kaizen_events_completed": kaizen_completed,
        "average_oee": round(avg_oee, 2) if avg_oee else None,
        "top_projects": top_projects,
        "recent_improvements": recent_improvements
    }


@router.post("/projects", response_model=DMAICProjectResponse)
async def create_project(
    data: DMAICProjectCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new DMAIC project"""
    org_id = current_user.get("organization_id", "default")
    project = LeanSixSigmaService.create_project(None, org_id, data.dict())
    projects_db[project["id"]] = project
    return project


@router.get("/projects", response_model=List[DMAICProjectResponse])
async def list_projects(
    phase: Optional[str] = None,
    status: Optional[str] = None,
    belt_level: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all DMAIC projects"""
    org_id = current_user.get("organization_id", "default")
    projects = [p for p in projects_db.values() if p.get("organization_id") == org_id]
    
    if phase:
        projects = [p for p in projects if p.get("current_phase") == phase]
    if status:
        projects = [p for p in projects if p.get("status") == status]
    if belt_level:
        projects = [p for p in projects if p.get("belt_level") == belt_level]
    
    return sorted(projects, key=lambda x: x.get("created_at", datetime.min), reverse=True)


@router.get("/projects/{project_id}", response_model=DMAICProjectResponse)
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific DMAIC project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_db[project_id]


@router.put("/projects/{project_id}", response_model=DMAICProjectResponse)
async def update_project(
    project_id: str,
    data: DMAICProjectUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a DMAIC project"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = projects_db[project_id]
    update_data = data.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        if value is not None:
            project[key] = value
    
    project["updated_at"] = datetime.utcnow()
    projects_db[project_id] = project
    return project


@router.post("/projects/{project_id}/advance-phase", response_model=DMAICProjectResponse)
async def advance_project_phase(project_id: str, current_user: dict = Depends(get_current_user)):
    """Advance project to next DMAIC phase"""
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = LeanSixSigmaService.advance_phase(projects_db[project_id])
    projects_db[project_id] = project
    return project


# ==================== SIPOC ====================

@router.post("/projects/{project_id}/sipoc", response_model=SIPOCResponse)
async def create_sipoc(
    project_id: str,
    data: SIPOCCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a SIPOC diagram for a project"""
    org_id = current_user.get("organization_id", "default")
    sipoc = LeanSixSigmaService.create_sipoc(None, org_id, project_id, data.dict())
    sipocs_db[sipoc["id"]] = sipoc
    return sipoc


@router.get("/projects/{project_id}/sipoc", response_model=List[SIPOCResponse])
async def get_project_sipocs(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get all SIPOC diagrams for a project"""
    return [s for s in sipocs_db.values() if s.get("project_id") == project_id]


# ==================== Process Maps ====================

@router.post("/process-maps", response_model=ProcessMapResponse)
async def create_process_map(
    data: ProcessMapCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a process map with value stream analysis"""
    org_id = current_user.get("organization_id", "default")
    process_map = LeanSixSigmaService.create_process_map(None, org_id, data.dict())
    process_maps_db[process_map["id"]] = process_map
    return process_map


@router.get("/process-maps", response_model=List[ProcessMapResponse])
async def list_process_maps(
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all process maps"""
    org_id = current_user.get("organization_id", "default")
    maps = [m for m in process_maps_db.values() if m.get("organization_id") == org_id]
    
    if project_id:
        maps = [m for m in maps if m.get("project_id") == project_id]
    
    return maps


@router.get("/process-maps/{map_id}", response_model=ProcessMapResponse)
async def get_process_map(map_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific process map"""
    if map_id not in process_maps_db:
        raise HTTPException(status_code=404, detail="Process map not found")
    return process_maps_db[map_id]


# ==================== Waste Tracking ====================

@router.post("/waste", response_model=WasteItemResponse)
async def create_waste_item(
    data: WasteItemCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a waste item (TIMWOODS)"""
    org_id = current_user.get("organization_id", "default")
    waste = LeanSixSigmaService.create_waste_item(None, org_id, data.dict())
    waste_items_db[waste["id"]] = waste
    return waste


@router.get("/waste", response_model=List[WasteItemResponse])
async def list_waste_items(
    waste_type: Optional[str] = None,
    status: Optional[str] = None,
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all waste items"""
    org_id = current_user.get("organization_id", "default")
    wastes = [w for w in waste_items_db.values() if w.get("organization_id") == org_id]
    
    if waste_type:
        wastes = [w for w in wastes if w.get("waste_type") == waste_type]
    if status:
        wastes = [w for w in wastes if w.get("status") == status]
    if project_id:
        wastes = [w for w in wastes if w.get("project_id") == project_id]
    
    return wastes


@router.put("/waste/{waste_id}", response_model=WasteItemResponse)
async def update_waste_item(
    waste_id: str,
    data: WasteItemUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a waste item"""
    if waste_id not in waste_items_db:
        raise HTTPException(status_code=404, detail="Waste item not found")
    
    waste = waste_items_db[waste_id]
    update_data = data.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        if value is not None:
            waste[key] = value
    
    waste_items_db[waste_id] = waste
    return waste


@router.get("/waste/summary")
async def get_waste_summary(current_user: dict = Depends(get_current_user)):
    """Get waste summary by type (TIMWOODS)"""
    org_id = current_user.get("organization_id", "default")
    wastes = [w for w in waste_items_db.values() if w.get("organization_id") == org_id]
    return LeanSixSigmaService.get_waste_summary(wastes)


# ==================== Statistical Tools ====================

@router.post("/control-charts", response_model=ControlChartResponse)
async def create_control_chart(
    data: ControlChartCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a control chart with calculated limits"""
    org_id = current_user.get("organization_id", "default")
    chart_id = str(uuid.uuid4())
    
    data_values = [dp.value for dp in data.data_points]
    limits = StatisticalAnalysisService.calculate_control_limits(data_values, data.chart_type)
    
    capability = {}
    if data.usl is not None and data.lsl is not None:
        capability = StatisticalAnalysisService.calculate_capability(data_values, data.usl, data.lsl)
    
    chart = {
        "id": chart_id,
        "organization_id": org_id,
        "project_id": data.project_id,
        "chart_name": data.chart_name,
        "chart_type": data.chart_type,
        "metric_name": data.metric_name,
        "unit": data.unit,
        "ucl": limits["ucl"],
        "lcl": limits["lcl"],
        "center_line": limits["center_line"],
        "usl": data.usl,
        "lsl": data.lsl,
        "target": data.target,
        "data_points": [dp.dict() for dp in data.data_points],
        "cp": capability.get("cp"),
        "cpk": capability.get("cpk"),
        "sigma_level": capability.get("sigma_level"),
        "dpmo": capability.get("dpmo"),
        "created_at": datetime.utcnow()
    }
    
    control_charts_db[chart_id] = chart
    return chart


@router.get("/control-charts", response_model=List[ControlChartResponse])
async def list_control_charts(
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all control charts"""
    org_id = current_user.get("organization_id", "default")
    charts = [c for c in control_charts_db.values() if c.get("organization_id") == org_id]
    
    if project_id:
        charts = [c for c in charts if c.get("project_id") == project_id]
    
    return charts


@router.post("/pareto-analysis", response_model=ParetoAnalysisResponse)
async def create_pareto_analysis(
    data: ParetoAnalysisCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a Pareto analysis"""
    org_id = current_user.get("organization_id", "default")
    analysis_id = str(uuid.uuid4())
    
    pareto_result = StatisticalAnalysisService.create_pareto_analysis(
        [item.dict() for item in data.items]
    )
    
    analysis = {
        "id": analysis_id,
        "organization_id": org_id,
        "project_id": data.project_id,
        "name": data.name,
        "description": data.description,
        "category_type": data.category_type,
        "items": pareto_result["items"],
        "total_count": pareto_result["total_count"],
        "vital_few_categories": pareto_result["vital_few_categories"],
        "analysis_date": datetime.utcnow()
    }
    
    pareto_analyses_db[analysis_id] = analysis
    return analysis


@router.get("/pareto-analysis", response_model=List[ParetoAnalysisResponse])
async def list_pareto_analyses(
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all Pareto analyses"""
    org_id = current_user.get("organization_id", "default")
    analyses = [a for a in pareto_analyses_db.values() if a.get("organization_id") == org_id]
    
    if project_id:
        analyses = [a for a in analyses if a.get("project_id") == project_id]
    
    return analyses


# ==================== Root Cause Analysis ====================

@router.post("/root-cause-analysis", response_model=RootCauseAnalysisResponse)
async def create_root_cause_analysis(
    data: RootCauseAnalysisCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a root cause analysis (5 Whys or Fishbone)"""
    org_id = current_user.get("organization_id", "default")
    rca = KaizenService.create_root_cause_analysis(None, org_id, data.dict())
    rca_db[rca["id"]] = rca
    return rca


@router.get("/root-cause-analysis", response_model=List[RootCauseAnalysisResponse])
async def list_root_cause_analyses(
    project_id: Optional[str] = None,
    analysis_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all root cause analyses"""
    org_id = current_user.get("organization_id", "default")
    analyses = [r for r in rca_db.values() if r.get("organization_id") == org_id]
    
    if project_id:
        analyses = [r for r in analyses if r.get("project_id") == project_id]
    if analysis_type:
        analyses = [r for r in analyses if r.get("analysis_type") == analysis_type]
    
    return analyses


# ==================== Kaizen Events ====================

@router.post("/kaizen", response_model=KaizenEventResponse)
async def create_kaizen_event(
    data: KaizenEventCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new Kaizen event"""
    org_id = current_user.get("organization_id", "default")
    kaizen = KaizenService.create_kaizen_event(None, org_id, data.dict())
    kaizen_events_db[kaizen["id"]] = kaizen
    return kaizen


@router.get("/kaizen", response_model=List[KaizenEventResponse])
async def list_kaizen_events(
    status: Optional[str] = None,
    event_type: Optional[str] = None,
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all Kaizen events"""
    org_id = current_user.get("organization_id", "default")
    events = [k for k in kaizen_events_db.values() if k.get("organization_id") == org_id]
    
    if status:
        events = [k for k in events if k.get("status") == status]
    if event_type:
        events = [k for k in events if k.get("event_type") == event_type]
    if project_id:
        events = [k for k in events if k.get("project_id") == project_id]
    
    return sorted(events, key=lambda x: x.get("created_at", datetime.min), reverse=True)


@router.put("/kaizen/{kaizen_id}", response_model=KaizenEventResponse)
async def update_kaizen_event(
    kaizen_id: str,
    data: KaizenEventUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a Kaizen event"""
    if kaizen_id not in kaizen_events_db:
        raise HTTPException(status_code=404, detail="Kaizen event not found")
    
    kaizen = kaizen_events_db[kaizen_id]
    update_data = data.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        if value is not None:
            kaizen[key] = value
    
    kaizen_events_db[kaizen_id] = kaizen
    return kaizen


# ==================== Improvement Actions ====================

@router.post("/improvements", response_model=ImprovementActionResponse)
async def create_improvement_action(
    data: ImprovementActionCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create an improvement action"""
    org_id = current_user.get("organization_id", "default")
    action = KaizenService.create_improvement_action(None, org_id, data.dict())
    improvement_actions_db[action["id"]] = action
    return action


@router.get("/improvements", response_model=List[ImprovementActionResponse])
async def list_improvement_actions(
    status: Optional[str] = None,
    project_id: Optional[str] = None,
    kaizen_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all improvement actions"""
    org_id = current_user.get("organization_id", "default")
    actions = [a for a in improvement_actions_db.values() if a.get("organization_id") == org_id]
    
    if status:
        actions = [a for a in actions if a.get("status") == status]
    if project_id:
        actions = [a for a in actions if a.get("project_id") == project_id]
    if kaizen_id:
        actions = [a for a in actions if a.get("kaizen_id") == kaizen_id]
    
    return sorted(actions, key=lambda x: x.get("created_at", datetime.min), reverse=True)


@router.put("/improvements/{action_id}", response_model=ImprovementActionResponse)
async def update_improvement_action(
    action_id: str,
    data: ImprovementActionUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an improvement action"""
    if action_id not in improvement_actions_db:
        raise HTTPException(status_code=404, detail="Improvement action not found")
    
    action = improvement_actions_db[action_id]
    update_data = data.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        if value is not None:
            action[key] = value
    
    improvement_actions_db[action_id] = action
    return action


# ==================== OEE Records ====================

@router.post("/oee", response_model=OEERecordResponse)
async def create_oee_record(
    data: OEERecordCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create an OEE record"""
    org_id = current_user.get("organization_id", "default")
    record_id = str(uuid.uuid4())
    
    oee_result = StatisticalAnalysisService.calculate_oee(
        data.planned_production_time,
        data.actual_run_time,
        data.ideal_cycle_time,
        data.total_units_produced,
        data.good_units
    )
    
    record = {
        "id": record_id,
        "organization_id": org_id,
        "equipment_name": data.equipment_name,
        "equipment_id": data.equipment_id,
        "record_date": data.record_date,
        "shift": data.shift,
        "availability": oee_result["availability"],
        "performance": oee_result["performance"],
        "quality": oee_result["quality"],
        "oee": oee_result["oee"],
        "total_units_produced": data.total_units_produced,
        "good_units": data.good_units,
        "defective_units": oee_result["defective_units"],
        "downtime_losses": [dl.dict() for dl in data.downtime_losses],
        "notes": data.notes,
        "created_at": datetime.utcnow()
    }
    
    oee_records_db[record_id] = record
    return record


@router.get("/oee", response_model=List[OEERecordResponse])
async def list_oee_records(
    equipment_name: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all OEE records"""
    org_id = current_user.get("organization_id", "default")
    records = [r for r in oee_records_db.values() if r.get("organization_id") == org_id]
    
    if equipment_name:
        records = [r for r in records if r.get("equipment_name") == equipment_name]
    
    return sorted(records, key=lambda x: x.get("record_date", datetime.min), reverse=True)


# ==================== Lean Metrics ====================

@router.post("/metrics", response_model=LeanMetricResponse)
async def create_lean_metric(
    data: LeanMetricCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a lean metric"""
    org_id = current_user.get("organization_id", "default")
    metric_id = str(uuid.uuid4())
    
    metric = {
        "id": metric_id,
        "organization_id": org_id,
        "project_id": data.project_id,
        "name": data.name,
        "category": data.category,
        "current_value": data.current_value,
        "target_value": data.target_value,
        "baseline_value": data.baseline_value,
        "unit": data.unit,
        "red_threshold": data.red_threshold,
        "yellow_threshold": data.yellow_threshold,
        "green_threshold": data.green_threshold,
        "trend": None,
        "trend_percentage": None,
        "history": [{"value": data.current_value, "timestamp": datetime.utcnow().isoformat()}],
        "last_updated": datetime.utcnow()
    }
    
    lean_metrics_db[metric_id] = metric
    return metric


@router.get("/metrics", response_model=List[LeanMetricResponse])
async def list_lean_metrics(
    category: Optional[str] = None,
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all lean metrics"""
    org_id = current_user.get("organization_id", "default")
    metrics = [m for m in lean_metrics_db.values() if m.get("organization_id") == org_id]
    
    if category:
        metrics = [m for m in metrics if m.get("category") == category]
    if project_id:
        metrics = [m for m in metrics if m.get("project_id") == project_id]
    
    return metrics

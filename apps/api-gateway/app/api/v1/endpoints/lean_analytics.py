"""
Lean Six Sigma Advanced Analytics API Endpoints
AI-powered recommendations, control charts, capability analysis, and process mapping
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
import uuid
import io

from app.core.security import get_current_user
from app.services.lean_analytics_service import LeanAnalyticsService, ProcessMappingService
from app.services.lean_sixsigma_ai_service import LeanSixSigmaAIService
from app.services.export_service import ExportService

router = APIRouter()

# In-memory storage for demo
sipoc_diagrams_db = {}
vsm_db = {}
process_flows_db = {}
control_charts_db = {}
capability_studies_db = {}
ai_recommendations_db = {}


# ==================== Pydantic Models ====================

class ControlChartRequest(BaseModel):
    name: str
    chart_type: str = "xbar_r"  # xbar_r, i_mr
    subgroup_size: int = 5
    data: List[List[float]]  # For xbar_r: list of subgroups
    usl: Optional[float] = None
    lsl: Optional[float] = None


class IndividualsChartRequest(BaseModel):
    name: str
    data: List[float]
    usl: Optional[float] = None
    lsl: Optional[float] = None


class ParetoRequest(BaseModel):
    categories: List[str]
    values: List[float]
    labels: Optional[List[str]] = None


class CapabilityRequest(BaseModel):
    name: str
    process_name: str
    characteristic: str
    data: List[float]
    usl: float
    lsl: float
    target: Optional[float] = None


class SIPOCRequest(BaseModel):
    name: str
    description: Optional[str] = None
    process_owner: Optional[str] = None
    suppliers: List[Dict[str, Any]] = []
    inputs: List[Dict[str, Any]] = []
    process_steps: List[Dict[str, Any]] = []
    outputs: List[Dict[str, Any]] = []
    customers: List[Dict[str, Any]] = []


class VSMRequest(BaseModel):
    name: str
    description: Optional[str] = None
    product_family: Optional[str] = None
    customer_demand: Optional[float] = None
    process_steps: List[Dict[str, Any]] = []
    information_flow: List[Dict[str, Any]] = []
    material_flow: List[Dict[str, Any]] = []


class ProcessFlowRequest(BaseModel):
    name: str
    description: Optional[str] = None
    process_type: str = "manufacturing"
    nodes: List[Dict[str, Any]] = []
    connections: List[Dict[str, Any]] = []
    swimlanes: List[Dict[str, Any]] = []


class AIAnalysisRequest(BaseModel):
    analysis_type: str  # dmaic, waste, kaizen, rca, capability, oee_trend, bottleneck
    data: Dict[str, Any]


class OEETrendRequest(BaseModel):
    oee_history: List[Dict[str, Any]]
    forecast_days: int = 30


class BottleneckRequest(BaseModel):
    process_data: List[Dict[str, Any]]


class TaktTimeRequest(BaseModel):
    available_time_minutes: float
    demand_units: int


# ==================== Control Charts ====================

@router.post("/control-charts/xbar-r")
async def create_xbar_r_chart(
    request: ControlChartRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create X-bar and R control chart analysis"""
    org_id = current_user.get("organization_id", "default")
    
    analytics = LeanAnalyticsService(None, org_id)
    result = analytics.calculate_xbar_r_chart(request.data, request.subgroup_size)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Store the chart
    chart_id = str(uuid.uuid4())
    chart_record = {
        "id": chart_id,
        "organization_id": org_id,
        "name": request.name,
        "chart_type": "xbar_r",
        "subgroup_size": request.subgroup_size,
        "usl": request.usl,
        "lsl": request.lsl,
        "analysis": result,
        "created_at": datetime.utcnow().isoformat()
    }
    control_charts_db[chart_id] = chart_record
    
    return {
        "id": chart_id,
        "name": request.name,
        **result
    }


@router.post("/control-charts/i-mr")
async def create_individuals_chart(
    request: IndividualsChartRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create Individuals and Moving Range (I-MR) control chart"""
    org_id = current_user.get("organization_id", "default")
    
    analytics = LeanAnalyticsService(None, org_id)
    result = analytics.calculate_individuals_chart(request.data)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    chart_id = str(uuid.uuid4())
    chart_record = {
        "id": chart_id,
        "organization_id": org_id,
        "name": request.name,
        "chart_type": "i_mr",
        "usl": request.usl,
        "lsl": request.lsl,
        "analysis": result,
        "created_at": datetime.utcnow().isoformat()
    }
    control_charts_db[chart_id] = chart_record
    
    return {
        "id": chart_id,
        "name": request.name,
        **result
    }


@router.get("/control-charts")
async def list_control_charts(current_user: dict = Depends(get_current_user)):
    """List all control charts"""
    org_id = current_user.get("organization_id", "default")
    charts = [c for c in control_charts_db.values() if c.get("organization_id") == org_id]
    return sorted(charts, key=lambda x: x.get("created_at", ""), reverse=True)


@router.get("/control-charts/{chart_id}")
async def get_control_chart(chart_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific control chart"""
    if chart_id not in control_charts_db:
        raise HTTPException(status_code=404, detail="Control chart not found")
    return control_charts_db[chart_id]


# ==================== Pareto Analysis ====================

@router.post("/pareto-analysis")
async def perform_pareto_analysis(
    request: ParetoRequest,
    current_user: dict = Depends(get_current_user)
):
    """Perform Pareto analysis (80/20 rule)"""
    org_id = current_user.get("organization_id", "default")
    
    analytics = LeanAnalyticsService(None, org_id)
    result = analytics.pareto_analysis(request.categories, request.values, request.labels)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


# ==================== Capability Analysis ====================

@router.post("/capability-analysis")
async def perform_capability_analysis(
    request: CapabilityRequest,
    current_user: dict = Depends(get_current_user)
):
    """Perform process capability analysis (Cp, Cpk, Sigma Level)"""
    org_id = current_user.get("organization_id", "default")
    
    analytics = LeanAnalyticsService(None, org_id)
    result = analytics.process_capability_analysis(
        request.data, 
        request.usl, 
        request.lsl, 
        request.target
    )
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    # Store the study
    study_id = str(uuid.uuid4())
    study_record = {
        "id": study_id,
        "organization_id": org_id,
        "name": request.name,
        "process_name": request.process_name,
        "characteristic": request.characteristic,
        "usl": request.usl,
        "lsl": request.lsl,
        "target": request.target,
        "raw_data": request.data,
        "analysis": result,
        "created_at": datetime.utcnow().isoformat()
    }
    capability_studies_db[study_id] = study_record
    
    return {
        "id": study_id,
        "name": request.name,
        **result
    }


@router.get("/capability-studies")
async def list_capability_studies(current_user: dict = Depends(get_current_user)):
    """List all capability studies"""
    org_id = current_user.get("organization_id", "default")
    studies = [s for s in capability_studies_db.values() if s.get("organization_id") == org_id]
    return sorted(studies, key=lambda x: x.get("created_at", ""), reverse=True)


# ==================== Predictive Analytics ====================

@router.post("/predict/oee-trend")
async def predict_oee_trend(
    request: OEETrendRequest,
    current_user: dict = Depends(get_current_user)
):
    """Predict OEE trends using historical data"""
    org_id = current_user.get("organization_id", "default")
    
    analytics = LeanAnalyticsService(None, org_id)
    result = analytics.predict_oee_trend(request.oee_history, request.forecast_days)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/analyze/bottlenecks")
async def identify_bottlenecks(
    request: BottleneckRequest,
    current_user: dict = Depends(get_current_user)
):
    """Identify process bottlenecks"""
    org_id = current_user.get("organization_id", "default")
    
    analytics = LeanAnalyticsService(None, org_id)
    result = analytics.identify_bottlenecks(request.process_data)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.post("/calculate/takt-time")
async def calculate_takt_time(
    request: TaktTimeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Calculate takt time"""
    org_id = current_user.get("organization_id", "default")
    
    mapping = ProcessMappingService(None, org_id)
    result = mapping.calculate_takt_time(request.available_time_minutes, request.demand_units)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


# ==================== AI-Powered Recommendations ====================

@router.post("/ai/analyze")
async def ai_analysis(
    request: AIAnalysisRequest,
    current_user: dict = Depends(get_current_user)
):
    """Get AI-powered analysis and recommendations"""
    org_id = current_user.get("organization_id", "default")
    
    ai_service = LeanSixSigmaAIService(None, org_id)
    
    analysis_type = request.analysis_type.lower()
    data = request.data
    
    try:
        if analysis_type == "dmaic":
            result = await ai_service.analyze_dmaic_project(data)
        elif analysis_type == "waste":
            result = await ai_service.analyze_waste(data.get("waste_items", []))
        elif analysis_type == "kaizen":
            result = await ai_service.suggest_kaizen_improvements(data)
        elif analysis_type == "rca":
            result = await ai_service.perform_root_cause_analysis(data)
        elif analysis_type == "capability":
            result = await ai_service.calculate_process_capability(data)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown analysis type: {analysis_type}")
        
        # Store recommendation
        rec_id = str(uuid.uuid4())
        ai_recommendations_db[rec_id] = {
            "id": rec_id,
            "organization_id": org_id,
            "analysis_type": analysis_type,
            "input_data": data,
            "result": result,
            "created_at": datetime.utcnow().isoformat()
        }
        
        return {
            "id": rec_id,
            "analysis_type": analysis_type,
            **result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ai/recommendations")
async def list_ai_recommendations(
    analysis_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all AI recommendations"""
    org_id = current_user.get("organization_id", "default")
    recs = [r for r in ai_recommendations_db.values() if r.get("organization_id") == org_id]
    
    if analysis_type:
        recs = [r for r in recs if r.get("analysis_type") == analysis_type]
    
    return sorted(recs, key=lambda x: x.get("created_at", ""), reverse=True)[:20]


# ==================== SIPOC Diagrams ====================

@router.post("/sipoc")
async def create_sipoc(
    request: SIPOCRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a SIPOC diagram"""
    org_id = current_user.get("organization_id", "default")
    
    mapping = ProcessMappingService(None, org_id)
    
    sipoc_id = str(uuid.uuid4())
    sipoc_data = {
        "id": sipoc_id,
        "organization_id": org_id,
        "name": request.name,
        "description": request.description,
        "process_owner": request.process_owner,
        "suppliers": request.suppliers,
        "inputs": request.inputs,
        "process_steps": request.process_steps,
        "outputs": request.outputs,
        "customers": request.customers,
        "status": "draft",
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Analyze SIPOC
    analysis = mapping._analyze_sipoc(sipoc_data)
    sipoc_data["analysis"] = analysis
    
    sipoc_diagrams_db[sipoc_id] = sipoc_data
    
    return sipoc_data


@router.get("/sipoc")
async def list_sipoc_diagrams(current_user: dict = Depends(get_current_user)):
    """List all SIPOC diagrams"""
    org_id = current_user.get("organization_id", "default")
    sipocs = [s for s in sipoc_diagrams_db.values() if s.get("organization_id") == org_id]
    return sorted(sipocs, key=lambda x: x.get("created_at", ""), reverse=True)


@router.get("/sipoc/{sipoc_id}")
async def get_sipoc(sipoc_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific SIPOC diagram"""
    if sipoc_id not in sipoc_diagrams_db:
        raise HTTPException(status_code=404, detail="SIPOC diagram not found")
    return sipoc_diagrams_db[sipoc_id]


@router.put("/sipoc/{sipoc_id}")
async def update_sipoc(
    sipoc_id: str,
    request: SIPOCRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update a SIPOC diagram"""
    if sipoc_id not in sipoc_diagrams_db:
        raise HTTPException(status_code=404, detail="SIPOC diagram not found")
    
    org_id = current_user.get("organization_id", "default")
    mapping = ProcessMappingService(None, org_id)
    
    sipoc = sipoc_diagrams_db[sipoc_id]
    sipoc.update({
        "name": request.name,
        "description": request.description,
        "process_owner": request.process_owner,
        "suppliers": request.suppliers,
        "inputs": request.inputs,
        "process_steps": request.process_steps,
        "outputs": request.outputs,
        "customers": request.customers,
        "updated_at": datetime.utcnow().isoformat()
    })
    
    # Re-analyze
    sipoc["analysis"] = mapping._analyze_sipoc(sipoc)
    
    sipoc_diagrams_db[sipoc_id] = sipoc
    return sipoc


# ==================== Value Stream Maps ====================

@router.post("/vsm")
async def create_vsm(
    request: VSMRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Value Stream Map"""
    org_id = current_user.get("organization_id", "default")
    
    mapping = ProcessMappingService(None, org_id)
    
    vsm_data = {
        "id": str(uuid.uuid4()),
        "name": request.name,
        "description": request.description,
        "product_family": request.product_family,
        "customer_demand": request.customer_demand,
        "process_steps": request.process_steps,
        "information_flow": request.information_flow,
        "material_flow": request.material_flow
    }
    
    result = mapping.create_value_stream_map(vsm_data)
    result["organization_id"] = org_id
    
    vsm_db[result["id"]] = result
    
    return result


@router.get("/vsm")
async def list_vsm(current_user: dict = Depends(get_current_user)):
    """List all Value Stream Maps"""
    org_id = current_user.get("organization_id", "default")
    vsms = [v for v in vsm_db.values() if v.get("organization_id") == org_id]
    return sorted(vsms, key=lambda x: x.get("created_at", ""), reverse=True)


@router.get("/vsm/{vsm_id}")
async def get_vsm(vsm_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific Value Stream Map"""
    if vsm_id not in vsm_db:
        raise HTTPException(status_code=404, detail="Value Stream Map not found")
    return vsm_db[vsm_id]


# ==================== Process Flow Diagrams ====================

@router.post("/process-flow")
async def create_process_flow(
    request: ProcessFlowRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Process Flow Diagram"""
    org_id = current_user.get("organization_id", "default")
    
    flow_id = str(uuid.uuid4())
    
    # Calculate summary metrics
    nodes = request.nodes
    total_operations = len([n for n in nodes if n.get("type") == "operation"])
    total_decisions = len([n for n in nodes if n.get("type") == "decision"])
    total_delays = len([n for n in nodes if n.get("type") == "delay"])
    total_transports = len([n for n in nodes if n.get("type") == "transport"])
    total_inspections = len([n for n in nodes if n.get("type") == "inspection"])
    total_storage = len([n for n in nodes if n.get("type") == "storage"])
    
    value_added_steps = len([n for n in nodes if n.get("value_added", False)])
    non_value_added_steps = len(nodes) - value_added_steps
    
    total_time = sum(n.get("time", 0) for n in nodes)
    total_distance = sum(n.get("distance", 0) for n in nodes)
    
    flow_data = {
        "id": flow_id,
        "organization_id": org_id,
        "name": request.name,
        "description": request.description,
        "process_type": request.process_type,
        "nodes": nodes,
        "connections": request.connections,
        "swimlanes": request.swimlanes,
        "summary": {
            "total_operations": total_operations,
            "total_decisions": total_decisions,
            "total_delays": total_delays,
            "total_transports": total_transports,
            "total_inspections": total_inspections,
            "total_storage": total_storage,
            "value_added_steps": value_added_steps,
            "non_value_added_steps": non_value_added_steps,
            "total_time": total_time,
            "total_distance": total_distance,
            "value_added_ratio": round(value_added_steps / len(nodes) * 100, 1) if nodes else 0
        },
        "status": "draft",
        "created_at": datetime.utcnow().isoformat()
    }
    
    process_flows_db[flow_id] = flow_data
    
    return flow_data


@router.get("/process-flow")
async def list_process_flows(current_user: dict = Depends(get_current_user)):
    """List all Process Flow Diagrams"""
    org_id = current_user.get("organization_id", "default")
    flows = [f for f in process_flows_db.values() if f.get("organization_id") == org_id]
    return sorted(flows, key=lambda x: x.get("created_at", ""), reverse=True)


@router.get("/process-flow/{flow_id}")
async def get_process_flow(flow_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific Process Flow Diagram"""
    if flow_id not in process_flows_db:
        raise HTTPException(status_code=404, detail="Process Flow Diagram not found")
    return process_flows_db[flow_id]


# ==================== Export Endpoints ====================

@router.get("/export/capability/{study_id}/pdf")
async def export_capability_pdf(study_id: str, current_user: dict = Depends(get_current_user)):
    """Export capability study to PDF"""
    if study_id not in capability_studies_db:
        raise HTTPException(status_code=404, detail="Capability study not found")
    
    study = capability_studies_db[study_id]
    export_service = ExportService()
    
    pdf_bytes = export_service.export_capability_analysis_pdf(
        study.get("analysis", {}),
        study.get("raw_data", [])
    )
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=capability_study_{study_id}.pdf"}
    )


@router.get("/export/capability/{study_id}/excel")
async def export_capability_excel(study_id: str, current_user: dict = Depends(get_current_user)):
    """Export capability study to Excel"""
    if study_id not in capability_studies_db:
        raise HTTPException(status_code=404, detail="Capability study not found")
    
    study = capability_studies_db[study_id]
    export_service = ExportService()
    
    excel_bytes = export_service.export_capability_analysis_excel(
        study.get("analysis", {}),
        study.get("raw_data", [])
    )
    
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=capability_study_{study_id}.xlsx"}
    )


@router.get("/export/control-chart/{chart_id}/excel")
async def export_control_chart_excel(chart_id: str, current_user: dict = Depends(get_current_user)):
    """Export control chart to Excel"""
    if chart_id not in control_charts_db:
        raise HTTPException(status_code=404, detail="Control chart not found")
    
    chart = control_charts_db[chart_id]
    export_service = ExportService()
    
    excel_bytes = export_service.export_control_chart_excel(chart.get("analysis", {}))
    
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=control_chart_{chart_id}.xlsx"}
    )


@router.post("/export/pareto/excel")
async def export_pareto_excel(
    request: ParetoRequest,
    current_user: dict = Depends(get_current_user)
):
    """Export Pareto analysis to Excel"""
    org_id = current_user.get("organization_id", "default")
    
    analytics = LeanAnalyticsService(None, org_id)
    result = analytics.pareto_analysis(request.categories, request.values, request.labels)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    
    export_service = ExportService()
    excel_bytes = export_service.export_pareto_analysis_excel(result)
    
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=pareto_analysis.xlsx"}
    )

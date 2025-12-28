"""
Executive Reporting API Endpoints
Report generation, scheduling, and export functionality
"""
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
import os

from app.services.executive_reporting_service import (
    ExecutiveReportGenerator,
    ReportScheduler,
    get_mock_report_data,
    get_mock_schedules
)

router = APIRouter()

report_generator = ExecutiveReportGenerator()
report_scheduler = ReportScheduler()


# ============== Pydantic Schemas ==============

class ReportGenerateRequest(BaseModel):
    report_type: str = "executive"  # executive, board, sales, operational
    period: str = "current_month"
    include_ai_insights: bool = True
    format: str = "pdf"  # pdf, excel, both

class ScheduleCreateRequest(BaseModel):
    name: str
    report_type: str = "executive"
    frequency: str = "weekly"  # daily, weekly, monthly
    day_of_week: Optional[int] = 1  # 1=Monday, for weekly
    day_of_month: Optional[int] = 1  # For monthly
    time: str = "09:00"
    timezone: str = "UTC"
    recipients: List[str] = []
    format: List[str] = ["pdf"]
    include_ai_insights: bool = True

class ScheduleUpdateRequest(BaseModel):
    name: Optional[str] = None
    frequency: Optional[str] = None
    day_of_week: Optional[int] = None
    day_of_month: Optional[int] = None
    time: Optional[str] = None
    recipients: Optional[List[str]] = None
    format: Optional[List[str]] = None
    include_ai_insights: Optional[bool] = None
    is_active: Optional[bool] = None


# ============== Report Generation Endpoints ==============

@router.get("/types", response_model=dict)
async def get_report_types():
    """Get available report types"""
    return {
        "report_types": [
            {
                "id": "executive",
                "name": "Executive Summary",
                "description": "High-level overview of key metrics and performance",
                "sections": ["KPIs", "Highlights", "Concerns", "Recommendations"],
                "formats": ["pdf", "excel"]
            },
            {
                "id": "board",
                "name": "Board Report",
                "description": "Comprehensive report for board meetings",
                "sections": ["Financial Overview", "Strategic Initiatives", "Risk Assessment", "Outlook"],
                "formats": ["pdf", "excel", "pptx"]
            },
            {
                "id": "sales",
                "name": "Sales Report",
                "description": "Sales performance and pipeline analysis",
                "sections": ["Revenue", "Pipeline", "Win/Loss Analysis", "Forecasts"],
                "formats": ["pdf", "excel"]
            },
            {
                "id": "operational",
                "name": "Operational Report",
                "description": "Operational metrics and efficiency analysis",
                "sections": ["OEE", "Quality Metrics", "Process Efficiency", "Action Items"],
                "formats": ["pdf", "excel"]
            },
            {
                "id": "financial",
                "name": "Financial Report",
                "description": "Detailed financial analysis and statements",
                "sections": ["P&L", "Cash Flow", "Balance Sheet", "Variance Analysis"],
                "formats": ["pdf", "excel"]
            }
        ]
    }


@router.get("/preview", response_model=dict)
async def preview_report(
    report_type: str = Query("executive"),
    period: str = Query("current_month")
):
    """Preview report data before generation"""
    report_data = get_mock_report_data()
    
    return {
        "report_type": report_type,
        "period": period,
        "preview": report_data,
        "available_formats": ["pdf", "excel"],
        "estimated_pages": 5,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.post("/generate", response_model=dict)
async def generate_report(
    request: ReportGenerateRequest,
    background_tasks: BackgroundTasks
):
    """Generate a report"""
    report_data = get_mock_report_data()
    
    # Generate AI insights if requested
    if request.include_ai_insights:
        ai_insights = await report_generator.generate_ai_insights(report_data)
        report_data.update(ai_insights)
    
    files_generated = []
    
    # Generate PDF
    if request.format in ["pdf", "both"]:
        pdf_path = report_generator.generate_pdf_report(report_data, request.report_type)
        files_generated.append({
            "format": "pdf",
            "path": pdf_path,
            "filename": os.path.basename(pdf_path),
            "size": os.path.getsize(pdf_path)
        })
    
    # Generate Excel
    if request.format in ["excel", "both"]:
        excel_path = report_generator.generate_excel_report(report_data, request.report_type)
        files_generated.append({
            "format": "excel",
            "path": excel_path,
            "filename": os.path.basename(excel_path),
            "size": os.path.getsize(excel_path)
        })
    
    return {
        "status": "completed",
        "report_type": request.report_type,
        "period": request.period,
        "files": files_generated,
        "ai_insights_included": request.include_ai_insights,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/download/{filename}")
async def download_report(filename: str):
    """Download a generated report"""
    filepath = os.path.join(report_generator.output_dir, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Determine media type
    if filename.endswith(".pdf"):
        media_type = "application/pdf"
    elif filename.endswith(".xlsx"):
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        media_type = "application/octet-stream"
    
    return FileResponse(
        filepath,
        media_type=media_type,
        filename=filename
    )


@router.get("/history", response_model=dict)
async def get_report_history(
    report_type: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100)
):
    """Get history of generated reports"""
    # Mock report history
    history = [
        {
            "id": 1,
            "report_type": "executive",
            "title": "Monthly Executive Report - December 2024",
            "format": "pdf",
            "filename": "executive_report_20241223_090000.pdf",
            "size": 245678,
            "generated_by": "John Smith",
            "generated_at": "2024-12-23T09:00:00Z",
            "status": "completed"
        },
        {
            "id": 2,
            "report_type": "board",
            "title": "Q4 2024 Board Report",
            "format": "pdf",
            "filename": "board_report_20241220_080000.pdf",
            "size": 567890,
            "generated_by": "Sarah Johnson",
            "generated_at": "2024-12-20T08:00:00Z",
            "status": "completed"
        },
        {
            "id": 3,
            "report_type": "sales",
            "title": "Weekly Sales Report",
            "format": "excel",
            "filename": "sales_report_20241222_070000.xlsx",
            "size": 123456,
            "generated_by": "System (Scheduled)",
            "generated_at": "2024-12-22T07:00:00Z",
            "status": "completed"
        }
    ]
    
    if report_type:
        history = [h for h in history if h["report_type"] == report_type]
    
    return {
        "reports": history[:limit],
        "total": len(history),
        "limit": limit
    }


# ============== Schedule Endpoints ==============

@router.get("/schedules", response_model=dict)
async def get_report_schedules():
    """Get all report schedules"""
    schedules = get_mock_schedules()
    
    return {
        "schedules": schedules,
        "total": len(schedules),
        "active_count": sum(1 for s in schedules if s["is_active"])
    }


@router.post("/schedules", response_model=dict)
async def create_report_schedule(request: ScheduleCreateRequest):
    """Create a new report schedule"""
    schedule = report_scheduler.create_schedule(request.dict())
    
    return {
        "message": "Schedule created successfully",
        "schedule": schedule
    }


@router.get("/schedules/{schedule_id}", response_model=dict)
async def get_schedule(schedule_id: int):
    """Get a specific schedule"""
    schedules = get_mock_schedules()
    schedule = next((s for s in schedules if s["id"] == schedule_id), None)
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    return schedule


@router.put("/schedules/{schedule_id}", response_model=dict)
async def update_schedule(schedule_id: int, request: ScheduleUpdateRequest):
    """Update a report schedule"""
    updates = {k: v for k, v in request.dict().items() if v is not None}
    
    # In production, this would update the database
    return {
        "message": "Schedule updated successfully",
        "schedule_id": schedule_id,
        "updated_fields": list(updates.keys())
    }


@router.delete("/schedules/{schedule_id}", response_model=dict)
async def delete_schedule(schedule_id: int):
    """Delete a report schedule"""
    return {
        "message": "Schedule deleted successfully",
        "schedule_id": schedule_id
    }


@router.post("/schedules/{schedule_id}/run", response_model=dict)
async def run_schedule_now(schedule_id: int, background_tasks: BackgroundTasks):
    """Manually trigger a scheduled report"""
    schedules = get_mock_schedules()
    schedule = next((s for s in schedules if s["id"] == schedule_id), None)
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    # In production, this would trigger the report generation
    return {
        "message": "Report generation triggered",
        "schedule_id": schedule_id,
        "schedule_name": schedule["name"],
        "status": "processing",
        "estimated_completion": "2 minutes"
    }


@router.post("/schedules/{schedule_id}/toggle", response_model=dict)
async def toggle_schedule(schedule_id: int):
    """Enable or disable a schedule"""
    schedules = get_mock_schedules()
    schedule = next((s for s in schedules if s["id"] == schedule_id), None)
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    new_status = not schedule["is_active"]
    
    return {
        "message": f"Schedule {'enabled' if new_status else 'disabled'} successfully",
        "schedule_id": schedule_id,
        "is_active": new_status
    }


# ============== Template Endpoints ==============

@router.get("/templates", response_model=dict)
async def get_report_templates():
    """Get available report templates"""
    templates = [
        {
            "id": 1,
            "name": "Executive Summary Template",
            "report_type": "executive",
            "description": "Standard executive summary with KPIs and recommendations",
            "sections": ["Executive Summary", "Key Metrics", "Highlights", "Concerns", "Recommendations"],
            "is_default": True
        },
        {
            "id": 2,
            "name": "Board Meeting Template",
            "report_type": "board",
            "description": "Comprehensive board report with financial details",
            "sections": ["Executive Summary", "Financial Overview", "Strategic Updates", "Risk Assessment", "Q&A Topics"],
            "is_default": True
        },
        {
            "id": 3,
            "name": "Investor Update Template",
            "report_type": "investor",
            "description": "Monthly investor update format",
            "sections": ["Highlights", "Metrics", "Product Updates", "Team Updates", "Outlook"],
            "is_default": False
        }
    ]
    
    return {
        "templates": templates,
        "total": len(templates)
    }


# ============== Dashboard Endpoint ==============

@router.get("/dashboard", response_model=dict)
async def get_reporting_dashboard():
    """Get reporting dashboard summary"""
    schedules = get_mock_schedules()
    
    return {
        "summary": {
            "total_reports_generated": 47,
            "reports_this_month": 12,
            "active_schedules": sum(1 for s in schedules if s["is_active"]),
            "total_schedules": len(schedules),
            "storage_used_mb": 125.6
        },
        "recent_reports": [
            {
                "title": "Monthly Executive Report",
                "type": "executive",
                "generated_at": "2024-12-23T09:00:00Z",
                "format": "pdf"
            },
            {
                "title": "Weekly Sales Dashboard",
                "type": "sales",
                "generated_at": "2024-12-22T07:00:00Z",
                "format": "excel"
            }
        ],
        "upcoming_scheduled": [
            {
                "name": "Weekly Executive Summary",
                "next_run": "2024-12-30T09:00:00Z",
                "type": "executive"
            },
            {
                "name": "Monthly Board Report",
                "next_run": "2025-01-01T08:00:00Z",
                "type": "board"
            }
        ],
        "popular_reports": [
            {"type": "executive", "count": 24},
            {"type": "sales", "count": 15},
            {"type": "board", "count": 8}
        ],
        "generated_at": datetime.utcnow().isoformat()
    }

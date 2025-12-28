"""
GovernAI API Endpoints - Investments, Compliance, and ESG
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.db.session import get_db
from app.core.security import get_current_user
from app.services.governai.investment_service import (
    InvestmentService, ComplianceService, ESGService
)
from app.schemas.governai import (
    InvestmentCreate, InvestmentUpdate, InvestmentResponse,
    InvestmentAnalysisRequest, InvestmentAnalysisResponse,
    ComplianceItemCreate, ComplianceItemUpdate, ComplianceItemResponse,
    ESGMetricCreate, ESGMetricResponse,
    ESGReportCreate, ESGReportResponse,
    GovernAIDashboard
)

router = APIRouter()


# ============ INVESTMENTS ============

@router.get("/investments", response_model=List[dict])
async def list_investments(
    status: Optional[str] = None,
    investment_type: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all investments"""
    service = InvestmentService(db)
    return await service.list_investments(
        organization_id=current_user.get("organization_id", "demo-org"),
        status=status,
        investment_type=investment_type,
        limit=limit
    )


@router.post("/investments", response_model=dict)
async def create_investment(
    investment: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new investment"""
    service = InvestmentService(db)
    return await service.create_investment(
        organization_id=current_user.get("organization_id", "demo-org"),
        **investment.dict()
    )


@router.get("/investments/portfolio/summary", response_model=dict)
async def get_portfolio_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get portfolio summary"""
    service = InvestmentService(db)
    return await service.get_portfolio_summary(
        organization_id=current_user.get("organization_id", "demo-org")
    )


@router.put("/investments/{investment_id}", response_model=dict)
async def update_investment(
    investment_id: str,
    investment: InvestmentUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update an investment"""
    service = InvestmentService(db)
    return await service.update_investment(investment_id, **investment.dict(exclude_unset=True))


@router.post("/investments/{investment_id}/analyze", response_model=dict)
async def analyze_investment(
    investment_id: str,
    request: InvestmentAnalysisRequest = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """AI-powered investment analysis"""
    service = InvestmentService(db)
    include_comparables = request.include_comparables if request else True
    include_risks = request.include_risks if request else True
    include_projections = request.include_projections if request else True
    
    return await service.analyze_investment(
        investment_id=investment_id,
        include_comparables=include_comparables,
        include_risks=include_risks,
        include_projections=include_projections
    )


# ============ COMPLIANCE ============

@router.get("/compliance", response_model=List[dict])
async def list_compliance_items(
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all compliance items"""
    service = ComplianceService(db)
    return await service.list_compliance_items(
        organization_id=current_user.get("organization_id", "demo-org"),
        status=status,
        category=category,
        limit=limit
    )


@router.post("/compliance", response_model=dict)
async def create_compliance_item(
    item: ComplianceItemCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new compliance item"""
    service = ComplianceService(db)
    return await service.create_compliance_item(
        organization_id=current_user.get("organization_id", "demo-org"),
        **item.dict()
    )


@router.get("/compliance/summary", response_model=dict)
async def get_compliance_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get compliance summary"""
    service = ComplianceService(db)
    return await service.get_compliance_summary(
        organization_id=current_user.get("organization_id", "demo-org")
    )


# ============ ESG ============

@router.get("/esg/metrics", response_model=List[dict])
async def list_esg_metrics(
    category: Optional[str] = None,
    limit: int = Query(default=50, le=100),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """List all ESG metrics"""
    service = ESGService(db)
    return await service.list_metrics(
        organization_id=current_user.get("organization_id", "demo-org"),
        category=category,
        limit=limit
    )


@router.post("/esg/metrics", response_model=dict)
async def create_esg_metric(
    metric: ESGMetricCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new ESG metric"""
    service = ESGService(db)
    return await service.create_metric(
        organization_id=current_user.get("organization_id", "demo-org"),
        category=metric.category.value,
        metric_name=metric.metric_name,
        **metric.dict(exclude={"category", "metric_name"})
    )


@router.get("/esg/scores", response_model=dict)
async def get_esg_scores(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get ESG scores summary"""
    service = ESGService(db)
    return await service.get_esg_scores(
        organization_id=current_user.get("organization_id", "demo-org")
    )


@router.post("/esg/reports", response_model=dict)
async def generate_esg_report(
    report: ESGReportCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Generate an ESG report"""
    service = ESGService(db)
    return await service.generate_esg_report(
        organization_id=current_user.get("organization_id", "demo-org"),
        reporting_period=report.reporting_period,
        report_type=report.report_type
    )


# ============ GOVERNAI DASHBOARD ============

@router.get("/dashboard", response_model=dict)
async def get_governai_dashboard(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get GovernAI dashboard data"""
    org_id = current_user.get("organization_id", "demo-org")
    
    meeting_service = MeetingService(db)
    investment_service = InvestmentService(db)
    compliance_service = ComplianceService(db)
    esg_service = ESGService(db)
    
    # Get stats from each service
    meeting_stats = await meeting_service.get_meeting_stats(org_id)
    portfolio_summary = await investment_service.get_portfolio_summary(org_id)
    compliance_summary = await compliance_service.get_compliance_summary(org_id)
    esg_scores = await esg_service.get_esg_scores(org_id)
    
    return {
        "upcoming_meetings": meeting_stats.get("upcoming_meetings", 0),
        "pending_resolutions": 2,
        "active_investments": portfolio_summary.get("active_investments", 0),
        "compliance_alerts": compliance_summary.get("critical_items", 0),
        "esg_score": esg_scores.get("overall_score"),
        "portfolio_value": portfolio_summary.get("current_value", 0),
        "portfolio_return": portfolio_summary.get("total_return", 0),
        "compliance_rate": compliance_summary.get("compliance_rate", 0),
        "recent_activity": [
            {
                "type": "meeting",
                "title": "Q4 Board Meeting scheduled",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "type": "resolution",
                "title": "Budget Resolution passed",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "type": "investment",
                "title": "New investment proposal submitted",
                "timestamp": datetime.utcnow().isoformat()
            }
        ],
        "risk_summary": {
            "high_risk_investments": 2,
            "critical_compliance": 1,
            "pending_reviews": 3
        }
    }


# Import MeetingService for dashboard
from app.services.governai.meeting_service import MeetingService

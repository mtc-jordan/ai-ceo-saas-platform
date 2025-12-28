from fastapi import APIRouter

from app.api.v1.endpoints import auth, pulse, settings, integrations, subscriptions, team
from app.api.v1.endpoints import athena_scenarios, athena_competitors, athena_intelligence
from app.api.v1.endpoints import governai_meetings, governai_investments
from app.api.v1.endpoints import admin, notifications
from app.api.v1.endpoints import lean_sixsigma, lean_analytics
from app.api.v1.endpoints import meetings
from app.api.v1.endpoints import documents
from app.api.v1.endpoints import predictive_bi
from app.api.v1.endpoints import meeting_analytics
from app.api.v1.endpoints import executive_reports
from app.api.v1.endpoints import okr
from app.api.v1.endpoints import white_label
from app.api.v1.endpoints import localization
from app.api.v1.endpoints import workflows
from app.api.v1.endpoints import billing

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(pulse.router, prefix="/pulse", tags=["Pulse AI"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["Integrations"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
api_router.include_router(team.router, prefix="/team", tags=["Team Management"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

# Athena - AI Executive Advisor
api_router.include_router(athena_scenarios.router, prefix="/athena/scenarios", tags=["Athena - Scenarios"])
api_router.include_router(athena_competitors.router, prefix="/athena/competitors", tags=["Athena - Competitors"])
api_router.include_router(athena_intelligence.router, prefix="/athena", tags=["Athena - Intelligence"])

# GovernAI - Board Intelligence Platform
api_router.include_router(governai_meetings.router, prefix="/governai", tags=["GovernAI - Board Meetings"])
api_router.include_router(governai_investments.router, prefix="/governai", tags=["GovernAI - Investments & ESG"])

# Lean Six Sigma - Operational Excellence
api_router.include_router(lean_sixsigma.router, prefix="/lean-sixsigma", tags=["Lean Six Sigma"])
api_router.include_router(lean_analytics.router, prefix="/lean-analytics", tags=["Lean Six Sigma - Advanced Analytics"])

# AI Meeting Assistant
api_router.include_router(meetings.router, prefix="/meetings", tags=["AI Meeting Assistant"])
api_router.include_router(meeting_analytics.router, prefix="/meeting-analytics", tags=["Meeting Analytics"])

# Document Management
api_router.include_router(documents.router, prefix="/documents", tags=["Document Management"])

# Predictive Business Intelligence
api_router.include_router(predictive_bi.router, prefix="/predictive-bi", tags=["Predictive Business Intelligence"])

# Executive Reporting
api_router.include_router(executive_reports.router, prefix="/reports", tags=["Executive Reporting"])

# Goal Tracking & OKRs
api_router.include_router(okr.router, prefix="/okr", tags=["Goal Tracking & OKRs"])

# White-Label Support
api_router.include_router(white_label.router, prefix="/white-label", tags=["White-Label Support"])

# Multi-Language Support
api_router.include_router(localization.router, prefix="/localization", tags=["Localization & i18n"])

# Workflow Automation
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflow Automation"])

# Billing & Payments
api_router.include_router(billing.router, prefix="/billing", tags=["Billing & Payments"])

# Admin Dashboard
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Dashboard"])

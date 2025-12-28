"""Integrations API endpoints for fetching data from connected sources."""
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User, Organization
from app.models.settings import OrganizationSettings
from app.api.v1.endpoints.auth import get_current_user
from app.api.v1.endpoints.settings import get_user_organization, get_or_create_settings
from app.services.integrations import StripeService, GoogleAnalyticsService, HubSpotService
from app.services.ai_service import DeepSeekService, generate_daily_briefing

router = APIRouter()


@router.get("/metrics")
async def get_all_metrics(
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Fetch metrics from all connected data sources."""
    settings = await get_or_create_settings(org, db)
    
    metrics = {}
    errors = {}
    
    # Fetch Stripe metrics
    if settings.stripe_enabled and settings.stripe_api_key:
        try:
            stripe_service = StripeService(settings.stripe_api_key)
            metrics["stripe"] = await stripe_service.get_all_metrics()
        except Exception as e:
            errors["stripe"] = str(e)
    
    # Fetch Google Analytics metrics
    if settings.google_analytics_enabled and settings.google_analytics_credentials:
        try:
            ga_service = GoogleAnalyticsService(
                settings.google_analytics_credentials,
                settings.google_analytics_property_id
            )
            metrics["google_analytics"] = await ga_service.get_all_metrics()
        except Exception as e:
            errors["google_analytics"] = str(e)
    
    # Fetch HubSpot metrics
    if settings.hubspot_enabled and settings.hubspot_api_key:
        try:
            hubspot_service = HubSpotService(settings.hubspot_api_key)
            metrics["hubspot"] = await hubspot_service.get_all_metrics()
        except Exception as e:
            errors["hubspot"] = str(e)
    
    return {
        "metrics": metrics,
        "errors": errors if errors else None,
        "connected_sources": list(metrics.keys())
    }


@router.get("/metrics/stripe")
async def get_stripe_metrics(
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Fetch metrics from Stripe."""
    settings = await get_or_create_settings(org, db)
    
    if not settings.stripe_enabled or not settings.stripe_api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stripe is not configured or enabled"
        )
    
    try:
        service = StripeService(settings.stripe_api_key)
        return await service.get_all_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Stripe metrics: {str(e)}"
        )


@router.get("/metrics/google-analytics")
async def get_google_analytics_metrics(
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Fetch metrics from Google Analytics."""
    settings = await get_or_create_settings(org, db)
    
    if not settings.google_analytics_enabled or not settings.google_analytics_credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google Analytics is not configured or enabled"
        )
    
    try:
        service = GoogleAnalyticsService(
            settings.google_analytics_credentials,
            settings.google_analytics_property_id
        )
        return await service.get_all_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Google Analytics metrics: {str(e)}"
        )


@router.get("/metrics/hubspot")
async def get_hubspot_metrics(
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Fetch metrics from HubSpot."""
    settings = await get_or_create_settings(org, db)
    
    if not settings.hubspot_enabled or not settings.hubspot_api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="HubSpot is not configured or enabled"
        )
    
    try:
        service = HubSpotService(settings.hubspot_api_key)
        return await service.get_all_metrics()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch HubSpot metrics: {str(e)}"
        )


@router.post("/briefing/generate")
async def generate_briefing(
    briefing_type: str = "daily",
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Generate an AI briefing based on connected data sources."""
    settings = await get_or_create_settings(org, db)
    
    # First, fetch all available metrics
    metrics = {}
    
    if settings.stripe_enabled and settings.stripe_api_key:
        try:
            stripe_service = StripeService(settings.stripe_api_key)
            metrics["stripe"] = await stripe_service.get_all_metrics()
        except Exception:
            pass
    
    if settings.google_analytics_enabled and settings.google_analytics_credentials:
        try:
            ga_service = GoogleAnalyticsService(
                settings.google_analytics_credentials,
                settings.google_analytics_property_id
            )
            metrics["google_analytics"] = await ga_service.get_all_metrics()
        except Exception:
            pass
    
    if settings.hubspot_enabled and settings.hubspot_api_key:
        try:
            hubspot_service = HubSpotService(settings.hubspot_api_key)
            metrics["hubspot"] = await hubspot_service.get_all_metrics()
        except Exception:
            pass
    
    # Generate briefing using DeepSeek if configured
    if settings.deepseek_enabled and settings.deepseek_api_key:
        try:
            ai_service = DeepSeekService(settings.deepseek_api_key)
            briefing = await ai_service.generate_briefing(
                metrics,
                org.name,
                briefing_type
            )
            return briefing
        except Exception as e:
            # Fallback to mock briefing
            return await generate_daily_briefing(
                metrics,
                [],
                org.name,
                None
            )
    else:
        # Return mock briefing if DeepSeek not configured
        return await generate_daily_briefing(
            metrics,
            [],
            org.name,
            None
        )


@router.post("/insight")
async def generate_insight(
    question: str,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Generate an AI insight based on a question."""
    settings = await get_or_create_settings(org, db)
    
    if not settings.deepseek_enabled or not settings.deepseek_api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="DeepSeek AI is not configured. Please add your API key in Settings."
        )
    
    # Fetch current metrics
    metrics = {}
    
    if settings.stripe_enabled and settings.stripe_api_key:
        try:
            stripe_service = StripeService(settings.stripe_api_key)
            metrics["stripe"] = await stripe_service.get_all_metrics()
        except Exception:
            pass
    
    if settings.hubspot_enabled and settings.hubspot_api_key:
        try:
            hubspot_service = HubSpotService(settings.hubspot_api_key)
            metrics["hubspot"] = await hubspot_service.get_all_metrics()
        except Exception:
            pass
    
    try:
        ai_service = DeepSeekService(settings.deepseek_api_key)
        insight = await ai_service.generate_insight(question, metrics)
        return {
            "question": question,
            "insight": insight,
            "sources_used": list(metrics.keys())
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate insight: {str(e)}"
        )

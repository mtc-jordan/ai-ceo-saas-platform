"""Settings API endpoints."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User, Organization
from app.models.settings import OrganizationSettings, DataSourceConnection
from app.schemas.settings import (
    OrganizationSettingsUpdate,
    OrganizationSettingsResponse,
    DataSourceConnectionCreate,
    DataSourceConnectionResponse,
    TestConnectionRequest,
    TestConnectionResponse,
)
from app.api.v1.endpoints.auth import get_current_user
from app.services.integrations import StripeService, GoogleAnalyticsService, HubSpotService

router = APIRouter()


async def get_user_organization(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Organization:
    """Get the current user's organization."""
    # Get user's organization membership
    from app.models.user import organization_members
    from uuid import UUID
    result = await db.execute(
        select(Organization).join(
            organization_members,
            Organization.id == organization_members.c.organization_id
        ).where(organization_members.c.user_id == UUID(user["id"]))
    )
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    return org


async def get_or_create_settings(
    org: Organization,
    db: AsyncSession
) -> OrganizationSettings:
    """Get or create organization settings."""
    result = await db.execute(
        select(OrganizationSettings).where(
            OrganizationSettings.organization_id == org.id
        )
    )
    settings = result.scalar_one_or_none()
    
    if not settings:
        settings = OrganizationSettings(organization_id=org.id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    
    return settings


@router.get("", response_model=OrganizationSettingsResponse)
async def get_settings(
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get organization settings (sensitive data masked)."""
    settings = await get_or_create_settings(org, db)
    
    return OrganizationSettingsResponse(
        id=settings.id,
        organization_id=settings.organization_id,
        deepseek_configured=bool(settings.deepseek_api_key),
        deepseek_enabled=settings.deepseek_enabled,
        stripe_configured=bool(settings.stripe_api_key),
        stripe_enabled=settings.stripe_enabled,
        google_analytics_configured=bool(settings.google_analytics_credentials),
        google_analytics_property_id=settings.google_analytics_property_id,
        google_analytics_enabled=settings.google_analytics_enabled,
        hubspot_configured=bool(settings.hubspot_api_key),
        hubspot_enabled=settings.hubspot_enabled,
        salesforce_configured=bool(settings.salesforce_refresh_token),
        salesforce_enabled=settings.salesforce_enabled,
        briefing_frequency=settings.briefing_frequency,
        briefing_time=settings.briefing_time,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.put("", response_model=OrganizationSettingsResponse)
async def update_settings(
    settings_update: OrganizationSettingsUpdate,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Update organization settings."""
    settings = await get_or_create_settings(org, db)
    
    # Update DeepSeek settings
    if settings_update.deepseek:
        if settings_update.deepseek.api_key is not None:
            settings.deepseek_api_key = settings_update.deepseek.api_key
        settings.deepseek_enabled = settings_update.deepseek.enabled
    
    # Update Stripe settings
    if settings_update.stripe:
        if settings_update.stripe.api_key is not None:
            settings.stripe_api_key = settings_update.stripe.api_key
        settings.stripe_enabled = settings_update.stripe.enabled
    
    # Update Google Analytics settings
    if settings_update.google_analytics:
        if settings_update.google_analytics.credentials_json is not None:
            settings.google_analytics_credentials = settings_update.google_analytics.credentials_json
        if settings_update.google_analytics.property_id is not None:
            settings.google_analytics_property_id = settings_update.google_analytics.property_id
        settings.google_analytics_enabled = settings_update.google_analytics.enabled
    
    # Update HubSpot settings
    if settings_update.hubspot:
        if settings_update.hubspot.api_key is not None:
            settings.hubspot_api_key = settings_update.hubspot.api_key
        settings.hubspot_enabled = settings_update.hubspot.enabled
    
    # Update Salesforce settings
    if settings_update.salesforce:
        if settings_update.salesforce.client_id is not None:
            settings.salesforce_client_id = settings_update.salesforce.client_id
        if settings_update.salesforce.client_secret is not None:
            settings.salesforce_client_secret = settings_update.salesforce.client_secret
        if settings_update.salesforce.refresh_token is not None:
            settings.salesforce_refresh_token = settings_update.salesforce.refresh_token
        if settings_update.salesforce.instance_url is not None:
            settings.salesforce_instance_url = settings_update.salesforce.instance_url
        settings.salesforce_enabled = settings_update.salesforce.enabled
    
    # Update briefing settings
    if settings_update.briefing:
        settings.briefing_frequency = settings_update.briefing.frequency
        settings.briefing_time = settings_update.briefing.time
    
    await db.commit()
    await db.refresh(settings)
    
    return OrganizationSettingsResponse(
        id=settings.id,
        organization_id=settings.organization_id,
        deepseek_configured=bool(settings.deepseek_api_key),
        deepseek_enabled=settings.deepseek_enabled,
        stripe_configured=bool(settings.stripe_api_key),
        stripe_enabled=settings.stripe_enabled,
        google_analytics_configured=bool(settings.google_analytics_credentials),
        google_analytics_property_id=settings.google_analytics_property_id,
        google_analytics_enabled=settings.google_analytics_enabled,
        hubspot_configured=bool(settings.hubspot_api_key),
        hubspot_enabled=settings.hubspot_enabled,
        salesforce_configured=bool(settings.salesforce_refresh_token),
        salesforce_enabled=settings.salesforce_enabled,
        briefing_frequency=settings.briefing_frequency,
        briefing_time=settings.briefing_time,
        created_at=settings.created_at,
        updated_at=settings.updated_at,
    )


@router.post("/test-connection", response_model=TestConnectionResponse)
async def test_connection(
    request: TestConnectionRequest,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Test a data source connection."""
    try:
        if request.source_type == "stripe":
            if not request.api_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="API key is required for Stripe"
                )
            service = StripeService(request.api_key)
            success = await service.test_connection()
            
        elif request.source_type == "hubspot":
            if not request.api_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="API key is required for HubSpot"
                )
            service = HubSpotService(request.api_key)
            success = await service.test_connection()
            
        elif request.source_type == "google_analytics":
            if not request.credentials_json or not request.property_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Credentials JSON and property ID are required for Google Analytics"
                )
            service = GoogleAnalyticsService(request.credentials_json, request.property_id)
            success = await service.test_connection()
            
        elif request.source_type == "deepseek":
            if not request.api_key:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="API key is required for DeepSeek"
                )
            # Test DeepSeek connection
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.deepseek.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {request.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": "Hello"}],
                        "max_tokens": 5
                    },
                    timeout=10.0
                )
                success = response.status_code == 200
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unknown source type: {request.source_type}"
            )
        
        return TestConnectionResponse(
            success=success,
            message="Connection successful" if success else "Connection failed",
            source_type=request.source_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return TestConnectionResponse(
            success=False,
            message=f"Connection failed: {str(e)}",
            source_type=request.source_type
        )


@router.get("/connections", response_model=List[DataSourceConnectionResponse])
async def get_connections(
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Get all data source connections for the organization."""
    result = await db.execute(
        select(DataSourceConnection).where(
            DataSourceConnection.organization_id == org.id
        )
    )
    connections = result.scalars().all()
    return connections


@router.post("/connections", response_model=DataSourceConnectionResponse)
async def create_connection(
    connection: DataSourceConnectionCreate,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Create a new data source connection."""
    new_connection = DataSourceConnection(
        organization_id=org.id,
        source_type=connection.source_type,
        display_name=connection.display_name,
        status="pending"
    )
    db.add(new_connection)
    await db.commit()
    await db.refresh(new_connection)
    return new_connection


@router.delete("/connections/{connection_id}")
async def delete_connection(
    connection_id: UUID,
    org: Organization = Depends(get_user_organization),
    db: AsyncSession = Depends(get_db)
):
    """Delete a data source connection."""
    result = await db.execute(
        select(DataSourceConnection).where(
            DataSourceConnection.id == connection_id,
            DataSourceConnection.organization_id == org.id
        )
    )
    connection = result.scalar_one_or_none()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )
    
    await db.delete(connection)
    await db.commit()
    
    return {"message": "Connection deleted"}

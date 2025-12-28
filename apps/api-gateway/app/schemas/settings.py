"""Pydantic schemas for settings."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import UUID


class DeepSeekSettings(BaseModel):
    """DeepSeek AI configuration."""
    api_key: Optional[str] = Field(None, description="DeepSeek API key")
    enabled: bool = False


class StripeSettings(BaseModel):
    """Stripe configuration."""
    api_key: Optional[str] = Field(None, description="Stripe secret API key")
    enabled: bool = False


class GoogleAnalyticsSettings(BaseModel):
    """Google Analytics configuration."""
    credentials_json: Optional[str] = Field(None, description="Service account credentials JSON")
    property_id: Optional[str] = Field(None, description="GA4 property ID")
    enabled: bool = False


class HubSpotSettings(BaseModel):
    """HubSpot configuration."""
    api_key: Optional[str] = Field(None, description="HubSpot private app access token")
    enabled: bool = False


class SalesforceSettings(BaseModel):
    """Salesforce configuration."""
    client_id: Optional[str] = None
    client_secret: Optional[str] = None
    refresh_token: Optional[str] = None
    instance_url: Optional[str] = None
    enabled: bool = False


class BriefingSettings(BaseModel):
    """AI briefing configuration."""
    frequency: str = Field("daily", description="Briefing frequency: daily, weekly, realtime")
    time: str = Field("08:00", description="Time to generate briefing (HH:MM)")


class OrganizationSettingsUpdate(BaseModel):
    """Schema for updating organization settings."""
    deepseek: Optional[DeepSeekSettings] = None
    stripe: Optional[StripeSettings] = None
    google_analytics: Optional[GoogleAnalyticsSettings] = None
    hubspot: Optional[HubSpotSettings] = None
    salesforce: Optional[SalesforceSettings] = None
    briefing: Optional[BriefingSettings] = None


class OrganizationSettingsResponse(BaseModel):
    """Schema for organization settings response (masks sensitive data)."""
    id: UUID
    organization_id: UUID
    
    # DeepSeek (masked)
    deepseek_configured: bool = False
    deepseek_enabled: bool = False
    
    # Stripe (masked)
    stripe_configured: bool = False
    stripe_enabled: bool = False
    
    # Google Analytics (masked)
    google_analytics_configured: bool = False
    google_analytics_property_id: Optional[str] = None
    google_analytics_enabled: bool = False
    
    # HubSpot (masked)
    hubspot_configured: bool = False
    hubspot_enabled: bool = False
    
    # Salesforce (masked)
    salesforce_configured: bool = False
    salesforce_enabled: bool = False
    
    # Briefing settings
    briefing_frequency: str = "daily"
    briefing_time: str = "08:00"
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DataSourceConnectionCreate(BaseModel):
    """Schema for creating a data source connection."""
    source_type: str
    display_name: str


class DataSourceConnectionResponse(BaseModel):
    """Schema for data source connection response."""
    id: UUID
    organization_id: UUID
    source_type: str
    display_name: str
    status: str
    last_sync_at: Optional[datetime] = None
    last_error: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TestConnectionRequest(BaseModel):
    """Schema for testing a connection."""
    source_type: str
    api_key: Optional[str] = None
    credentials_json: Optional[str] = None
    property_id: Optional[str] = None


class TestConnectionResponse(BaseModel):
    """Schema for connection test response."""
    success: bool
    message: str
    source_type: str

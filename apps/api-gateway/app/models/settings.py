"""Settings models for storing organization configurations and API keys."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class OrganizationSettings(Base):
    """Organization-level settings including API keys."""
    __tablename__ = "organization_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), unique=True, nullable=False)
    
    # DeepSeek AI Configuration
    deepseek_api_key = Column(Text, nullable=True)
    deepseek_enabled = Column(Boolean, default=False)
    
    # Stripe Configuration
    stripe_api_key = Column(Text, nullable=True)
    stripe_enabled = Column(Boolean, default=False)
    
    # Google Analytics Configuration
    google_analytics_credentials = Column(Text, nullable=True)  # JSON credentials
    google_analytics_property_id = Column(String(100), nullable=True)
    google_analytics_enabled = Column(Boolean, default=False)
    
    # HubSpot Configuration
    hubspot_api_key = Column(Text, nullable=True)
    hubspot_enabled = Column(Boolean, default=False)
    
    # Salesforce Configuration
    salesforce_client_id = Column(Text, nullable=True)
    salesforce_client_secret = Column(Text, nullable=True)
    salesforce_refresh_token = Column(Text, nullable=True)
    salesforce_instance_url = Column(String(255), nullable=True)
    salesforce_enabled = Column(Boolean, default=False)
    
    # AI Briefing Settings
    briefing_frequency = Column(String(50), default="daily")  # daily, weekly, realtime
    briefing_time = Column(String(10), default="08:00")  # HH:MM format
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    organization = relationship("Organization", backref="settings")


class DataSourceConnection(Base):
    """Track individual data source connections and their status."""
    __tablename__ = "data_source_connections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    source_type = Column(String(50), nullable=False)  # stripe, google_analytics, hubspot, etc.
    display_name = Column(String(100), nullable=False)
    status = Column(String(20), default="pending")  # pending, connected, error, disconnected
    last_sync_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

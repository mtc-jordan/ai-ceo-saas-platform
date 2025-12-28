"""
Admin Dashboard Models
Platform administration and configuration
"""
from sqlalchemy import Column, String, Integer, Boolean, Float, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.sql import func
from app.db.session import Base
import enum


class AuditActionType(str, enum.Enum):
    """Types of audit actions"""
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    SUBSCRIPTION_CREATED = "subscription_created"
    SUBSCRIPTION_UPDATED = "subscription_updated"
    SUBSCRIPTION_CANCELLED = "subscription_cancelled"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_FAILED = "payment_failed"
    SETTINGS_UPDATED = "settings_updated"
    FEATURE_FLAG_UPDATED = "feature_flag_updated"
    API_KEY_CREATED = "api_key_created"
    API_KEY_REVOKED = "api_key_revoked"
    DATA_EXPORTED = "data_exported"
    ADMIN_ACTION = "admin_action"


class AuditLog(Base):
    """Audit log for tracking all platform activities"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    action_type = Column(String(50), nullable=False, index=True)
    actor_id = Column(String(36), nullable=True)  # User who performed the action
    actor_email = Column(String(255), nullable=True)
    actor_ip = Column(String(45), nullable=True)
    target_type = Column(String(50), nullable=True)  # user, organization, subscription, etc.
    target_id = Column(String(36), nullable=True)
    description = Column(Text, nullable=True)
    extra_data = Column(JSON, nullable=True)
    organization_id = Column(String(36), nullable=True, index=True)


class FeatureFlag(Base):
    """Feature flags for controlling platform features"""
    __tablename__ = "feature_flags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    enabled = Column(Boolean, default=False)
    enabled_for_plans = Column(JSON, default=list)  # ["free", "pro", "enterprise"]
    enabled_for_organizations = Column(JSON, default=list)  # Specific org IDs
    percentage_rollout = Column(Integer, default=100)  # 0-100 for gradual rollout
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(String(36), nullable=True)


class PlatformConfig(Base):
    """Platform-wide configuration settings"""
    __tablename__ = "platform_config"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    value_type = Column(String(20), default="string")  # string, number, boolean, json
    category = Column(String(50), default="general")  # general, email, billing, security, etc.
    description = Column(Text, nullable=True)
    is_secret = Column(Boolean, default=False)  # If true, value should be masked
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(String(36), nullable=True)


class SystemHealth(Base):
    """System health metrics"""
    __tablename__ = "system_health"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    service_name = Column(String(50), nullable=False)  # api, database, redis, etc.
    status = Column(String(20), default="healthy")  # healthy, degraded, down
    response_time_ms = Column(Float, nullable=True)
    error_count = Column(Integer, default=0)
    extra_data = Column(JSON, nullable=True)


class PlatformStats(Base):
    """Daily platform statistics"""
    __tablename__ = "platform_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    total_users = Column(Integer, default=0)
    active_users = Column(Integer, default=0)
    new_users = Column(Integer, default=0)
    total_organizations = Column(Integer, default=0)
    active_organizations = Column(Integer, default=0)
    new_organizations = Column(Integer, default=0)
    total_subscriptions = Column(Integer, default=0)
    mrr = Column(Float, default=0)  # Monthly Recurring Revenue
    arr = Column(Float, default=0)  # Annual Recurring Revenue
    churn_rate = Column(Float, default=0)
    api_requests = Column(Integer, default=0)
    ai_requests = Column(Integer, default=0)
    storage_used_gb = Column(Float, default=0)
    extra_data = Column(JSON, nullable=True)


class AdminUser(Base):
    """Admin users with elevated privileges"""
    __tablename__ = "admin_users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(36), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False)
    role = Column(String(50), default="admin")  # super_admin, admin, support
    permissions = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(36), nullable=True)


class Announcement(Base):
    """Platform announcements and notifications"""
    __tablename__ = "announcements"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    type = Column(String(20), default="info")  # info, warning, critical, maintenance
    target_audience = Column(String(50), default="all")  # all, free, pro, enterprise
    is_active = Column(Boolean, default=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String(36), nullable=True)

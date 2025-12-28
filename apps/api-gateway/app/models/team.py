import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Enum, Text
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.db.session import Base


class TeamRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    VIEWER = "viewer"


class InvitationStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    REVOKED = "revoked"


class TeamMember(Base):
    """Team member with role-based access"""
    __tablename__ = "team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    role = Column(String(50), nullable=False, default=TeamRole.VIEWER.value)
    
    # Permissions (can override role defaults)
    can_view_dashboard = Column(Boolean, default=True)
    can_edit_dashboard = Column(Boolean, default=False)
    can_manage_data_sources = Column(Boolean, default=False)
    can_view_athena = Column(Boolean, default=False)
    can_edit_athena = Column(Boolean, default=False)
    can_view_governai = Column(Boolean, default=False)
    can_edit_governai = Column(Boolean, default=False)
    can_manage_team = Column(Boolean, default=False)
    can_manage_billing = Column(Boolean, default=False)
    can_view_settings = Column(Boolean, default=False)
    can_edit_settings = Column(Boolean, default=False)
    
    # Metadata
    invited_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    joined_at = Column(DateTime, default=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TeamInvitation(Base):
    """Invitation to join a team"""
    __tablename__ = "team_invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    
    # Invitation details
    email = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default=TeamRole.VIEWER.value)
    token = Column(String(255), unique=True, nullable=False)
    message = Column(Text, nullable=True)  # Optional personal message
    
    # Status tracking
    status = Column(String(50), nullable=False, default=InvitationStatus.PENDING.value)
    expires_at = Column(DateTime, nullable=False)
    
    # Who invited
    invited_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # If accepted, link to the user
    accepted_by = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @staticmethod
    def generate_expiry():
        """Generate expiry date 7 days from now"""
        return datetime.utcnow() + timedelta(days=7)


class ActivityLog(Base):
    """Log of team member activities for audit"""
    __tablename__ = "activity_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    
    # Activity details
    action = Column(String(100), nullable=False)  # e.g., "created_scenario", "invited_member"
    resource_type = Column(String(100), nullable=True)  # e.g., "scenario", "competitor"
    resource_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(Text, nullable=True)  # JSON string with additional details
    
    # Context
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)


# Role permission defaults
ROLE_PERMISSIONS = {
    TeamRole.OWNER: {
        "can_view_dashboard": True,
        "can_edit_dashboard": True,
        "can_manage_data_sources": True,
        "can_view_athena": True,
        "can_edit_athena": True,
        "can_view_governai": True,
        "can_edit_governai": True,
        "can_manage_team": True,
        "can_manage_billing": True,
        "can_view_settings": True,
        "can_edit_settings": True,
    },
    TeamRole.ADMIN: {
        "can_view_dashboard": True,
        "can_edit_dashboard": True,
        "can_manage_data_sources": True,
        "can_view_athena": True,
        "can_edit_athena": True,
        "can_view_governai": True,
        "can_edit_governai": True,
        "can_manage_team": True,
        "can_manage_billing": False,
        "can_view_settings": True,
        "can_edit_settings": True,
    },
    TeamRole.MANAGER: {
        "can_view_dashboard": True,
        "can_edit_dashboard": True,
        "can_manage_data_sources": True,
        "can_view_athena": True,
        "can_edit_athena": True,
        "can_view_governai": True,
        "can_edit_governai": False,
        "can_manage_team": False,
        "can_manage_billing": False,
        "can_view_settings": True,
        "can_edit_settings": False,
    },
    TeamRole.ANALYST: {
        "can_view_dashboard": True,
        "can_edit_dashboard": False,
        "can_manage_data_sources": False,
        "can_view_athena": True,
        "can_edit_athena": True,
        "can_view_governai": False,
        "can_edit_governai": False,
        "can_manage_team": False,
        "can_manage_billing": False,
        "can_view_settings": False,
        "can_edit_settings": False,
    },
    TeamRole.VIEWER: {
        "can_view_dashboard": True,
        "can_edit_dashboard": False,
        "can_manage_data_sources": False,
        "can_view_athena": True,
        "can_edit_athena": False,
        "can_view_governai": False,
        "can_edit_governai": False,
        "can_manage_team": False,
        "can_manage_billing": False,
        "can_view_settings": False,
        "can_edit_settings": False,
    },
}

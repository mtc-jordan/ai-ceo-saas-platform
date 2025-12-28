from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class TeamRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MANAGER = "manager"
    ANALYST = "analyst"
    VIEWER = "viewer"


class InvitationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    REVOKED = "revoked"


# Permission schemas
class PermissionsBase(BaseModel):
    can_view_dashboard: bool = True
    can_edit_dashboard: bool = False
    can_manage_data_sources: bool = False
    can_view_athena: bool = False
    can_edit_athena: bool = False
    can_view_governai: bool = False
    can_edit_governai: bool = False
    can_manage_team: bool = False
    can_manage_billing: bool = False
    can_view_settings: bool = False
    can_edit_settings: bool = False


class PermissionsUpdate(BaseModel):
    can_view_dashboard: Optional[bool] = None
    can_edit_dashboard: Optional[bool] = None
    can_manage_data_sources: Optional[bool] = None
    can_view_athena: Optional[bool] = None
    can_edit_athena: Optional[bool] = None
    can_view_governai: Optional[bool] = None
    can_edit_governai: Optional[bool] = None
    can_manage_team: Optional[bool] = None
    can_manage_billing: Optional[bool] = None
    can_view_settings: Optional[bool] = None
    can_edit_settings: Optional[bool] = None


# Team Member schemas
class TeamMemberBase(BaseModel):
    role: TeamRole = TeamRole.VIEWER


class TeamMemberCreate(TeamMemberBase):
    user_id: UUID


class TeamMemberUpdate(BaseModel):
    role: Optional[TeamRole] = None
    is_active: Optional[bool] = None
    permissions: Optional[PermissionsUpdate] = None


class TeamMemberResponse(TeamMemberBase):
    id: UUID
    organization_id: UUID
    user_id: UUID
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    is_active: bool
    joined_at: datetime
    last_active_at: Optional[datetime] = None
    permissions: PermissionsBase

    class Config:
        from_attributes = True


class TeamMemberListResponse(BaseModel):
    members: List[TeamMemberResponse]
    total: int
    owners: int
    admins: int
    managers: int
    analysts: int
    viewers: int


# Invitation schemas
class InvitationCreate(BaseModel):
    email: EmailStr
    role: TeamRole = TeamRole.VIEWER
    message: Optional[str] = Field(None, max_length=500)


class InvitationBulkCreate(BaseModel):
    invitations: List[InvitationCreate]


class InvitationUpdate(BaseModel):
    role: Optional[TeamRole] = None
    message: Optional[str] = None


class InvitationResponse(BaseModel):
    id: UUID
    organization_id: UUID
    email: str
    role: TeamRole
    status: InvitationStatus
    message: Optional[str] = None
    expires_at: datetime
    invited_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class InvitationListResponse(BaseModel):
    invitations: List[InvitationResponse]
    total: int
    pending: int
    accepted: int
    expired: int


class InvitationAccept(BaseModel):
    token: str
    full_name: Optional[str] = None
    password: Optional[str] = None  # Required if user doesn't exist


class InvitationVerify(BaseModel):
    token: str


class InvitationVerifyResponse(BaseModel):
    valid: bool
    email: Optional[str] = None
    organization_name: Optional[str] = None
    role: Optional[TeamRole] = None
    invited_by: Optional[str] = None
    expires_at: Optional[datetime] = None
    user_exists: bool = False


# Activity Log schemas
class ActivityLogResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[UUID] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityLogListResponse(BaseModel):
    activities: List[ActivityLogResponse]
    total: int


# Team Overview
class TeamOverview(BaseModel):
    total_members: int
    active_members: int
    pending_invitations: int
    roles_breakdown: dict
    recent_activities: List[ActivityLogResponse]


# Role info for frontend
class RoleInfo(BaseModel):
    role: TeamRole
    name: str
    description: str
    permissions: PermissionsBase


class RolesListResponse(BaseModel):
    roles: List[RoleInfo]

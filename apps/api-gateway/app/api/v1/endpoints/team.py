from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.db.session import get_db
from app.core.security import get_current_user
from app.services.team_service import TeamService
from app.models.team import TeamRole, InvitationStatus, ROLE_PERMISSIONS
from app.schemas.team import (
    TeamMemberResponse, TeamMemberListResponse, TeamMemberUpdate,
    InvitationCreate, InvitationBulkCreate, InvitationResponse,
    InvitationListResponse, InvitationAccept, InvitationVerify,
    InvitationVerifyResponse, ActivityLogListResponse, TeamOverview,
    RoleInfo, RolesListResponse, PermissionsBase
)

router = APIRouter()


def get_org_id(current_user: dict) -> UUID:
    """Extract organization ID from current user"""
    org_id = current_user.get("organization_id")
    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not associated with an organization"
        )
    return UUID(org_id) if isinstance(org_id, str) else org_id


def require_permission(permission: str):
    """Dependency to check if user has required permission"""
    def check_permission(
        current_user: dict = Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        org_id = get_org_id(current_user)
        user_id = UUID(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
        
        service = TeamService(db)
        if not service.check_permission(org_id, user_id, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {permission} required"
            )
        return current_user
    return check_permission


# ==================== Team Members ====================

@router.get("/members", response_model=TeamMemberListResponse)
async def get_team_members(
    include_inactive: bool = False,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all team members"""
    org_id = get_org_id(current_user)
    service = TeamService(db)
    
    members = service.get_team_members(org_id, include_inactive)
    
    # Count by role
    role_counts = {"owner": 0, "admin": 0, "manager": 0, "analyst": 0, "viewer": 0}
    for member in members:
        role = member.get("role", "viewer")
        if role in role_counts:
            role_counts[role] += 1
    
    return {
        "members": members,
        "total": len(members),
        "owners": role_counts["owner"],
        "admins": role_counts["admin"],
        "managers": role_counts["manager"],
        "analysts": role_counts["analyst"],
        "viewers": role_counts["viewer"]
    }


@router.get("/members/{member_id}", response_model=TeamMemberResponse)
async def get_team_member(
    member_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific team member"""
    org_id = get_org_id(current_user)
    service = TeamService(db)
    
    member = service.get_team_member(org_id, member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    
    # Get user info
    from app.models.user import User
    user = db.query(User).filter(User.id == member.user_id).first()
    
    return {
        "id": member.id,
        "organization_id": member.organization_id,
        "user_id": member.user_id,
        "user_email": user.email if user else None,
        "user_name": user.full_name if user else None,
        "role": member.role,
        "is_active": member.is_active,
        "joined_at": member.joined_at,
        "last_active_at": member.last_active_at,
        "permissions": {
            "can_view_dashboard": member.can_view_dashboard,
            "can_edit_dashboard": member.can_edit_dashboard,
            "can_manage_data_sources": member.can_manage_data_sources,
            "can_view_athena": member.can_view_athena,
            "can_edit_athena": member.can_edit_athena,
            "can_view_governai": member.can_view_governai,
            "can_edit_governai": member.can_edit_governai,
            "can_manage_team": member.can_manage_team,
            "can_manage_billing": member.can_manage_billing,
            "can_view_settings": member.can_view_settings,
            "can_edit_settings": member.can_edit_settings,
        }
    }


@router.patch("/members/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    member_id: UUID,
    update_data: TeamMemberUpdate,
    current_user: dict = Depends(require_permission("can_manage_team")),
    db: Session = Depends(get_db)
):
    """Update a team member's role or permissions"""
    org_id = get_org_id(current_user)
    service = TeamService(db)
    
    member = service.get_team_member(org_id, member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    
    # Prevent changing owner role
    if member.role == TeamRole.OWNER.value and update_data.role and update_data.role != TeamRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change owner's role. Transfer ownership first."
        )
    
    permissions_dict = None
    if update_data.permissions:
        permissions_dict = update_data.permissions.dict(exclude_none=True)
    
    updated_member = service.update_team_member(
        member,
        role=update_data.role.value if update_data.role else None,
        is_active=update_data.is_active,
        permissions=permissions_dict
    )
    
    # Log activity
    user_id = UUID(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
    service.log_activity(
        organization_id=org_id,
        user_id=user_id,
        action="updated_team_member",
        resource_type="team_member",
        resource_id=member_id
    )
    
    # Get user info
    from app.models.user import User
    user = db.query(User).filter(User.id == updated_member.user_id).first()
    
    return {
        "id": updated_member.id,
        "organization_id": updated_member.organization_id,
        "user_id": updated_member.user_id,
        "user_email": user.email if user else None,
        "user_name": user.full_name if user else None,
        "role": updated_member.role,
        "is_active": updated_member.is_active,
        "joined_at": updated_member.joined_at,
        "last_active_at": updated_member.last_active_at,
        "permissions": {
            "can_view_dashboard": updated_member.can_view_dashboard,
            "can_edit_dashboard": updated_member.can_edit_dashboard,
            "can_manage_data_sources": updated_member.can_manage_data_sources,
            "can_view_athena": updated_member.can_view_athena,
            "can_edit_athena": updated_member.can_edit_athena,
            "can_view_governai": updated_member.can_view_governai,
            "can_edit_governai": updated_member.can_edit_governai,
            "can_manage_team": updated_member.can_manage_team,
            "can_manage_billing": updated_member.can_manage_billing,
            "can_view_settings": updated_member.can_view_settings,
            "can_edit_settings": updated_member.can_edit_settings,
        }
    }


@router.delete("/members/{member_id}")
async def remove_team_member(
    member_id: UUID,
    current_user: dict = Depends(require_permission("can_manage_team")),
    db: Session = Depends(get_db)
):
    """Remove a team member"""
    org_id = get_org_id(current_user)
    user_id = UUID(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
    service = TeamService(db)
    
    member = service.get_team_member(org_id, member_id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    
    # Prevent removing owner
    if member.role == TeamRole.OWNER.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove organization owner"
        )
    
    # Prevent removing self
    if member.user_id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove yourself. Contact an admin."
        )
    
    service.remove_team_member(member)
    
    # Log activity
    service.log_activity(
        organization_id=org_id,
        user_id=user_id,
        action="removed_team_member",
        resource_type="team_member",
        resource_id=member_id
    )
    
    return {"success": True, "message": "Team member removed"}


# ==================== Invitations ====================

@router.post("/invitations", response_model=InvitationResponse)
async def create_invitation(
    invitation_data: InvitationCreate,
    current_user: dict = Depends(require_permission("can_manage_team")),
    db: Session = Depends(get_db)
):
    """Create a new invitation"""
    org_id = get_org_id(current_user)
    user_id = UUID(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
    service = TeamService(db)
    
    # Check if user is already a member
    from app.models.user import User
    existing_user = db.query(User).filter(User.email == invitation_data.email.lower()).first()
    if existing_user:
        existing_member = service.get_member_by_user_id(org_id, existing_user.id)
        if existing_member and existing_member.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a team member"
            )
    
    invitation = service.create_invitation(
        organization_id=org_id,
        email=invitation_data.email,
        role=invitation_data.role.value,
        invited_by=user_id,
        message=invitation_data.message
    )
    
    # Log activity
    service.log_activity(
        organization_id=org_id,
        user_id=user_id,
        action="sent_invitation",
        resource_type="invitation",
        resource_id=invitation.id,
        details=f"Invited {invitation_data.email} as {invitation_data.role.value}"
    )
    
    # Get inviter name
    inviter = db.query(User).filter(User.id == user_id).first()
    
    return {
        "id": invitation.id,
        "organization_id": invitation.organization_id,
        "email": invitation.email,
        "role": invitation.role,
        "status": invitation.status,
        "message": invitation.message,
        "expires_at": invitation.expires_at,
        "invited_by_name": inviter.full_name if inviter else None,
        "created_at": invitation.created_at
    }


@router.post("/invitations/bulk", response_model=InvitationListResponse)
async def create_bulk_invitations(
    bulk_data: InvitationBulkCreate,
    current_user: dict = Depends(require_permission("can_manage_team")),
    db: Session = Depends(get_db)
):
    """Create multiple invitations at once"""
    org_id = get_org_id(current_user)
    user_id = UUID(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
    service = TeamService(db)
    
    created_invitations = []
    for inv_data in bulk_data.invitations:
        try:
            invitation = service.create_invitation(
                organization_id=org_id,
                email=inv_data.email,
                role=inv_data.role.value,
                invited_by=user_id,
                message=inv_data.message
            )
            created_invitations.append(invitation)
        except Exception:
            continue  # Skip failed invitations
    
    # Get inviter name
    from app.models.user import User
    inviter = db.query(User).filter(User.id == user_id).first()
    
    invitations = [{
        "id": inv.id,
        "organization_id": inv.organization_id,
        "email": inv.email,
        "role": inv.role,
        "status": inv.status,
        "message": inv.message,
        "expires_at": inv.expires_at,
        "invited_by_name": inviter.full_name if inviter else None,
        "created_at": inv.created_at
    } for inv in created_invitations]
    
    return {
        "invitations": invitations,
        "total": len(invitations),
        "pending": len([i for i in invitations if i["status"] == "pending"]),
        "accepted": 0,
        "expired": 0
    }


@router.get("/invitations", response_model=InvitationListResponse)
async def get_invitations(
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invitations"""
    org_id = get_org_id(current_user)
    service = TeamService(db)
    
    invitations = service.get_invitations(org_id, status)
    
    pending = sum(1 for i in invitations if i["status"] == "pending")
    accepted = sum(1 for i in invitations if i["status"] == "accepted")
    expired = sum(1 for i in invitations if i["status"] == "expired")
    
    return {
        "invitations": invitations,
        "total": len(invitations),
        "pending": pending,
        "accepted": accepted,
        "expired": expired
    }


@router.post("/invitations/verify", response_model=InvitationVerifyResponse)
async def verify_invitation(
    verify_data: InvitationVerify,
    db: Session = Depends(get_db)
):
    """Verify an invitation token (public endpoint)"""
    service = TeamService(db)
    result = service.verify_invitation(verify_data.token)
    return result


@router.post("/invitations/accept")
async def accept_invitation(
    accept_data: InvitationAccept,
    db: Session = Depends(get_db)
):
    """Accept an invitation (public endpoint)"""
    service = TeamService(db)
    result = service.accept_invitation(
        token=accept_data.token,
        full_name=accept_data.full_name,
        password=accept_data.password
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error", "Failed to accept invitation")
        )
    
    return result


@router.post("/invitations/{invitation_id}/resend")
async def resend_invitation(
    invitation_id: UUID,
    current_user: dict = Depends(require_permission("can_manage_team")),
    db: Session = Depends(get_db)
):
    """Resend an invitation"""
    org_id = get_org_id(current_user)
    service = TeamService(db)
    
    from app.models.team import TeamInvitation
    invitation = db.query(TeamInvitation).filter(
        TeamInvitation.id == invitation_id,
        TeamInvitation.organization_id == org_id
    ).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    updated = service.resend_invitation(invitation)
    
    return {
        "success": True,
        "message": "Invitation resent",
        "expires_at": updated.expires_at
    }


@router.delete("/invitations/{invitation_id}")
async def revoke_invitation(
    invitation_id: UUID,
    current_user: dict = Depends(require_permission("can_manage_team")),
    db: Session = Depends(get_db)
):
    """Revoke an invitation"""
    org_id = get_org_id(current_user)
    service = TeamService(db)
    
    from app.models.team import TeamInvitation
    invitation = db.query(TeamInvitation).filter(
        TeamInvitation.id == invitation_id,
        TeamInvitation.organization_id == org_id
    ).first()
    
    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    service.revoke_invitation(invitation)
    
    return {"success": True, "message": "Invitation revoked"}


# ==================== Activity Logs ====================

@router.get("/activity", response_model=ActivityLogListResponse)
async def get_activity_logs(
    limit: int = 50,
    user_id: Optional[UUID] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get activity logs"""
    org_id = get_org_id(current_user)
    service = TeamService(db)
    
    activities = service.get_activity_logs(org_id, limit, user_id)
    
    return {
        "activities": activities,
        "total": len(activities)
    }


# ==================== Team Overview ====================

@router.get("/overview", response_model=TeamOverview)
async def get_team_overview(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team overview with stats"""
    org_id = get_org_id(current_user)
    service = TeamService(db)
    
    stats = service.get_team_stats(org_id)
    activities = service.get_activity_logs(org_id, limit=10)
    
    return {
        "total_members": stats["total_members"],
        "active_members": stats["active_members"],
        "pending_invitations": stats["pending_invitations"],
        "roles_breakdown": stats["roles_breakdown"],
        "recent_activities": activities
    }


# ==================== Roles Info ====================

@router.get("/roles", response_model=RolesListResponse)
async def get_roles_info():
    """Get information about available roles and their permissions"""
    roles = [
        {
            "role": TeamRole.OWNER,
            "name": "Owner",
            "description": "Full access to all features including billing and team management",
            "permissions": ROLE_PERMISSIONS[TeamRole.OWNER]
        },
        {
            "role": TeamRole.ADMIN,
            "name": "Admin",
            "description": "Full access except billing management",
            "permissions": ROLE_PERMISSIONS[TeamRole.ADMIN]
        },
        {
            "role": TeamRole.MANAGER,
            "name": "Manager",
            "description": "Can view and edit most features, but cannot manage team or billing",
            "permissions": ROLE_PERMISSIONS[TeamRole.MANAGER]
        },
        {
            "role": TeamRole.ANALYST,
            "name": "Analyst",
            "description": "Can view dashboard and Athena, and edit Athena scenarios",
            "permissions": ROLE_PERMISSIONS[TeamRole.ANALYST]
        },
        {
            "role": TeamRole.VIEWER,
            "name": "Viewer",
            "description": "Read-only access to dashboard and Athena",
            "permissions": ROLE_PERMISSIONS[TeamRole.VIEWER]
        }
    ]
    
    return {"roles": roles}


# ==================== My Permissions ====================

@router.get("/my-permissions")
async def get_my_permissions(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's permissions"""
    org_id = get_org_id(current_user)
    user_id = UUID(current_user["id"]) if isinstance(current_user["id"], str) else current_user["id"]
    service = TeamService(db)
    
    permissions = service.get_user_permissions(org_id, user_id)
    
    if not permissions:
        # Return default owner permissions if no team member record exists
        return {
            "role": "owner",
            **ROLE_PERMISSIONS[TeamRole.OWNER]
        }
    
    return permissions

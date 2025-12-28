import secrets
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.team import (
    TeamMember, TeamInvitation, ActivityLog,
    TeamRole, InvitationStatus, ROLE_PERMISSIONS
)
from app.models.user import User, Organization
from app.core.security import get_password_hash


class TeamService:
    """Service for managing team members and invitations"""

    def __init__(self, db: Session):
        self.db = db

    # ==================== Team Members ====================

    def get_team_members(
        self,
        organization_id: UUID,
        include_inactive: bool = False
    ) -> List[Dict[str, Any]]:
        """Get all team members for an organization"""
        query = self.db.query(TeamMember, User).join(
            User, TeamMember.user_id == User.id
        ).filter(TeamMember.organization_id == organization_id)

        if not include_inactive:
            query = query.filter(TeamMember.is_active == True)

        results = query.all()
        
        members = []
        for member, user in results:
            members.append({
                "id": member.id,
                "organization_id": member.organization_id,
                "user_id": member.user_id,
                "user_email": user.email,
                "user_name": user.full_name,
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
            })
        
        return members

    def get_team_member(
        self,
        organization_id: UUID,
        member_id: UUID
    ) -> Optional[TeamMember]:
        """Get a specific team member"""
        return self.db.query(TeamMember).filter(
            and_(
                TeamMember.organization_id == organization_id,
                TeamMember.id == member_id
            )
        ).first()

    def get_member_by_user_id(
        self,
        organization_id: UUID,
        user_id: UUID
    ) -> Optional[TeamMember]:
        """Get team member by user ID"""
        return self.db.query(TeamMember).filter(
            and_(
                TeamMember.organization_id == organization_id,
                TeamMember.user_id == user_id
            )
        ).first()

    def add_team_member(
        self,
        organization_id: UUID,
        user_id: UUID,
        role: str = TeamRole.VIEWER.value,
        invited_by: Optional[UUID] = None
    ) -> TeamMember:
        """Add a new team member with role-based permissions"""
        # Get default permissions for the role
        role_enum = TeamRole(role)
        permissions = ROLE_PERMISSIONS.get(role_enum, ROLE_PERMISSIONS[TeamRole.VIEWER])

        member = TeamMember(
            organization_id=organization_id,
            user_id=user_id,
            role=role,
            invited_by=invited_by,
            **permissions
        )
        
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        
        return member

    def update_team_member(
        self,
        member: TeamMember,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        permissions: Optional[Dict[str, bool]] = None
    ) -> TeamMember:
        """Update a team member's role or permissions"""
        if role:
            member.role = role
            # Apply default permissions for new role unless custom permissions provided
            if not permissions:
                role_enum = TeamRole(role)
                default_perms = ROLE_PERMISSIONS.get(role_enum, {})
                for perm, value in default_perms.items():
                    setattr(member, perm, value)

        if is_active is not None:
            member.is_active = is_active

        if permissions:
            for perm, value in permissions.items():
                if hasattr(member, perm):
                    setattr(member, perm, value)

        member.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(member)
        
        return member

    def remove_team_member(
        self,
        member: TeamMember,
        soft_delete: bool = True
    ) -> bool:
        """Remove a team member (soft delete by default)"""
        if soft_delete:
            member.is_active = False
            member.updated_at = datetime.utcnow()
            self.db.commit()
        else:
            self.db.delete(member)
            self.db.commit()
        
        return True

    def update_last_active(self, member: TeamMember) -> None:
        """Update member's last active timestamp"""
        member.last_active_at = datetime.utcnow()
        self.db.commit()

    # ==================== Invitations ====================

    def create_invitation(
        self,
        organization_id: UUID,
        email: str,
        role: str,
        invited_by: UUID,
        message: Optional[str] = None
    ) -> TeamInvitation:
        """Create a new invitation"""
        # Check if invitation already exists
        existing = self.db.query(TeamInvitation).filter(
            and_(
                TeamInvitation.organization_id == organization_id,
                TeamInvitation.email == email.lower(),
                TeamInvitation.status == InvitationStatus.PENDING.value
            )
        ).first()

        if existing:
            # Update existing invitation
            existing.role = role
            existing.message = message
            existing.token = secrets.token_urlsafe(32)
            existing.expires_at = TeamInvitation.generate_expiry()
            existing.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing)
            return existing

        # Create new invitation
        invitation = TeamInvitation(
            organization_id=organization_id,
            email=email.lower(),
            role=role,
            token=secrets.token_urlsafe(32),
            message=message,
            invited_by=invited_by,
            expires_at=TeamInvitation.generate_expiry()
        )
        
        self.db.add(invitation)
        self.db.commit()
        self.db.refresh(invitation)
        
        return invitation

    def get_invitations(
        self,
        organization_id: UUID,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get all invitations for an organization"""
        query = self.db.query(TeamInvitation, User).outerjoin(
            User, TeamInvitation.invited_by == User.id
        ).filter(TeamInvitation.organization_id == organization_id)

        if status:
            query = query.filter(TeamInvitation.status == status)

        results = query.order_by(TeamInvitation.created_at.desc()).all()
        
        invitations = []
        for invitation, inviter in results:
            invitations.append({
                "id": invitation.id,
                "organization_id": invitation.organization_id,
                "email": invitation.email,
                "role": invitation.role,
                "status": invitation.status,
                "message": invitation.message,
                "expires_at": invitation.expires_at,
                "invited_by_name": inviter.full_name if inviter else None,
                "created_at": invitation.created_at
            })
        
        return invitations

    def get_invitation_by_token(self, token: str) -> Optional[TeamInvitation]:
        """Get invitation by token"""
        return self.db.query(TeamInvitation).filter(
            TeamInvitation.token == token
        ).first()

    def verify_invitation(self, token: str) -> Dict[str, Any]:
        """Verify an invitation token"""
        invitation = self.get_invitation_by_token(token)
        
        if not invitation:
            return {"valid": False, "user_exists": False}

        # Check if expired
        if invitation.expires_at < datetime.utcnow():
            invitation.status = InvitationStatus.EXPIRED.value
            self.db.commit()
            return {"valid": False, "user_exists": False}

        if invitation.status != InvitationStatus.PENDING.value:
            return {"valid": False, "user_exists": False}

        # Get organization and inviter info
        org = self.db.query(Organization).filter(
            Organization.id == invitation.organization_id
        ).first()
        
        inviter = self.db.query(User).filter(
            User.id == invitation.invited_by
        ).first()

        # Check if user already exists
        existing_user = self.db.query(User).filter(
            User.email == invitation.email
        ).first()

        return {
            "valid": True,
            "email": invitation.email,
            "organization_name": org.name if org else None,
            "role": invitation.role,
            "invited_by": inviter.full_name if inviter else None,
            "expires_at": invitation.expires_at,
            "user_exists": existing_user is not None
        }

    def accept_invitation(
        self,
        token: str,
        full_name: Optional[str] = None,
        password: Optional[str] = None
    ) -> Dict[str, Any]:
        """Accept an invitation"""
        invitation = self.get_invitation_by_token(token)
        
        if not invitation:
            return {"success": False, "error": "Invalid invitation"}

        if invitation.expires_at < datetime.utcnow():
            invitation.status = InvitationStatus.EXPIRED.value
            self.db.commit()
            return {"success": False, "error": "Invitation has expired"}

        if invitation.status != InvitationStatus.PENDING.value:
            return {"success": False, "error": "Invitation is no longer valid"}

        # Check if user exists
        user = self.db.query(User).filter(
            User.email == invitation.email
        ).first()

        if not user:
            # Create new user
            if not password:
                return {"success": False, "error": "Password required for new users"}
            
            user = User(
                email=invitation.email,
                password_hash=get_password_hash(password),
                full_name=full_name or invitation.email.split('@')[0]
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)

        # Check if already a member
        existing_member = self.get_member_by_user_id(
            invitation.organization_id,
            user.id
        )

        if existing_member:
            # Reactivate if inactive
            if not existing_member.is_active:
                existing_member.is_active = True
                existing_member.role = invitation.role
                self.db.commit()
        else:
            # Add as team member
            self.add_team_member(
                organization_id=invitation.organization_id,
                user_id=user.id,
                role=invitation.role,
                invited_by=invitation.invited_by
            )

        # Update invitation status
        invitation.status = InvitationStatus.ACCEPTED.value
        invitation.accepted_by = user.id
        invitation.accepted_at = datetime.utcnow()
        self.db.commit()

        return {
            "success": True,
            "user_id": str(user.id),
            "organization_id": str(invitation.organization_id)
        }

    def revoke_invitation(self, invitation: TeamInvitation) -> bool:
        """Revoke an invitation"""
        invitation.status = InvitationStatus.REVOKED.value
        invitation.updated_at = datetime.utcnow()
        self.db.commit()
        return True

    def resend_invitation(self, invitation: TeamInvitation) -> TeamInvitation:
        """Resend an invitation with new token and expiry"""
        invitation.token = secrets.token_urlsafe(32)
        invitation.expires_at = TeamInvitation.generate_expiry()
        invitation.status = InvitationStatus.PENDING.value
        invitation.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(invitation)
        return invitation

    # ==================== Activity Logging ====================

    def log_activity(
        self,
        organization_id: UUID,
        user_id: UUID,
        action: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[UUID] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> ActivityLog:
        """Log a team member activity"""
        log = ActivityLog(
            organization_id=organization_id,
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        
        return log

    def get_activity_logs(
        self,
        organization_id: UUID,
        limit: int = 50,
        user_id: Optional[UUID] = None
    ) -> List[Dict[str, Any]]:
        """Get activity logs for an organization"""
        query = self.db.query(ActivityLog, User).join(
            User, ActivityLog.user_id == User.id
        ).filter(ActivityLog.organization_id == organization_id)

        if user_id:
            query = query.filter(ActivityLog.user_id == user_id)

        results = query.order_by(
            ActivityLog.created_at.desc()
        ).limit(limit).all()

        activities = []
        for log, user in results:
            activities.append({
                "id": log.id,
                "user_id": log.user_id,
                "user_name": user.full_name,
                "user_email": user.email,
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "details": log.details,
                "created_at": log.created_at
            })
        
        return activities

    # ==================== Permissions Check ====================

    def check_permission(
        self,
        organization_id: UUID,
        user_id: UUID,
        permission: str
    ) -> bool:
        """Check if a user has a specific permission"""
        member = self.get_member_by_user_id(organization_id, user_id)
        
        if not member or not member.is_active:
            return False

        return getattr(member, permission, False)

    def get_user_permissions(
        self,
        organization_id: UUID,
        user_id: UUID
    ) -> Optional[Dict[str, bool]]:
        """Get all permissions for a user"""
        member = self.get_member_by_user_id(organization_id, user_id)
        
        if not member or not member.is_active:
            return None

        return {
            "role": member.role,
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

    # ==================== Team Stats ====================

    def get_team_stats(self, organization_id: UUID) -> Dict[str, Any]:
        """Get team statistics"""
        members = self.db.query(TeamMember).filter(
            TeamMember.organization_id == organization_id
        ).all()

        active_count = sum(1 for m in members if m.is_active)
        
        roles_count = {
            "owner": 0,
            "admin": 0,
            "manager": 0,
            "analyst": 0,
            "viewer": 0
        }
        
        for member in members:
            if member.is_active and member.role in roles_count:
                roles_count[member.role] += 1

        pending_invitations = self.db.query(TeamInvitation).filter(
            and_(
                TeamInvitation.organization_id == organization_id,
                TeamInvitation.status == InvitationStatus.PENDING.value
            )
        ).count()

        return {
            "total_members": len(members),
            "active_members": active_count,
            "pending_invitations": pending_invitations,
            "roles_breakdown": roles_count
        }

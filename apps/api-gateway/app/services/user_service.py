import re
from uuid import UUID
from typing import Optional
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, Organization, Subscription, organization_members
from app.schemas.auth import UserCreate
from app.core.security import get_password_hash, verify_password


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get a user by email address."""
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """Get a user by ID."""
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user_data: UserCreate) -> tuple[User, Organization]:
    """Create a new user and their organization."""
    # Create user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
    )
    db.add(user)
    await db.flush()

    # Create organization
    org_name = user_data.organization_name or f"{user_data.email.split('@')[0]}'s Organization"
    org_slug = slugify(org_name)
    
    # Ensure unique slug
    existing = await db.execute(select(Organization).where(Organization.slug == org_slug))
    if existing.scalar_one_or_none():
        org_slug = f"{org_slug}-{str(user.id)[:8]}"
    
    organization = Organization(
        name=org_name,
        slug=org_slug,
    )
    db.add(organization)
    await db.flush()

    # Add user to organization as admin
    await db.execute(
        insert(organization_members).values(
            user_id=user.id,
            organization_id=organization.id,
            role='admin'
        )
    )

    # Create free subscription
    subscription = Subscription(
        organization_id=organization.id,
        plan_id='free',
        status='active',
    )
    db.add(subscription)
    
    await db.commit()
    await db.refresh(user)
    await db.refresh(organization)
    
    return user, organization


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password."""
    user = await get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


async def get_user_organization(db: AsyncSession, user_id: UUID) -> Optional[Organization]:
    """Get the primary organization for a user."""
    result = await db.execute(
        select(Organization)
        .join(organization_members)
        .where(organization_members.c.user_id == user_id)
        .limit(1)
    )
    return result.scalar_one_or_none()

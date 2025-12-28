from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import Token, UserCreate, UserResponse, UserWithOrganization, OrganizationResponse
from app.services.user_service import (
    create_user,
    authenticate_user,
    get_user_by_email,
    get_user_organization,
)
from app.core.security import create_access_token, create_refresh_token, get_current_user
from app.core.sanitize import sanitize_html, validate_email, validate_password_strength
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserWithOrganization)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user and create their organization."""
    # Validate email format
    if not validate_email(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate password strength
    password_check = validate_password_strength(user_data.password)
    if not password_check["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Password does not meet requirements",
                "issues": password_check["issues"]
            }
        )
    
    # Sanitize user inputs to prevent XSS
    sanitized_full_name = sanitize_html(user_data.full_name)
    sanitized_org_name = sanitize_html(user_data.organization_name)
    
    # Create a new UserCreate with sanitized data
    sanitized_user_data = UserCreate(
        email=user_data.email.lower().strip(),
        password=user_data.password,
        full_name=sanitized_full_name,
        organization_name=sanitized_org_name
    )
    
    # Check if user already exists
    existing_user = await get_user_by_email(db, sanitized_user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user and organization
    user, organization = await create_user(db, sanitized_user_data)
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return UserWithOrganization(
        user=UserResponse.model_validate(user),
        organization=OrganizationResponse.model_validate(organization),
        token=Token(access_token=access_token, refresh_token=refresh_token)
    )


@router.post("/token", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login and get access token."""
    # Sanitize and normalize email
    email = form_data.username.lower().strip()
    
    user = await authenticate_user(db, email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """Get current user information."""
    return UserResponse(**current_user)


@router.get("/me/organization", response_model=OrganizationResponse)
async def get_current_user_organization(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's organization."""
    from uuid import UUID
    organization = await get_user_organization(db, UUID(current_user["id"]))
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    return OrganizationResponse.model_validate(organization)

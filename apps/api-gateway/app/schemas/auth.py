from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int
    type: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    organization_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str]
    is_active: bool
    is_platform_admin: bool = False

    class Config:
        from_attributes = True


class OrganizationResponse(BaseModel):
    id: UUID
    name: str
    slug: str

    class Config:
        from_attributes = True


class UserWithOrganization(BaseModel):
    user: UserResponse
    organization: Optional[OrganizationResponse]
    token: Token

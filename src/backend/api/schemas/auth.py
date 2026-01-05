"""
Pydantic schemas for authentication API
"""

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """Schema for user registration request."""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """Schema for user login request."""

    username: str
    password: str


class Token(BaseModel):
    """Schema for access token response."""

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Schema for user information response."""

    id: int
    email: str
    username: str
    is_active: bool

    class Config:
        """Pydantic config."""

        from_attributes = True  # Allows ORM mode

"""
Pydantic schemas for AI Chat API
"""

from pydantic import BaseModel
from typing import Optional


class AIChatRequest(BaseModel):
    """Schema for AI chat request."""

    message: str
    verbose: Optional[bool] = False


class AIChatResponse(BaseModel):
    """Schema for AI chat response."""

    intent: Optional[str] = None
    result: Optional[dict] = None
    message: str
    success: bool


class AIError(BaseModel):
    """Schema for AI error response."""

    detail: str
    success: bool = False

"""
Pydantic schemas for Task API
"""

from pydantic import BaseModel, Field
from typing import Optional


class TaskCreate(BaseModel):
    """Schema for creating a new task."""

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: str = Field("medium", pattern="^(low|medium|high)$")


class TaskUpdate(BaseModel):
    """Schema for updating a task."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: Optional[str] = Field(None, pattern="^(pending|complete)$")
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")


class TaskResponse(BaseModel):
    """Schema for task response."""

    id: int
    user_id: int
    title: str
    description: Optional[str]
    status: str
    priority: str

    class Config:
        """Pydantic config."""

        from_attributes = True  # Allows ORM mode


class TaskListResponse(BaseModel):
    """Schema for paginated task list response."""

    total: int
    items: list[TaskResponse]


class TaskSummary(BaseModel):
    """Schema for task summary."""

    total_count: int
    pending_count: int
    complete_count: int
    high_priority_pending: int

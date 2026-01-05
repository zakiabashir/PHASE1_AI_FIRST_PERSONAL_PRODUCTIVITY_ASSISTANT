"""
Task table model with user relationship
"""

import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import mapped_column
from src.backend.models.base import Base, TimestampMixin


class TaskStatus(str, enum.Enum):
    """Task status enum."""
    PENDING = "pending"
    COMPLETE = "complete"


class TaskPriority(str, enum.Enum):
    """Task priority enum."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(Base, TimestampMixin):
    """Task model linked to a user."""

    __tablename__ = "tasks"

    id: Column = Column(Integer, primary_key=True, index=True)
    # Foreign key to user
    user_id: Column = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Task fields (match Phase I model)
    title: Column = Column(String(200), nullable=False)
    description: Column = Column(Text, nullable=True)
    status: Column = Column(Enum(TaskStatus), default=TaskStatus.PENDING, nullable=False)
    priority: Column = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM, nullable=False)

    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title={self.title}, user_id={self.user_id})>"

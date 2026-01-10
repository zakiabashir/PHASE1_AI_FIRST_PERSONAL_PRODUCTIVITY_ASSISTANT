"""
T006, T007: Data models for Task and TaskSummary
"""

from dataclasses import dataclass, field
from typing import Optional


@dataclass
class Task:
    """T006: Represents a single task in the productivity assistant.

    Attributes:
        id: Unique identifier in format "task-N" where N is sequential
        title: Brief name/description of the task (1-200 characters, required)
        description: Optional detailed information (0-1000 characters)
        status: Current state - "pending" or "complete"
        priority: Importance level - "low", "medium", or "high"
    """
    id: str
    title: str
    description: Optional[str] = None
    status: str = "pending"  # "pending" | "complete"
    priority: str = "medium"  # "low" | "medium" | "high"


@dataclass
class TaskSummary:
    """T007: Aggregated summary of all tasks.

    Attributes:
        total_count: Total number of tasks
        pending_count: Number of pending tasks
        complete_count: Number of complete tasks
        high_priority_pending: List of high-priority pending task IDs
        medium_priority_pending: List of medium-priority pending task IDs
        low_priority_pending: List of low-priority pending task IDs
    """
    total_count: int
    pending_count: int
    complete_count: int
    high_priority_pending: list[str] = field(default_factory=list)
    medium_priority_pending: list[str] = field(default_factory=list)
    low_priority_pending: list[str] = field(default_factory=list)

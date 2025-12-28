"""
T052-T056: Task summarization implementation
"""

from src.storage.models import TaskSummary
from src.storage.memory_store import get_all_tasks


def summarize_tasks() -> TaskSummary:
    """T052: Generate a summary of all tasks.

    Returns:
        TaskSummary: Aggregated task information including:
            - total_count: Total number of tasks
            - pending_count: Number of pending tasks
            - complete_count: Number of complete tasks
            - high_priority_pending: List of high-priority pending task IDs
            - medium_priority_pending: List of medium-priority pending task IDs
            - low_priority_pending: List of low-priority pending task IDs
    """
    tasks = get_all_tasks()

    # T053: Count tasks
    total_count = len(tasks)
    pending_count = sum(1 for t in tasks if t.status == "pending")
    complete_count = sum(1 for t in tasks if t.status == "complete")

    # T053: Group pending tasks by priority
    high_priority_pending = [
        t.id for t in tasks
        if t.status == "pending" and t.priority == "high"
    ]
    medium_priority_pending = [
        t.id for t in tasks
        if t.status == "pending" and t.priority == "medium"
    ]
    low_priority_pending = [
        t.id for t in tasks
        if t.status == "pending" and t.priority == "low"
    ]

    return TaskSummary(
        total_count=total_count,
        pending_count=pending_count,
        complete_count=complete_count,
        high_priority_pending=high_priority_pending,
        medium_priority_pending=medium_priority_pending,
        low_priority_pending=low_priority_pending,
    )

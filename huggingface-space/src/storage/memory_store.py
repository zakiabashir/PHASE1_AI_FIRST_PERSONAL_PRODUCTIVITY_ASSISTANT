"""
T009, T010, T011: In-memory task store implementation
"""

from typing import Optional

from src.storage.models import Task


# T009: Global in-memory store (Constitution Principle IV: NO file I/O, NO databases)
_tasks: dict[str, Task] = {}
_next_id: int = 1
_current_mode: str = "ai"  # T058: Mode persistence (default="ai")


def generate_id() -> str:
    """T010: Generate next sequential task ID.

    Returns:
        Task ID in format "task-N" where N is sequential starting from 1
    """
    global _next_id
    task_id = f"task-{_next_id}"
    _next_id += 1
    return task_id


def get_store() -> dict[str, Task]:
    """T011: Get the global in-memory task store.

    Returns:
        Dictionary mapping task IDs to Task objects
    """
    return _tasks


def get_current_mode() -> str:
    """Get the current interaction mode.

    Returns:
        "ai" or "manual"
    """
    global _current_mode
    return _current_mode


def set_current_mode(mode: str) -> None:
    """Set the current interaction mode.

    Args:
        mode: "ai" or "manual"
    """
    global _current_mode
    _current_mode = mode


def add_task(task: Task) -> None:
    """Add a task to the store.

    Args:
        task: Task object to add
    """
    _tasks[task.id] = task


def get_task(id: str) -> Optional[Task]:
    """Get a task by ID.

    Args:
        id: Task ID (e.g., "task-1")

    Returns:
        Task object or None if not found
    """
    return _tasks.get(id)


def task_exists(id: str) -> bool:
    """Check if a task ID exists.

    Args:
        id: Task ID (e.g., "task-1")

    Returns:
        True if task exists, False otherwise
    """
    return id in _tasks


def update_task_in_store(task: Task) -> None:
    """Update a task in the store.

    Args:
        task: Task object to replace existing entry
    """
    _tasks[task.id] = task


def delete_task_from_store(id: str) -> None:
    """Delete a task from the store.

    Args:
        id: Task ID to delete
    """
    del _tasks[id]


def get_all_tasks() -> list[Task]:
    """Get all tasks from the store.

    Returns:
        List of all Task objects
    """
    return list(_tasks.values())


def reset_store() -> None:
    """Reset the in-memory store (for testing purposes).

    Clears all tasks and resets the ID counter.
    """
    global _tasks, _next_id
    _tasks.clear()
    _next_id = 1

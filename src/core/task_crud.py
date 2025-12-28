"""
T021-T025: CRUD functions for task management
"""

from src.storage.models import Task
from src.storage.memory_store import (
    add_task,
    get_task,
    task_exists,
    update_task_in_store,
    delete_task_from_store,
    get_all_tasks,
    generate_id,
)
from src.config.constants import (
    DEFAULT_PRIORITY,
    DEFAULT_STATUS,
    VALID_PRIORITIES,
    VALID_STATUSES,
    TITLE_MIN_LENGTH,
    TITLE_MAX_LENGTH,
    DESCRIPTION_MAX_LENGTH,
)


def create_task(
    title: str,
    description: str | None = None,
    priority: str = DEFAULT_PRIORITY
) -> Task:
    """T021: Create a new task.

    Args:
        title: Task title (1-200 characters, non-empty)
        description: Optional task description (0-1000 characters)
        priority: Task priority ("low" | "medium" | "high"), defaults to "medium"

    Returns:
        Task: Created task with auto-generated ID

    Raises:
        ValueError: If title is empty or exceeds 200 characters
        ValueError: If description exceeds 1000 characters
        ValueError: If priority is not one of "low", "medium", "high"
    """
    # Validate title
    if not title or not title.strip():
        raise ValueError("Task title cannot be empty")
    if len(title) > TITLE_MAX_LENGTH:
        raise ValueError("Task title must be 200 characters or less")

    # Validate description
    if description is not None and len(description) > DESCRIPTION_MAX_LENGTH:
        raise ValueError("Task description must be 1000 characters or less")

    # Validate priority
    if priority not in VALID_PRIORITIES:
        raise ValueError("Task priority must be 'low', 'medium', or 'high'")

    # Generate ID and create task
    task_id = generate_id()
    task = Task(
        id=task_id,
        title=title.strip(),
        description=description,
        status=DEFAULT_STATUS,
        priority=priority
    )
    add_task(task)
    return task


def list_tasks() -> list[Task]:
    """T022: List all tasks.

    Returns:
        list[Task]: All tasks in the store (empty list if no tasks)
    """
    return get_all_tasks()


def update_task(
    id: str,
    title: str | None = None,
    description: str | None = None,
    status: str | None = None,
    priority: str | None = None
) -> Task:
    """T023: Update an existing task.

    Args:
        id: Task ID (e.g., "task-1")
        title: New title (1-200 characters), None to keep existing
        description: New description (0-1000 characters), None to keep existing
        status: New status ("pending" | "complete"), None to keep existing
        priority: New priority ("low" | "medium" | "high"), None to keep existing

    Returns:
        Task: Updated task

    Raises:
        ValueError: If task ID not found
        ValueError: If title is empty or exceeds 200 characters
        ValueError: If description exceeds 1000 characters
        ValueError: If status not "pending" or "complete"
        ValueError: If priority not "low", "medium", or "high"
    """
    # Check task exists
    if not task_exists(id):
        raise ValueError(f"Task '{id}' not found")

    # Get existing task
    existing_task = get_task(id)

    # Validate and update title
    if title is not None:
        if not title or not title.strip():
            raise ValueError("Task title cannot be empty")
        if len(title) > TITLE_MAX_LENGTH:
            raise ValueError("Task title must be 200 characters or less")
        existing_task.title = title.strip()

    # Validate and update description
    if description is not None:
        if len(description) > DESCRIPTION_MAX_LENGTH:
            raise ValueError("Task description must be 1000 characters or less")
        existing_task.description = description

    # Validate and update status
    if status is not None:
        if status not in VALID_STATUSES:
            raise ValueError("Task status must be 'pending' or 'complete'")
        existing_task.status = status

    # Validate and update priority
    if priority is not None:
        if priority not in VALID_PRIORITIES:
            raise ValueError("Task priority must be 'low', 'medium', or 'high'")
        existing_task.priority = priority

    # Update in store
    update_task_in_store(existing_task)
    return existing_task


def delete_task(id: str) -> None:
    """T024: Delete a task.

    Args:
        id: Task ID (e.g., "task-1")

    Raises:
        ValueError: If task ID not found
    """
    if not task_exists(id):
        raise ValueError(f"Task '{id}' not found")

    delete_task_from_store(id)


def complete_task(id: str) -> Task:
    """T025: Mark a task as complete.

    Args:
        id: Task ID (e.g., "task-1")

    Returns:
        Task: Updated task with status="complete"

    Raises:
        ValueError: If task ID not found
    """
    return update_task(id, status="complete")

# CRUD Function Contracts

**Feature**: 001-ai-productivity-assistant
**Phase**: I (CLI MVP)
**Date**: 2025-12-29

---

## Overview

This document defines the contracts for all CRUD functions. These functions are called by both manual CLI mode and AI mode, ensuring feature parity and testability.

**Location**: `src/core/task_crud.py`, `src/core/summarize.py`

---

## Function Signatures

### create_task

**Signature**:
```python
def create_task(
    title: str,
    description: str | None = None,
    priority: str = "medium"
) -> Task:
    """Create a new task.

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
```

**Behavior**:
1. Validate `title` is non-empty and <= 200 characters
2. Validate `description` is <= 1000 characters (if provided)
3. Validate `priority` is one of: "low", "medium", "high"
4. Generate sequential task ID: `task-{next_id}`
5. Create `Task` object with `status="pending"`
6. Add task to in-memory store
7. Increment `next_id` counter
8. Return created `Task`

**Examples**:
```python
# Create basic task
task = create_task("Study AI")
# Returns: Task(id="task-1", title="Study AI", description=None, status="pending", priority="medium")

# Create with all fields
task = create_task(
    title="Complete hackathon project",
    description="Build AI-first productivity assistant CLI",
    priority="high"
)
# Returns: Task(id="task-2", title="Complete hackathon project", description="Build AI-first productivity assistant CLI", status="pending", priority="high")
```

---

### list_tasks

**Signature**:
```python
def list_tasks() -> list[Task]:
    """List all tasks.

    Returns:
        list[Task]: All tasks in the store (empty list if no tasks)
    """
```

**Behavior**:
1. Retrieve all tasks from in-memory store
2. Return list of `Task` objects (order not specified)

**Examples**:
```python
# Empty store
tasks = list_tasks()
# Returns: []

# With tasks
tasks = list_tasks()
# Returns: [Task(...), Task(...), ...]
```

---

### update_task

**Signature**:
```python
def update_task(
    id: str,
    title: str | None = None,
    description: str | None = None,
    status: str | None = None,
    priority: str | None = None
) -> Task:
    """Update an existing task.

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
```

**Behavior**:
1. Validate task ID exists in store
2. Retrieve existing task
3. Update only non-None fields (partial update support)
4. Validate updated field values
5. Replace task in store with updated version
6. Return updated `Task`

**Examples**:
```python
# Update title only
task = update_task("task-1", title="Study AI tonight")
# Returns: Task(id="task-1", title="Study AI tonight", description=None, status="pending", priority="medium")

# Update status
task = update_task("task-1", status="complete")
# Returns: Task(id="task-1", title="Study AI tonight", description=None, status="complete", priority="medium")

# Multiple fields
task = update_task("task-1", description="Focus on CRUD functions", priority="high")
# Returns: Task(id="task-1", title="Study AI tonight", description="Focus on CRUD functions", status="complete", priority="high")
```

---

### delete_task

**Signature**:
```python
def delete_task(id: str) -> None:
    """Delete a task.

    Args:
        id: Task ID (e.g., "task-1")

    Raises:
        ValueError: If task ID not found
    """
```

**Behavior**:
1. Validate task ID exists in store
2. Remove task from store
3. Return None (no output)

**Examples**:
```python
# Delete existing task
delete_task("task-1")
# Returns: None

# Delete non-existent task
delete_task("task-999")
# Raises: ValueError("Task 'task-999' not found")
```

---

### complete_task

**Signature**:
```python
def complete_task(id: str) -> Task:
    """Mark a task as complete.

    Args:
        id: Task ID (e.g., "task-1")

    Returns:
        Task: Updated task with status="complete"

    Raises:
        ValueError: If task ID not found
    """
```

**Behavior**:
1. Validate task ID exists in store
2. Retrieve existing task
3. Set `status="complete"`
4. Replace task in store with updated version
5. Return updated `Task`

**Examples**:
```python
# Complete existing task
task = complete_task("task-1")
# Returns: Task(id="task-1", title="Study AI", description=None, status="complete", priority="medium")
```

---

### summarize_tasks

**Signature**:
```python
def summarize_tasks() -> TaskSummary:
    """Generate a summary of all tasks.

    Returns:
        TaskSummary: Aggregated task information including:
            - total_count: Total number of tasks
            - pending_count: Number of pending tasks
            - complete_count: Number of complete tasks
            - high_priority_pending: List of high-priority pending task IDs
            - medium_priority_pending: List of medium-priority pending task IDs
            - low_priority_pending: List of low-priority pending task IDs
    """
```

**Behavior**:
1. Retrieve all tasks from store
2. Count total, pending, and complete tasks
3. Group pending tasks by priority
4. Return `TaskSummary` object

**Examples**:
```python
# Empty store
summary = summarize_tasks()
# Returns: TaskSummary(total_count=0, pending_count=0, complete_count=0, high_priority_pending=[], medium_priority_pending=[], low_priority_pending=[])

# With mixed tasks
summary = summarize_tasks()
# Returns: TaskSummary(
#     total_count=5,
#     pending_count=3,
#     complete_count=2,
#     high_priority_pending=["task-1", "task-3"],
#     medium_priority_pending=["task-4"],
#     low_priority_pending=["task-5"]
# )
```

---

## Error Contract

All CRUD functions raise `ValueError` for error conditions with descriptive messages:

| Error Condition | Exception | Message |
|-----------------|-----------|---------|
| Empty title | `ValueError` | `"Task title cannot be empty"` |
| Title too long | `ValueError` | `"Task title must be 200 characters or less"` |
| Description too long | `ValueError` | `"Task description must be 1000 characters or less"` |
| Invalid status | `ValueError` | `"Task status must be 'pending' or 'complete'"` |
| Invalid priority | `ValueError` | `"Task priority must be 'low', 'medium', or 'high'"` |
| Task not found | `ValueError` | `"Task 'task-X' not found"` |

**No other exceptions are raised** by CRUD functions (e.g., no `KeyError`, no `TypeError`).

---

## Thread Safety

**Phase I**: No thread safety guarantees. Single-threaded execution assumed.

**Future Phases**: May add locks if multi-threading introduced.

---

## Persistence Contract

**Phase I**: NO persistence. All data lost on application restart.

**Phase II**: Persistence layer added via repository pattern. CRUD function signatures remain unchanged.

---

## Testing Contract

Each CRUD function MUST have:
1. At least one happy-path unit test
2. At least one error-path unit test (validation failure)

**Example**:
```python
# tests/unit/test_task_crud.py

def test_create_task_basic():
    task = create_task("Test task")
    assert task.id == "task-1"
    assert task.title == "Test task"
    assert task.status == "pending"
    assert task.priority == "medium"

def test_create_task_empty_title():
    with pytest.raises(ValueError, match="Task title cannot be empty"):
        create_task("")
```

---

## Contracts Complete

All CRUD functions fully specified with signatures, behavior, error handling, and examples.

**Sign-off**: CRUD contracts ready for implementation.

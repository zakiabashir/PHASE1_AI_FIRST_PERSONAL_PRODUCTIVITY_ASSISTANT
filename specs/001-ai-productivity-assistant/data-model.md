# Data Model: AI-First Personal Productivity Assistant

**Feature**: 001-ai-productivity-assistant
**Date**: 2025-12-29
**Phase**: I (CLI MVP)

---

## Overview

This document defines the data model for Phase I. The model is intentionally simple to support hackathon MVP while enabling clean evolution to Phase II (Web) and Phase III (Chatbot).

---

## Core Entities

### Task

**Purpose**: Represents a single actionable item that a user wants to track.

**Fields**:

| Field | Type | Required | Constraints | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| `id` | `str` | Yes | Format: `"task-N"` where N is sequential integer | (auto-generated) | Unique identifier for referencing this task |
| `title` | `str` | Yes | 1-200 characters, non-empty | - | Brief name/description of the task |
| `description` | `str \| None` | No | 0-1000 characters | `None` | Optional detailed information about the task |
| `status` | `str` | Yes | Values: `"pending"` \| `"complete"` | `"pending"` | Current state of the task |
| `priority` | `str` | Yes | Values: `"low"` \| `"medium"` \| `"high"` | `"medium"` | Importance level |

**Python Implementation**:
```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class Task:
    """Represents a single task in the productivity assistant."""
    id: str
    title: str
    description: Optional[str] = None
    status: str = "pending"  # "pending" | "complete"
    priority: str = "medium"  # "low" | "medium" | "high"
```

**Validation Rules**:
- `title` cannot be empty or whitespace-only
- `title` maximum length: 200 characters
- `description` maximum length: 1000 characters (if provided)
- `status` must be one of: `"pending"`, `"complete"`
- `priority` must be one of: `"low"`, `"medium"`, `"high"`
- `id` must be unique within the task store

**State Transitions**:
```
┌──────────┐  complete_task()   ┌──────────┐
│ pending  │ ──────────────────> │ complete │
└──────────┘                    └──────────┘
     ▲                                │
     │                                │ update_task(status="pending")
     └────────────────────────────────┘
```

---

### TaskSummary

**Purpose**: Represents aggregated summary information about all tasks.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `total_count` | `int` | Total number of tasks |
| `pending_count` | `int` | Number of tasks with status `"pending"` |
| `complete_count` | `int` | Number of tasks with status `"complete"` |
| `high_priority_pending` | `list[str]` | List of task IDs with `"high"` priority and `"pending"` status |
| `medium_priority_pending` | `list[str]` | List of task IDs with `"medium"` priority and `"pending"` status |
| `low_priority_pending` | `list[str]` | List of task IDs with `"low"` priority and `"pending"` status |

**Python Implementation**:
```python
from dataclasses import dataclass
from typing import List

@dataclass
class TaskSummary:
    """Aggregated summary of all tasks."""
    total_count: int
    pending_count: int
    complete_count: int
    high_priority_pending: List[str]
    medium_priority_pending: List[str]
    low_priority_pending: List[str]
```

---

## Enums

### Intent

**Purpose**: Represents the classified user intent from natural language input.

**Values**:
```python
from enum import Enum

class Intent(Enum):
    """User intent classifications for AI mode."""
    CREATE = "CREATE"      # Create a new task
    READ = "READ"          # List/display tasks
    UPDATE = "UPDATE"      # Modify an existing task
    DELETE = "DELETE"      # Delete a task
    COMPLETE = "COMPLETE"  # Mark a task as complete
    SUMMARIZE = "SUMMARIZE" # Generate task summary
```

---

## Collections

### TaskStore

**Purpose**: In-memory collection of all tasks.

**Structure**:
```python
# Global in-memory store (Phase I only)
_tasks: dict[str, Task] = {}
_next_id: int = 1
```

**Operations**:
- `add_task(task: Task) -> None` - Add task to store
- `get_task(id: str) -> Task | None` - Retrieve task by ID
- `get_all_tasks() -> list[Task]` - Get all tasks
- `update_task(task: Task) -> None` - Replace task in store
- `delete_task(id: str) -> None` - Remove task from store
- `task_exists(id: str) -> bool` - Check if task ID exists
- `generate_id() -> str` - Generate next sequential ID (task-1, task-2, etc.)

**Constraints**:
- NO file I/O (Constitution Principle IV)
- NO database connections
- All data lost on application restart (intentional for Phase I)

---

## Relationships

**Task** is a standalone entity with no relationships to other entities.

---

## Indexing

### Primary Index
- `id` (string): Unique identifier, used for all CRUD operations

### No Secondary Indexes
- Phase I uses simple dict lookup by ID
- No search/filtering beyond full list display
- Phase II may add indexes for title search, priority filtering, etc.

---

## Data Lifecycle

### Creation
1. User invokes `create_task` (CLI or AI mode)
2. CRUD function generates sequential ID (`task-{next_id}`)
3. Task object created with defaults applied (`status="pending"`, `priority="medium"`)
4. Task added to `_tasks` dict
5. `next_id` incremented

### Retrieval
- **Single task**: Direct dict lookup by `id` (O(1))
- **All tasks**: Return all values from `_tasks` dict

### Update
- Task retrieved by `id`
- Specified fields updated (non-None parameters only)
- Modified task replaces old entry in dict

### Deletion
- Task removed from `_tasks` dict by `id`
- No soft delete or archival (Phase I)

### Expiration
- All data discarded on application restart (no persistence)

---

## Validation

### Field-Level Validation

| Field | Validation | Error Message |
|-------|-----------|---------------|
| `title` | Non-empty, 1-200 chars | `"Task title cannot be empty"` / `"Task title must be 200 characters or less"` |
| `description` | Max 1000 chars | `"Task description must be 1000 characters or less"` |
| `status` | One of: pending, complete | `"Task status must be 'pending' or 'complete'"` |
| `priority` | One of: low, medium, high | `"Task priority must be 'low', 'medium', or 'high'"` |
| `id` | Exists in store (for update/delete/complete) | `"Task 'task-X' not found"` |

### Validation Location
- **CRUD Layer**: All validation performed in CRUD functions (`src/core/task_crud.py`)
- **AI Layer**: NO validation—trusts CRUD layer
- **CLI Layer**: NO business logic validation—syntax only

---

## Evolution to Phase II (Web)

### Changes Required

**Persistence**:
```
In-Memory Store → Database (SQLite or PostgreSQL)
```

**Model Compatibility**:
- `Task` dataclass → SQLAlchemy ORM model (or Pydantic + repository)
- Fields remain identical (no breaking changes)
- Add `created_at`, `updated_at` timestamps (optional)

**Migration Strategy**:
1. Introduce repository pattern interface
2. Implement `InMemoryRepository` (Phase I)
3. Implement `DatabaseRepository` (Phase II)
4. CRUD functions call repository interface (no changes to signatures)

---

## Evolution to Phase III (Chatbot)

### No Model Changes

The `Task` and `TaskSummary` models remain identical across all phases. Only the interface layer changes (CLI → Web → Chatbot).

---

## Data Volume Constraints

**Phase I Limits**:
- Maximum tasks: ~1000 (performance degrades gracefully beyond)
- No pagination (full list display)
- No archiving or soft delete

**Justification**:
- MVP scope for hackathon demo
- Single user, single session
- Phase II introduces database with proper scaling

---

## Security Considerations

### Input Sanitization
- No SQL injection risk (no database in Phase I)
- No command injection (argparse handles CLI escaping)
- LLM prompt injection mitigated by system prompt constraints

### Data Privacy
- All data stored in-memory (discarded on restart)
- No data transmitted to LLM except user input for intent classification
- API key stored in environment variable (never in code)

---

## Data Model Complete

All entities defined with clear field specifications, validation rules, and lifecycle management. Ready for contract generation and implementation.

**Sign-off**: Data model aligned with spec, constitution, and research findings.

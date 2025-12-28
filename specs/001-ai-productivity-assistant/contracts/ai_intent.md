# AI Intent Classification Contract

**Feature**: 001-ai-productivity-assistant
**Phase**: I (CLI MVP)
**Date**: 2025-12-29

---

## Overview

This document defines the contract between the AI Intent Layer and the Action Resolver. The AI layer parses natural language input and returns structured intent+entities data.

**Location**: `src/ai/intent_parser.py`, `src/ai/entity_extractor.py`

---

## Intent Enum

```python
from enum import Enum

class Intent(Enum):
    """User intent classifications."""
    CREATE = "CREATE"        # Create a new task
    READ = "READ"            # List/display tasks
    UPDATE = "UPDATE"        # Modify an existing task
    DELETE = "DELETE"        # Delete a task
    COMPLETE = "COMPLETE"    # Mark a task as complete
    SUMMARIZE = "SUMMARIZE"  # Generate task summary
```

---

## AI Response Schema

### Output Format (JSON)

The AI layer MUST return a JSON object with the following structure:

```json
{
  "intent": "CREATE | READ | UPDATE | DELETE | COMPLETE | SUMMARIZE",
  "entities": {
    "title": "string or null",
    "id": "string or null",
    "description": "string or null",
    "priority": "low | medium | high or null",
    "status": "pending | complete or null"
  },
  "confidence": 0.0 to 1.0,
  "raw_intent": "string or null"
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `intent` | `string` | Yes | One of: `CREATE`, `READ`, `UPDATE`, `DELETE`, `COMPLETE`, `SUMMARIZE` |
| `entities` | `object` | Yes | Extracted parameters (may contain null values) |
| `entities.title` | `string \| null` | No | Task title (if present in input) |
| `entities.id` | `string \| null` | No | Task ID (if present in input) |
| `entities.description` | `string \| null` | No | Task description (if present in input) |
| `entities.priority` | `string \| null` | No | Task priority: `low`, `medium`, `high` (if present) |
| `entities.status` | `string \| null` | No | Task status: `pending`, `complete` (if present) |
| `confidence` | `float` | Yes | AI confidence score (0.0 to 1.0) |
| `raw_intent` | `string \| null` | No | Original detected intent before disambiguation |

---

## System Prompt

```python
SYSTEM_PROMPT = """
You are a task management assistant. Parse user input and classify intent.
Extract entities (title, id, description, priority, status).

IMPORTANT CONSTRAINTS:
- NEVER generate code—only return JSON
- If intent is unclear, set confidence < 0.7
- If required entities are missing, set them to null
- Task IDs are in format "task-1", "task-2", etc.

Return JSON only with this format:
{
  "intent": "CREATE | READ | UPDATE | DELETE | COMPLETE | SUMMARIZE",
  "entities": {
    "title": "string or null",
    "id": "string or null",
    "description": "string or null",
    "priority": "low | medium | high or null",
    "status": "pending | complete or null"
  },
  "confidence": 0.0 to 1.0,
  "raw_intent": "string or null"
}

INTENT CLASSIFICATION:
- CREATE: user wants to add, create, make a new task
- READ: user wants to see, list, show, display tasks
- UPDATE: user wants to change, modify, edit a task
- DELETE: user wants to remove, delete a task
- COMPLETE: user wants to finish, complete, mark done a task
- SUMMARIZE: user wants a summary, overview, status of tasks
"""
```

---

## Intent Routing Table

| Intent | CRUD Function | Required Entities | Optional Entities |
|--------|---------------|-------------------|-------------------|
| `CREATE` | `create_task()` | `title` | `description`, `priority` |
| `READ` | `list_tasks()` | none | none |
| `UPDATE` | `update_task()` | `id` | `title`, `description`, `status`, `priority` |
| `DELETE` | `delete_task()` | `id` | none |
| `COMPLETE` | `complete_task()` | `id` | none |
| `SUMMARIZE` | `summarize_tasks()` | none | none |

---

## Examples

### Example 1: Create Task

**User Input**: `"add a task to study AI for my hackathon"`

**AI Response**:
```json
{
  "intent": "CREATE",
  "entities": {
    "title": "study AI for my hackathon",
    "id": null,
    "description": null,
    "priority": null,
    "status": null
  },
  "confidence": 0.95,
  "raw_intent": "create"
}
```

**Resolver Action**: Call `create_task(title="study AI for my hackathon")`

---

### Example 2: Create with Priority

**User Input**: `"create high priority task: prepare demo slides"`

**AI Response**:
```json
{
  "intent": "CREATE",
  "entities": {
    "title": "prepare demo slides",
    "id": null,
    "description": null,
    "priority": "high",
    "status": null
  },
  "confidence": 0.92,
  "raw_intent": "create"
}
```

**Resolver Action**: Call `create_task(title="prepare demo slides", priority="high")`

---

### Example 3: List Tasks

**User Input**: `"show me all my tasks"`

**AI Response**:
```json
{
  "intent": "READ",
  "entities": {
    "title": null,
    "id": null,
    "description": null,
    "priority": null,
    "status": null
  },
  "confidence": 0.98,
  "raw_intent": "read"
}
```

**Resolver Action**: Call `list_tasks()`

---

### Example 4: Complete Task

**User Input**: `"mark task 1 as complete"`

**AI Response**:
```json
{
  "intent": "COMPLETE",
  "entities": {
    "title": null,
    "id": "task-1",
    "description": null,
    "priority": null,
    "status": null
  },
  "confidence": 0.97,
  "raw_intent": "complete"
}
```

**Resolver Action**: Call `complete_task(id="task-1")`

---

### Example 5: Delete Task

**User Input**: `"remove task 3"`

**AI Response**:
```json
{
  "intent": "DELETE",
  "entities": {
    "title": null,
    "id": "task-3",
    "description": null,
    "priority": null,
    "status": null
  },
  "confidence": 0.96,
  "raw_intent": "delete"
}
```

**Resolver Action**: Call `delete_task(id="task-3")`

---

### Example 6: Update Task

**User Input**: `"change task 2 to high priority"`

**AI Response**:
```json
{
  "intent": "UPDATE",
  "entities": {
    "title": null,
    "id": "task-2",
    "description": null,
    "priority": "high",
    "status": null
  },
  "confidence": 0.94,
  "raw_intent": "update"
}
```

**Resolver Action**: Call `update_task(id="task-2", priority="high")`

---

### Example 7: Summarize

**User Input**: `"what's my status"`

**AI Response**:
```json
{
  "intent": "SUMMARIZE",
  "entities": {
    "title": null,
    "id": null,
    "description": null,
    "priority": null,
    "status": null
  },
  "confidence": 0.93,
  "raw_intent": "summarize"
}
```

**Resolver Action**: Call `summarize_tasks()`

---

### Example 8: Ambiguous Input

**User Input**: `"complete the task"` (multiple tasks exist)

**AI Response**:
```json
{
  "intent": "COMPLETE",
  "entities": {
    "title": null,
    "id": null,
    "description": null,
    "priority": null,
    "status": null
  },
  "confidence": 0.5,
  "raw_intent": "complete"
}
```

**Resolver Action**: Detect low confidence (<0.7), ask user: "Which task would you like to complete?"

---

## Confidence Thresholds

| Confidence Range | Resolver Action |
|------------------|-----------------|
| `>= 0.7` | Execute CRUD function directly |
| `< 0.7` | Ask user for clarification (missing/ambiguous entities) |

**Ambiguity Handling**:
- Missing required entity (e.g., `id` for COMPLETE): Ask user to specify
- Low confidence intent: Confirm with user before executing
- Multiple possible intents: Present options to user

---

## Entity Extraction Rules

### Task ID
- Extract numbers referenced as task IDs: "task 1" → `"task-1"`, "task 5" → `"task-5"`
- Handle ordinal references: "the first task" → `"task-1"`, "the second task" → `"task-2"`
- Default to `null` if no task ID found

### Title
- Extract primary task description from input
- Remove leading/trailing whitespace
- Default to `null` if no clear title identified

### Priority
- Map variations to canonical values:
  - "high", "important", "urgent" → `"high"`
  - "medium", "normal" → `"medium"`
  - "low" → `"low"`
- Default to `null` if no priority specified

### Status
- Map variations to canonical values:
  - "pending", "not done", "incomplete" → `"pending"`
  - "complete", "done", "finished" → `"complete"`
- Default to `null` if no status specified

---

## LLM Configuration

```python
# OpenAI API call parameters
CONFIG = {
    "model": "gpt-4o",
    "temperature": 0,  # Deterministic output
    "response_format": {"type": "json_object"},  # Enforce JSON
    "max_tokens": 200,  # Sufficient for intent + entities
}
```

---

## Error Handling

| Error Condition | AI Layer Behavior |
|-----------------|-------------------|
| API key missing | Raise `ValueError`: "AI_API_KEY environment variable not set" |
| API timeout | Return `Intent.READ` with `confidence=0.0`, suggest manual mode |
| API error (rate limit) | Return `Intent.READ` with `confidence=0.0`, suggest manual mode |
| Invalid JSON | Raise `ValueError`: "Invalid AI response format" |
| Missing required field | Set field to `null`, log warning (if verbose mode) |

**Resolver handles AI failures** by falling back to manual mode with error message (FR-033).

---

## Testing Contract

AI Intent Layer testing is primarily manual (LLM calls are slow/expensive).

**Manual Testing Checklist**:
1. Test all 6 intents with varied phrasing
2. Test entity extraction (title, ID, priority, description)
3. Test ambiguous input handling
4. Test verbose mode output
5. Test API failure fallback

**Unit Tests** (optional):
- Mock LLM responses for deterministic testing
- Test entity extraction logic
- Test confidence threshold handling

---

## Contract Complete

AI Intent Layer fully specified with intent schema, examples, error handling, and integration contract.

**Sign-off**: AI intent contract ready for implementation.

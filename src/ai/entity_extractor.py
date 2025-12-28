"""
T037: Entity extraction and validation
"""

import re
from typing import Any

from src.config.constants import VALID_PRIORITIES, VALID_STATUSES


def extract_entities(ai_response: dict[str, Any]) -> dict[str, Any]:
    """T037: Extract and validate entities from AI response.

    Args:
        ai_response: Raw AI response dict

    Returns:
        Validated and normalized entities dict
    """
    entities = ai_response.get("entities", {})

    # Extract and normalize title
    title = entities.get("title")
    if title:
        title = title.strip()

    # Extract and normalize task ID
    task_id = entities.get("id")
    if task_id:
        # Normalize to "task-N" format
        if isinstance(task_id, str):
            # Already in format "task-N"
            if task_id.startswith("task-"):
                pass
            # Just a number like "1"
            elif task_id.isdigit():
                task_id = f"task-{task_id}"
            # Ordinal like "first", "second"
            else:
                task_id = _normalize_ordinal_to_id(task_id)

    # Normalize priority
    priority = entities.get("priority")
    if priority:
        priority = _normalize_priority(priority)

    # Normalize status
    status = entities.get("status")
    if status:
        status = _normalize_status(status)

    # Extract description
    description = entities.get("description")
    if description:
        description = description.strip()

    return {
        "title": title,
        "id": task_id,
        "description": description,
        "priority": priority,
        "status": status,
    }


def _normalize_ordinal_to_id(ordinal: str) -> str | None:
    """Convert ordinal word to task ID.

    Args:
        ordinal: Ordinal like "first", "second", "third"

    Returns:
        Task ID like "task-1" or None if not parseable
    """
    ordinals = {
        "first": "1", "1st": "1",
        "second": "2", "2nd": "2",
        "third": "3", "3rd": "3",
        "fourth": "4", "4th": "4",
        "fifth": "5", "5th": "5",
        "sixth": "6", "6th": "6",
        "seventh": "7", "7th": "7",
        "eighth": "8", "8th": "8",
        "ninth": "9", "9th": "9",
        "tenth": "10", "10th": "10",
    }

    ordinal_lower = ordinal.lower().strip()
    if ordinal_lower in ordinals:
        return f"task-{ordinals[ordinal_lower]}"

    return None


def _normalize_priority(priority: str) -> str | None:
    """Normalize priority to canonical value.

    Args:
        priority: Raw priority string

    Returns:
        Normalized priority or None if invalid
    """
    priority_lower = priority.lower().strip()

    # Map variations to canonical values
    if priority_lower in ("high", "important", "urgent"):
        return "high"
    elif priority_lower in ("medium", "normal"):
        return "medium"
    elif priority_lower == "low":
        return "low"

    return None


def _normalize_status(status: str) -> str | None:
    """Normalize status to canonical value.

    Args:
        status: Raw status string

    Returns:
        Normalized status or None if invalid
    """
    status_lower = status.lower().strip()

    # Map variations to canonical values
    if status_lower in ("pending", "not done", "incomplete"):
        return "pending"
    elif status_lower in ("complete", "done", "finished"):
        return "complete"

    return None

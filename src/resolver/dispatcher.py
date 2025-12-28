"""
T031, T032, T040, T041, T042, T057: Action Resolver - maps intent/commands to CRUD functions
"""

from typing import Any, Callable

from src.ai.intent_parser import Intent
from src.core.task_crud import (
    create_task,
    list_tasks,
    update_task,
    delete_task,
    complete_task,
)
from src.core.summarize import summarize_tasks


# T032: Routing table for intents to CRUD functions
INTENT_ROUTING: dict[str, Callable] = {
    "CREATE": create_task,
    "READ": list_tasks,
    "UPDATE": update_task,
    "DELETE": delete_task,
    "COMPLETE": complete_task,
    "SUMMARIZE": summarize_tasks,
}


# T040: CLI command routing table (for manual mode)
CLI_ROUTING: dict[str, Callable] = {
    "create-task": create_task,
    "list-tasks": list_tasks,
    "update-task": update_task,
    "delete-task": delete_task,
    "complete-task": complete_task,
    "summarize": summarize_tasks,
}


def validate_params(intent: Intent, params: dict) -> bool:
    """T041: Validate that required parameters are present for an intent.

    Args:
        intent: The classified intent
        params: Extracted parameters

    Returns:
        True if all required params are present
    """
    required_params = {
        Intent.CREATE: ["title"],
        Intent.READ: [],
        Intent.UPDATE: ["id"],
        Intent.DELETE: ["id"],
        Intent.COMPLETE: ["id"],
        Intent.SUMMARIZE: [],
    }

    for required in required_params.get(intent, []):
        if required not in params or params[required] is None:
            return False
    return True


def handle_ambiguity(intent: Intent, confidence: float, tasks: list | None = None) -> str:
    """T042: Generate clarification question for ambiguous input.

    Args:
        intent: The classified intent
        confidence: AI confidence score
        tasks: Optional list of tasks for context

    Returns:
        Clarification question string
    """
    if confidence < 0.7:
        return "I'm not sure what you want to do. Could you please rephrase that?"

    if not validate_params(intent, {}):
        missing = _get_missing_param_hint(intent)
        return missing

    return "I'm not sure which task you're referring to."


def _get_missing_param_hint(intent: Intent) -> str:
    """Get hint message for missing required parameter.

    Args:
        intent: The classified intent

    Returns:
        Hint message
    """
    hints = {
        Intent.CREATE: "What would you like to call the task?",
        Intent.UPDATE: "Which task would you like to update?",
        Intent.DELETE: "Which task would you like to delete?",
        Intent.COMPLETE: "Which task would you like to complete?",
    }
    return hints.get(intent, "Could you provide more details?")


def dispatch_cli(command: str, **kwargs) -> Any:
    """T031: Dispatch CLI command to appropriate CRUD function.

    Args:
        command: CLI command string (e.g., "create-task")
        **kwargs: Arguments for the CRUD function

    Returns:
        Result from CRUD function

    Raises:
        ValueError: If command not recognized
    """
    if command not in CLI_ROUTING:
        raise ValueError(f"Unknown command: {command}")

    func = CLI_ROUTING[command]
    return func(**kwargs)


def dispatch_intent(intent: Intent, entities: dict) -> Any:
    """T040: Dispatch AI intent to appropriate CRUD function.

    Args:
        intent: Classified Intent enum
        entities: Extracted entity dict

    Returns:
        Result from CRUD function

    Raises:
        ValueError: If intent not recognized or params invalid
    """
    intent_str = intent.value if isinstance(intent, Intent) else intent

    if intent_str not in INTENT_ROUTING:
        raise ValueError(f"Unknown intent: {intent_str}")

    func = INTENT_ROUTING[intent_str]

    # Build kwargs from entities based on intent
    kwargs = _build_kwargs(intent, entities)

    return func(**kwargs)


def _build_kwargs(intent: Intent, entities: dict) -> dict:
    """Build keyword arguments for CRUD function from entities.

    Args:
        intent: The classified intent
        entities: Extracted entities

    Returns:
        Keyword arguments dict
    """
    if intent == Intent.CREATE:
        return {
            "title": entities.get("title"),
            "description": entities.get("description"),
            "priority": entities.get("priority") or "medium",
        }
    elif intent == Intent.UPDATE:
        return {
            "id": entities.get("id"),
            "title": entities.get("title"),
            "description": entities.get("description"),
            "status": entities.get("status"),
            "priority": entities.get("priority"),
        }
    elif intent in (Intent.DELETE, Intent.COMPLETE):
        return {"id": entities.get("id")}
    else:  # READ, SUMMARIZE
        return {}

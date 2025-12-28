"""
T039, T047, T048: AI mode entry point with verbose output and confirmation
"""

from src.ai.intent_parser import classify_intent
from src.resolver.dispatcher import (
    dispatch_intent,
    validate_params,
    handle_ambiguity,
)
from src.cli.formatter import (
    format_confirmation,
    format_error,
    format_verbose_intent,
    format_task_list,
    format_summary,
)
from src.storage.memory_store import get_all_tasks
from src.ai.intent_parser import Intent
from src.config.constants import CONFIDENCE_THRESHOLD


def process_ai_input(user_input: str, verbose: bool = False) -> int:
    """T039: Process natural language input in AI mode.

    Args:
        user_input: User's natural language input
        verbose: Whether to show verbose AI processing

    Returns:
        Exit code (0 for success, 1 for error)
    """
    try:
        # Classify intent
        intent, entities, confidence = classify_intent(user_input, verbose=verbose)

        # T047: Verbose mode output
        if verbose:
            func_name = _get_function_name(intent)
            print(format_verbose_intent(
                intent.value,
                entities,
                confidence,
                func_name
            ))

        # Check confidence threshold
        if confidence < CONFIDENCE_THRESHOLD:
            question = handle_ambiguity(intent, confidence, get_all_tasks())
            print(question)
            return 0

        # Validate required parameters
        if not validate_params(intent, entities):
            question = handle_ambiguity(intent, confidence)
            print(question)
            return 0

        # Dispatch to CRUD function
        result = dispatch_intent(intent, entities)

        # T048: Display confirmation/result
        _display_result(intent, result)

        return 0

    except ValueError as e:
        print(format_error(str(e)))
        return 1
    except Exception as e:
        print(format_error(f"AI processing error: {e}"))
        return 1


def _get_function_name(intent: Intent) -> str:
    """Get the CRUD function name for an intent.

    Args:
        intent: The classified intent

    Returns:
        Function name string
    """
    func_names = {
        Intent.CREATE: "create_task()",
        Intent.READ: "list_tasks()",
        Intent.UPDATE: "update_task()",
        Intent.DELETE: "delete_task()",
        Intent.COMPLETE: "complete_task()",
        Intent.SUMMARIZE: "summarize_tasks()",
    }
    return func_names.get(intent, "unknown_function()")


def _display_result(intent: Intent, result) -> None:
    """Display the result of a CRUD operation.

    Args:
        intent: The intent that was executed
        result: The result from the CRUD function
    """
    if intent == Intent.READ:
        print(format_task_list(result))
    elif intent == Intent.SUMMARIZE:
        print(format_summary(result))
    elif intent in (Intent.DELETE,):
        print(f"Task deleted successfully.")
    elif intent in (Intent.CREATE, Intent.UPDATE, Intent.COMPLETE):
        print(format_confirmation(_get_action_verb(intent), result))
    else:
        print(f"Operation completed: {result}")


def _get_action_verb(intent: Intent) -> str:
    """Get the action verb for an intent.

    Args:
        intent: The intent

    Returns:
        Action verb string
    """
    verbs = {
        Intent.CREATE: "created",
        Intent.UPDATE: "updated",
        Intent.COMPLETE: "marked as complete",
        Intent.DELETE: "deleted",
    }
    return verbs.get(intent, "processed")

"""
T008, T036, T038: Intent enum and classification for AI
"""

from enum import Enum
from typing import Any, List, Dict

from src.ai.client import AIClient
from src.ai.prompts import get_system_prompt
from src.ai.entity_extractor import extract_entities
from src.config.constants import CONFIDENCE_THRESHOLD


class Intent(Enum):
    """T008: User intent classifications for AI mode.

    Maps natural language input to CRUD operations.
    """
    CREATE = "CREATE"      # Create a new task
    READ = "READ"          # List/display tasks
    UPDATE = "UPDATE"      # Modify an existing task
    DELETE = "DELETE"      # Delete a task
    COMPLETE = "COMPLETE"  # Mark a task as complete
    SUMMARIZE = "SUMMARIZE"  # Generate task summary


def classify_intent(
    user_input: str,
    verbose: bool = False,
    conversation_history: List[Dict[str, str]] = None
) -> tuple[Intent, dict[str, Any], float]:
    """T036: Classify user intent from natural language input.

    Args:
        user_input: User's natural language input
        verbose: Whether to print verbose output
        conversation_history: Optional list of previous messages for context

    Returns:
        Tuple of (Intent, entities_dict, confidence)

    Raises:
        ValueError: If AI client is unavailable or API call fails
    """
    # Initialize AI client
    client = AIClient()

    if not client.is_available():
        raise ValueError("AI client not available. Check AI_API_KEY environment variable.")

    # Build system prompt with conversation context
    system_prompt = get_system_prompt()

    # Add conversation history to prompt if available
    if conversation_history and len(conversation_history) > 0:
        context_str = _format_conversation_history(conversation_history)
        system_prompt += f"\n\n{context_str}"
        system_prompt += "\nUse this conversation history as context. If the user refers to 'it', 'that task', or similar, look at the previous messages to understand what they mean."

    # Call LLM for intent classification
    response = client.classify_intent(user_input, system_prompt)

    # Extract intent string
    intent_str = response.get("intent")
    confidence = response.get("confidence", 0.0)

    # Convert to Intent enum
    try:
        intent = Intent[intent_str]
    except (KeyError, ValueError):
        # If intent is invalid, default to READ with low confidence
        intent = Intent.READ
        confidence = 0.0

    # T037: Extract and validate entities
    entities = extract_entities(response)

    # T038: Confidence threshold handling
    if confidence < CONFIDENCE_THRESHOLD:
        if verbose:
            print(f"Low confidence ({confidence:.2f}) detected for intent: {intent_str}")

    return intent, entities, confidence


def _format_conversation_history(history: List[Dict[str, str]]) -> str:
    """Format conversation history for the AI prompt.

    Args:
        history: List of message dictionaries with 'role' and 'content'

    Returns:
        Formatted conversation history string
    """
    lines = ["CONVERSATION HISTORY:"]
    lines.append("(Most recent messages at the bottom)")
    lines.append("")

    for msg in history[-10:]:  # Only include last 10 messages to avoid context overflow
        role = msg.get('role', 'user').upper()
        content = msg.get('content', '')[:200]  # Truncate long messages
        lines.append(f"{role}: {content}")

    return "\n".join(lines)

"""
T008, T036, T038: Intent enum and classification for AI
"""

from enum import Enum
from typing import Any

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


def classify_intent(user_input: str, verbose: bool = False) -> tuple[Intent, dict[str, Any], float]:
    """T036: Classify user intent from natural language input.

    Args:
        user_input: User's natural language input
        verbose: Whether to print verbose output

    Returns:
        Tuple of (Intent, entities_dict, confidence)

    Raises:
        ValueError: If AI client is unavailable or API call fails
    """
    # Initialize AI client
    client = AIClient()

    if not client.is_available():
        raise ValueError("AI client not available. Check AI_API_KEY environment variable.")

    # Call LLM for intent classification
    system_prompt = get_system_prompt()
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

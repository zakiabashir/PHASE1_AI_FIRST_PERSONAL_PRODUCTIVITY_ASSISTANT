"""
T012: Environment configuration for Groq API key
"""

import os


def get_ai_api_key() -> str:
    """Get the Groq API key from environment.

    Returns:
        API key string

    Raises:
        ValueError: If GROQ_API_KEY environment variable not set
    """
    # Check for GROQ_API_KEY first, then AI_API_KEY for backward compatibility
    api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("AI_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable not set")
    return api_key

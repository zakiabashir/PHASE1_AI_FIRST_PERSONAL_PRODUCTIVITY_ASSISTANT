"""
T034, T069, T070: Groq API client wrapper for AI intent classification
"""

from groq import Groq
from src.config.settings import get_ai_api_key


class AIClient:
    """T034: Wrapper for Groq LLM API client."""

    def __init__(self):
        """Initialize AI client with API key from environment."""
        try:
            # T069: Graceful degradation when API key not set
            self.api_key = get_ai_api_key()
            self.client = Groq(api_key=self.api_key)
            self._available = True
        except ValueError:
            self.client = None
            self._available = False

    def is_available(self) -> bool:
        """Check if AI client is available.

        Returns:
            True if API key is set and client is initialized
        """
        return self._available

    def classify_intent(
        self,
        user_input: str,
        system_prompt: str,
        max_tokens: int = 200
    ) -> dict:
        """Classify intent using LLM.

        Args:
            user_input: User's natural language input
            system_prompt: System prompt for the LLM
            max_tokens: Maximum tokens in response

        Returns:
            Dictionary with intent, entities, confidence

        Raises:
            ValueError: If API key not set or API call fails
        """
        if not self._available:
            raise ValueError("GROQ_API_KEY environment variable not set")

        try:
            # T070: API timeout handling
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Groq's fast model
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0,  # Deterministic output
                response_format={"type": "json_object"},
                max_tokens=max_tokens,
                timeout=10.0,  # T070: 10 second timeout
            )

            import json
            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            # T070: Graceful error handling
            if "timeout" in str(e).lower():
                raise ValueError("AI API request timed out. Please try again or use manual mode.")
            elif "rate" in str(e).lower():
                raise ValueError("AI API rate limit exceeded. Please wait or use manual mode.")
            else:
                raise ValueError(f"AI API error: {e}")

    def stream_response(
        self,
        user_input: str,
        system_prompt: str,
        max_tokens: int = 500
    ):
        """Stream AI response token by token.

        Args:
            user_input: User's natural language input
            system_prompt: System prompt for the LLM
            max_tokens: Maximum tokens in response

        Yields:
            Text chunks as they're generated

        Raises:
            ValueError: If API key not set or API call fails
        """
        if not self._available:
            raise ValueError("GROQ_API_KEY environment variable not set")

        try:
            response = self.client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.7,  # Slightly higher for more natural responses
                max_tokens=max_tokens,
                timeout=30.0,
                stream=True,  # Enable streaming
            )

            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            if "timeout" in str(e).lower():
                raise ValueError("AI API request timed out. Please try again.")
            elif "rate" in str(e).lower():
                raise ValueError("AI API rate limit exceeded. Please wait.")
            else:
                raise ValueError(f"AI API error: {e}")

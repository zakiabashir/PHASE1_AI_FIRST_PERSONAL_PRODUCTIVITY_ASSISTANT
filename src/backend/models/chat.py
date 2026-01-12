"""
Chat message model for storing conversation history
"""

import enum
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import mapped_column
from src.backend.models.base import Base, TimestampMixin


class MessageRole(str, enum.Enum):
    """Message role enum."""
    USER = "user"
    ASSISTANT = "assistant"


class ChatMessage(Base, TimestampMixin):
    """Chat message model linked to a user."""

    __tablename__ = "chat_messages"

    id: Column = Column(Integer, primary_key=True, index=True)
    # Foreign key to user
    user_id: Column = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Message fields
    role: Column = Column(Enum(MessageRole), nullable=False)
    content: Column = Column(Text, nullable=False)

    # Optional: Intent classification for assistant messages
    intent: Column = Column(String(50), nullable=True)

    def __repr__(self) -> str:
        return f"<ChatMessage(id={self.id}, role={self.role}, user_id={self.user_id})>"

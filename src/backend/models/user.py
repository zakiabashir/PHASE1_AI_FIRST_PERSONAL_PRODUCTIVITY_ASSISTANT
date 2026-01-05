"""
User table model for multi-user authentication
"""

from sqlalchemy import Boolean, Column, Integer, String
from src.backend.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """User account for authentication."""

    __tablename__ = "users"

    id: Column = Column(Integer, primary_key=True, index=True)
    email: Column = Column(String(255), unique=True, nullable=False, index=True)
    username: Column = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password: Column = Column(String(255), nullable=False)
    is_active: Column = Column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"

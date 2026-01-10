"""
Database connection and session management
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from src.config.settings import _load_env_file
import os

# Load environment variables
_load_env_file()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./productivity.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Dependency for getting database session.

    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    from src.backend.models import Base

    # For PostgreSQL, drop all existing tables with CASCADE to handle foreign key dependencies
    if DATABASE_URL.startswith("postgresql"):
        with engine.begin() as conn:
            # Drop all tables in the public schema with CASCADE
            conn.execute(text("DROP SCHEMA public CASCADE"))
            conn.execute(text("CREATE SCHEMA public"))

    # Create all tables with correct schema
    Base.metadata.create_all(bind=engine)

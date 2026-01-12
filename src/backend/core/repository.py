"""
Repository pattern adapter for database operations
Adapts existing in-memory CRUD to work with SQLAlchemy
"""

from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from src.backend.models.task import Task, TaskStatus, TaskPriority
from src.backend.models.chat import ChatMessage, MessageRole


class TaskRepository:
    """Repository for task CRUD operations with user isolation."""

    def __init__(self, user_id: int, db: Session):
        """Initialize repository with user context.

        Args:
            user_id: ID of the authenticated user
            db: Database session
        """
        self.user_id = user_id
        self.db = db

    def create_task(
        self,
        title: str,
        description: Optional[str] = None,
        priority: str = "medium"
    ) -> Task:
        """Create a new task for the user.

        Args:
            title: Task title
            description: Optional task description
            priority: Task priority (low, medium, high)

        Returns:
            Created Task object
        """
        # Create task (let database auto-generate ID)
        db_task = Task(
            user_id=self.user_id,
            title=title,
            description=description,
            priority=TaskPriority(priority),
            status=TaskStatus.PENDING
        )
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)

        return db_task

    def get_task(self, task_id: int) -> Optional[Task]:
        """Get a specific task by ID for the user.

        Args:
            task_id: Task ID

        Returns:
            Task object if found, None otherwise
        """
        return self.db.query(Task).filter(
            Task.id == task_id,
            Task.user_id == self.user_id
        ).first()

    def list_tasks(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        """List tasks for the user with optional filters.

        Args:
            status: Filter by status (pending/complete)
            priority: Filter by priority (low/medium/high)
            skip: Number of tasks to skip (pagination)
            limit: Maximum number of tasks to return

        Returns:
            List of Task objects
        """
        query = self.db.query(Task).filter(Task.user_id == self.user_id)

        if status:
            query = query.filter(Task.status == TaskStatus(status))
        if priority:
            query = query.filter(Task.priority == TaskPriority(priority))

        return query.order_by(Task.id).offset(skip).limit(limit).all()

    def count_tasks(
        self,
        status: Optional[str] = None
    ) -> int:
        """Count tasks for the user.

        Args:
            status: Filter by status

        Returns:
            Number of tasks
        """
        query = self.db.query(Task).filter(Task.user_id == self.user_id)
        if status:
            query = query.filter(Task.status == TaskStatus(status))
        return query.count()

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None
    ) -> Task:
        """Update a task for the user.

        Args:
            task_id: Task ID
            title: New title
            description: New description
            status: New status
            priority: New priority

        Returns:
            Updated Task object

        Raises:
            ValueError: If task not found
        """
        db_task = self.get_task(task_id)
        if not db_task:
            raise ValueError(f"Task {task_id} not found")

        if title is not None:
            db_task.title = title
        if description is not None:
            db_task.description = description
        if status is not None:
            db_task.status = TaskStatus(status)
        if priority is not None:
            db_task.priority = TaskPriority(priority)

        self.db.commit()
        self.db.refresh(db_task)

        return db_task

    def delete_task(self, task_id: int) -> None:
        """Delete a task for the user.

        Args:
            task_id: Task ID

        Raises:
            ValueError: If task not found
        """
        db_task = self.get_task(task_id)
        if not db_task:
            raise ValueError(f"Task {task_id} not found")

        self.db.delete(db_task)
        self.db.commit()

    def complete_task(self, task_id: int) -> Task:
        """Mark a task as complete.

        Args:
            task_id: Task ID

        Returns:
            Updated Task object

        Raises:
            ValueError: If task not found
        """
        return self.update_task(task_id, status="complete")

    def get_summary(self) -> dict:
        """Get task summary for the user.

        Returns:
            Dictionary with task counts
        """
        total = self.count_tasks()
        pending = self.count_tasks(status="pending")
        complete = self.count_tasks(status="complete")
        high_pending = self.count_tasks(status="pending") - self.count_tasks(status="pending")

        # Count high priority pending tasks
        high_pending = self.db.query(Task).filter(
            Task.user_id == self.user_id,
            Task.status == TaskStatus.PENDING,
            Task.priority == TaskPriority.HIGH
        ).count()

        return {
            "total_count": total,
            "pending_count": pending,
            "complete_count": complete,
            "high_priority_pending": high_pending
        }


class ChatRepository:
    """Repository for chat message operations with user isolation."""

    def __init__(self, user_id: int, db: Session):
        """Initialize repository with user context.

        Args:
            user_id: ID of the authenticated user
            db: Database session
        """
        self.user_id = user_id
        self.db = db

    def save_message(self, role: str, content: str, intent: Optional[str] = None) -> ChatMessage:
        """Save a chat message for the user.

        Args:
            role: Message role (user/assistant)
            content: Message content
            intent: Optional intent classification for assistant messages

        Returns:
            Created ChatMessage object
        """
        db_message = ChatMessage(
            user_id=self.user_id,
            role=MessageRole(role),
            content=content,
            intent=intent
        )
        self.db.add(db_message)
        self.db.commit()
        self.db.refresh(db_message)

        return db_message

    def get_recent_messages(self, limit: int = 50) -> List[ChatMessage]:
        """Get recent chat messages for the user.

        Args:
            limit: Maximum number of messages to return

        Returns:
            List of ChatMessage objects ordered by creation time
        """
        return self.db.query(ChatMessage).filter(
            ChatMessage.user_id == self.user_id
        ).order_by(ChatMessage.created_at).limit(limit).all()

    def get_conversation_history(self, hours: int = 24, limit: int = 100) -> List[dict]:
        """Get conversation history within a time window.

        Args:
            hours: Number of hours to look back
            limit: Maximum number of messages to return

        Returns:
            List of message dictionaries with role and content
        """
        since = datetime.utcnow() - timedelta(hours=hours)
        
        messages = self.db.query(ChatMessage).filter(
            ChatMessage.user_id == self.user_id,
            ChatMessage.created_at >= since
        ).order_by(ChatMessage.created_at).limit(limit).all()

        return [
            {
                "role": msg.role.value,
                "content": msg.content
            }
            for msg in messages
        ]

    def clear_old_messages(self, days: int = 30) -> int:
        """Delete messages older than specified days.

        Args:
            days: Number of days to keep messages

        Returns:
            Number of messages deleted
        """
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        deleted = self.db.query(ChatMessage).filter(
            ChatMessage.user_id == self.user_id,
            ChatMessage.created_at < cutoff
        ).delete()
        
        self.db.commit()
        return deleted

"""
AI Chat endpoint - Natural language task management
Reuses existing AI Intent Parser from Phase I
"""

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import json

from src.backend.api.schemas.ai import AIChatRequest, AIChatResponse
from src.backend.api.schemas.tasks import TaskResponse
from src.backend.dependencies import UserIdDep, DbDep
from src.backend.core.repository import TaskRepository, ChatRepository

# Import existing AI components from Phase I
from src.ai.intent_parser import classify_intent, Intent
from src.ai.entity_extractor import extract_entities
from src.ai.client import AIClient
from src.config.constants import CONFIDENCE_THRESHOLD


def _task_to_dict(task) -> dict:
    """Convert SQLAlchemy Task object to serializable dict.

    Args:
        task: SQLAlchemy Task object

    Returns:
        Dictionary with task data
    """
    return {
        "id": task.id,
        "user_id": task.user_id,
        "title": task.title,
        "description": task.description,
        "status": task.status.value if hasattr(task.status, 'value') else task.status,
        "priority": task.priority.value if hasattr(task.priority, 'value') else task.priority,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
    }


def _extract_task_id(entities: dict) -> int | None:
    """Extract task ID from entities dict.

    The entity extractor returns "id" key with format "task-N".
    This function extracts the integer ID from that format.

    Args:
        entities: Entities dict from entity extractor

    Returns:
        Integer task ID or None if not found
    """
    # Try "id" key from entity extractor (format: "task-N")
    task_id_str = entities.get("id")
    if task_id_str:
        if isinstance(task_id_str, str) and task_id_str.startswith("task-"):
            # Extract number from "task-N"
            try:
                return int(task_id_str.split("-")[1])
            except (ValueError, IndexError):
                pass
        elif isinstance(task_id_str, int):
            return task_id_str
        elif isinstance(task_id_str, str) and task_id_str.isdigit():
            return int(task_id_str)

    # Try legacy "task_id" key
    task_id = entities.get("task_id")
    if task_id:
        if isinstance(task_id, int):
            return task_id
        elif isinstance(task_id, str) and task_id_str.isdigit():
            return int(task_id)

    return None

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/chat", response_model=AIChatResponse)
async def ai_chat(
    request: AIChatRequest,
    user_id: UserIdDep,
    db: DbDep
):
    """Process natural language input and execute task operations.

    Args:
        request: AI chat request with message and optional verbose flag
        user_id: Authenticated user ID
        db: Database session

    Returns:
        AI chat response with result

    Raises:
        HTTPException: If AI processing fails
    """
    chat_repo = ChatRepository(user_id, db)

    try:
        # Save user message to history
        chat_repo.save_message("user", request.message)

        # Get conversation history for context
        history = chat_repo.get_conversation_history(hours=24, limit=10)

        # Step 1: Classify intent using existing AI layer with context
        intent, entities, confidence = classify_intent(
            request.message,
            verbose=request.verbose,
            conversation_history=history
        )

        # Step 2: Check confidence threshold
        if confidence < CONFIDENCE_THRESHOLD:
            error_message = "I'm not fully sure what you'd like to do.\n\n" \
                          "You can try commands like:\n" \
                          "• Create a task\n" \
                          "• Show my tasks\n" \
                          "• Complete task #1"
            chat_repo.save_message("assistant", error_message, intent=intent.value)
            return AIChatResponse(
                intent=intent.value,
                message=error_message,
                success=False
            )

        # Step 3: Extract and normalize entities
        extracted = extract_entities({"intent": intent.value, "entities": entities})

        # Step 4: Execute operation using repository
        repo = TaskRepository(user_id, db)
        result, message = _execute_intent(intent, extracted, repo)

        # Save assistant message to history
        chat_repo.save_message("assistant", message, intent=intent.value)

        return AIChatResponse(
            intent=intent.value,
            result=result,
            message=message,
            success=True
        )

    except ValueError as e:
        chat_repo.save_message("assistant", str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        error_msg = "Something went wrong on my end. Please try again."
        chat_repo.save_message("assistant", error_msg)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )


@router.post("/chat/stream")
async def ai_chat_stream(
    request: AIChatRequest,
    user_id: UserIdDep,
    db: DbDep
):
    """Process natural language input with streaming response.

    Args:
        request: AI chat request with message and optional verbose flag
        user_id: Authenticated user ID
        db: Database session

    Returns:
        StreamingResponse with chunks of the response
    """
    chat_repo = ChatRepository(user_id, db)

    async def generate_stream():
        try:
            # Save user message to history
            chat_repo.save_message("user", request.message)

            # Get conversation history for context
            history = chat_repo.get_conversation_history(hours=24, limit=10)

            # Step 1: Classify intent with context
            intent, entities, confidence = classify_intent(
                request.message,
                verbose=request.verbose,
                conversation_history=history
            )

            # Step 2: Check confidence threshold
            if confidence < CONFIDENCE_THRESHOLD:
                error_msg = "I'm not fully sure what you'd like to do.\n\n"
                error_msg += "You can try commands like:\n"
                error_msg += "• Create a task\n"
                error_msg += "• Show my tasks\n"
                error_msg += "• Complete task #1"
                chat_repo.save_message("assistant", error_msg, intent=intent.value)
                yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
                return

            # Step 3: Extract and normalize entities
            extracted = extract_entities({"intent": intent.value, "entities": entities})

            # Step 4: Execute operation using repository
            repo = TaskRepository(user_id, db)
            result, message = _execute_intent(intent, extracted, repo)

            # Stream the response word by word
            words = message.split()
            streamed_message = ""
            for i, word in enumerate(words):
                chunk = word + " " if i < len(words) - 1 else word
                streamed_message += chunk
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

            # Save assistant message to history
            chat_repo.save_message("assistant", streamed_message.strip(), intent=intent.value)

            # Send final result
            yield f"data: {json.dumps({'type': 'done', 'intent': intent.value, 'result': result})}\n\n"

        except ValueError as e:
            chat_repo.save_message("assistant", str(e))
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        except Exception as e:
            error_msg = "Something went wrong on my end. Please try again."
            chat_repo.save_message("assistant", error_msg)
            yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/history")
async def get_chat_history(
    user_id: UserIdDep,
    db: DbDep,
    hours: int = 24,
    limit: int = 100
):
    """Get chat history for the user.

    Args:
        user_id: Authenticated user ID
        db: Database session
        hours: Number of hours to look back (default: 24)
        limit: Maximum number of messages to return (default: 100)

    Returns:
        List of chat messages
    """
    chat_repo = ChatRepository(user_id, db)
    history = chat_repo.get_recent_messages(limit=limit)

    return [
        {
            "id": msg.id,
            "role": msg.role.value,
            "content": msg.content,
            "intent": msg.intent,
            "timestamp": msg.created_at.isoformat() if msg.created_at else None
        }
        for msg in history
    ]


@router.delete("/history")
async def clear_chat_history(
    user_id: UserIdDep,
    db: DbDep,
    days: int = 30
):
    """Clear old chat history for the user.

    Args:
        user_id: Authenticated user ID
        db: Database session
        days: Keep messages newer than this many days (default: 30)

    Returns:
        Number of messages deleted
    """
    chat_repo = ChatRepository(user_id, db)
    deleted = chat_repo.clear_old_messages(days=days)

    return {"deleted": deleted, "message": f"Deleted {deleted} old messages"}


def _execute_intent(intent: Intent, entities: dict, repo: TaskRepository) -> tuple:
    """Execute the intent using the repository.

    Args:
        intent: Classified intent
        entities: Extracted entities
        repo: Task repository

    Returns:
        Tuple of (result, message)
    """
    if intent == Intent.CREATE:
        task = repo.create_task(
            title=entities.get("title") or "Untitled",
            description=entities.get("description"),
            priority=entities.get("priority") or "medium"
        )
        message = f"✅ Task created successfully\nTitle: {task.title}\nTask ID: {task.id}"
        return _task_to_dict(task), message

    elif intent == Intent.READ:
        tasks = repo.list_tasks(
            status=entities.get("status"),
            priority=entities.get("priority")
        )
        count = len(tasks)
        if count == 0:
            message = "You don't have any tasks matching those criteria. Would you like to create one?"
        elif count == 1:
            message = "📋 Here's the task I found."
        else:
            message = f"📋 Here are your {count} tasks."
        return {
            "tasks": [_task_to_dict(t) for t in tasks],
            "count": count
        }, message

    elif intent == Intent.UPDATE:
        # Get task ID from entities
        task_id = _extract_task_id(entities)
        if not task_id:
            raise ValueError("⚠️ Please specify which task you'd like to update.\nExample: 'update task 1' or 'change the first task'")

        task = repo.update_task(
            task_id=task_id,
            title=entities.get("title"),
            description=entities.get("description"),
            status=entities.get("status"),
            priority=entities.get("priority")
        )
        return _task_to_dict(task), f"✅ Task updated: {task.title}"

    elif intent == Intent.DELETE:
        task_id = _extract_task_id(entities)
        if not task_id:
            raise ValueError("⚠️ Please specify which task to delete.\nExample: 'delete task 1'")

        repo.delete_task(task_id=task_id)
        return {"deleted": task_id}, f"✅ Task {task_id} deleted successfully"

    elif intent == Intent.COMPLETE:
        task_id = _extract_task_id(entities)
        if not task_id:
            raise ValueError("❌ Please specify which task to complete.\nExample: 'complete task 1'")

        task = repo.complete_task(task_id=task_id)
        return _task_to_dict(task), f"✅ Task marked as complete: {task.title}"

    elif intent == Intent.SUMMARIZE:
        summary = repo.get_summary()
        total = summary['total_count']
        pending = summary['pending_count']
        if total == 0:
            return summary, "You don't have any tasks yet. Would you like to create one?"
        elif pending == 0:
            return summary, "🎉 You've completed all your tasks!"
        else:
            return summary, f"📋 Task Summary\nYou have {pending} task(s) pending out of {total} total."

    else:
        return None, "I'm not sure how to help with that. Try asking me to create, list, update, or complete a task."

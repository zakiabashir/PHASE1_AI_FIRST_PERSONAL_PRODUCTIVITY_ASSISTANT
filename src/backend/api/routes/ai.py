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
from src.backend.core.repository import TaskRepository

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
    try:
        # Step 1: Classify intent using existing AI layer
        intent, entities, confidence = classify_intent(
            request.message,
            verbose=request.verbose
        )

        # Step 2: Check confidence threshold
        if confidence < CONFIDENCE_THRESHOLD:
            return AIChatResponse(
                intent=intent.value,
                message=f"I'm not sure what you want to do. Confidence: {confidence:.2f}. "
                        f"Could you please rephrase? Try: 'create task X', 'show tasks', 'complete task 1'",
                success=False
            )

        # Step 3: Extract and normalize entities
        extracted = extract_entities({"intent": intent.value, "entities": entities})

        # Step 4: Execute operation using repository
        repo = TaskRepository(user_id, db)
        result, message = _execute_intent(intent, extracted, repo)

        return AIChatResponse(
            intent=intent.value,
            result=result,
            message=message,
            success=True
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI processing error: {str(e)}"
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
    async def generate_stream():
        try:
            # Step 1: Classify intent
            intent, entities, confidence = classify_intent(
                request.message,
                verbose=request.verbose
            )

            # Step 2: Check confidence threshold
            if confidence < CONFIDENCE_THRESHOLD:
                error_msg = f"I'm not sure what you want to do. Confidence: {confidence:.2f}. "
                error_msg += "Could you please rephrase? Try: 'create task X', 'show tasks', 'complete task 1'"
                yield f"data: {json.dumps({'type': 'error', 'message': error_msg})}\n\n"
                return

            # Step 3: Extract and normalize entities
            extracted = extract_entities({"intent": intent.value, "entities": entities})

            # Step 4: Execute operation using repository
            repo = TaskRepository(user_id, db)
            result, message = _execute_intent(intent, extracted, repo)

            # Stream the response word by word
            words = message.split()
            for i, word in enumerate(words):
                chunk = word + " " if i < len(words) - 1 else word
                yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"

            # Send final result
            yield f"data: {json.dumps({'type': 'done', 'intent': intent.value, 'result': result})}\n\n"

        except ValueError as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': f'AI processing error: {str(e)}'})}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


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
        return _task_to_dict(task), f"Task '{task.title}' has been created (ID: {task.id})."

    elif intent == Intent.READ:
        tasks = repo.list_tasks(
            status=entities.get("status"),
            priority=entities.get("priority")
        )
        return {
            "tasks": [_task_to_dict(t) for t in tasks],
            "count": len(tasks)
        }, f"Found {len(tasks)} task(s)."

    elif intent == Intent.UPDATE:
        # Get task ID from entities
        task_id = _extract_task_id(entities)
        if not task_id:
            raise ValueError("Please specify which task to update (e.g., 'task 1' or 'the first task')")

        task = repo.update_task(
            task_id=task_id,
            title=entities.get("title"),
            description=entities.get("description"),
            status=entities.get("status"),
            priority=entities.get("priority")
        )
        return _task_to_dict(task), f"Task '{task.title}' has been updated."

    elif intent == Intent.DELETE:
        task_id = _extract_task_id(entities)
        if not task_id:
            raise ValueError("Please specify which task to delete (e.g., 'task 1' or 'the first task')")

        repo.delete_task(task_id=task_id)
        return {"deleted": task_id}, f"Task {task_id} deleted."

    elif intent == Intent.COMPLETE:
        task_id = _extract_task_id(entities)
        if not task_id:
            raise ValueError("Please specify which task to complete (e.g., 'task 1' or 'the first task')")

        task = repo.complete_task(task_id=task_id)
        return _task_to_dict(task), f"Task '{task.title}' has been marked as complete (ID: {task.id})."

    elif intent == Intent.SUMMARIZE:
        summary = repo.get_summary()
        return summary, f"You have {summary['total_count']} task(s)."

    else:
        return None, "Unknown command"

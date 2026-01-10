"""
Task CRUD endpoints - Create, Read, Update, Delete, Complete, Summarize
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from src.backend.api.schemas.tasks import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    TaskListResponse,
    TaskSummary,
)
from src.backend.dependencies import UserIdDep, DbDep
from src.backend.core.repository import TaskRepository

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    user_id: UserIdDep,
    db: DbDep
):
    """Create a new task for the authenticated user."""
    repo = TaskRepository(user_id, db)
    task = repo.create_task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority
    )
    return task


@router.get("/", response_model=TaskListResponse)
async def list_tasks(
    user_id: UserIdDep,
    db: DbDep,
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    skip: int = Query(0, ge=0, description="Number of tasks to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum tasks to return")
):
    """List tasks for the authenticated user with optional filters."""
    repo = TaskRepository(user_id, db)
    tasks = repo.list_tasks(status=status, priority=priority, skip=skip, limit=limit)
    total = repo.count_tasks(status=status)
    return TaskListResponse(total=total, items=tasks)


@router.get("/summary/overview", response_model=TaskSummary)
async def get_task_summary(
    user_id: UserIdDep,
    db: DbDep
):
    """Get task summary statistics."""
    repo = TaskRepository(user_id, db)
    summary_data = repo.get_summary()
    return TaskSummary(**summary_data)


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    user_id: UserIdDep,
    db: DbDep
):
    """Get a specific task by ID."""
    repo = TaskRepository(user_id, db)
    task = repo.get_task(task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    user_id: UserIdDep,
    db: DbDep
):
    """Update a task."""
    repo = TaskRepository(user_id, db)
    try:
        task = repo.update_task(
            task_id=task_id,
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            priority=task_data.priority
        )
        return task
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    user_id: UserIdDep,
    db: DbDep
):
    """Delete a task."""
    repo = TaskRepository(user_id, db)
    try:
        repo.delete_task(task_id)
        return {"message": f"Task {task_id} deleted"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/{task_id}/complete", response_model=TaskResponse)
async def complete_task(
    task_id: int,
    user_id: UserIdDep,
    db: DbDep
):
    """Mark a task as complete."""
    repo = TaskRepository(user_id, db)
    try:
        task = repo.complete_task(task_id)
        return task
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

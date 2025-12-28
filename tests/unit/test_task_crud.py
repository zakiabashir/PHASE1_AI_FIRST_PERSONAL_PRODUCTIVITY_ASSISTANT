"""
T014-T020: Unit tests for CRUD functions
"""

import unittest
from src.storage.memory_store import reset_store
from src.core.task_crud import (
    create_task,
    list_tasks,
    update_task,
    delete_task,
    complete_task,
)


class TestCreateTask(unittest.TestCase):
    """T014, T015: Tests for create_task function"""

    def setUp(self):
        """Reset store before each test"""
        reset_store()

    def test_create_task_basic(self):
        """T014: Happy path - create basic task"""
        task = create_task("Study AI")
        self.assertEqual(task.id, "task-1")
        self.assertEqual(task.title, "Study AI")
        self.assertEqual(task.status, "pending")
        self.assertEqual(task.priority, "medium")
        self.assertIsNone(task.description)

    def test_create_task_with_all_fields(self):
        """T014: Happy path - create task with all fields"""
        task = create_task(
            title="Complete hackathon project",
            description="Build AI-first productivity assistant CLI",
            priority="high"
        )
        self.assertEqual(task.id, "task-1")
        self.assertEqual(task.title, "Complete hackathon project")
        self.assertEqual(task.description, "Build AI-first productivity assistant CLI")
        self.assertEqual(task.priority, "high")
        self.assertEqual(task.status, "pending")

    def test_create_task_empty_title(self):
        """T015: Error path - empty title raises ValueError"""
        with self.assertRaises(ValueError) as context:
            create_task("")
        self.assertEqual(str(context.exception), "Task title cannot be empty")

    def test_create_task_whitespace_title(self):
        """T015: Error path - whitespace-only title raises ValueError"""
        with self.assertRaises(ValueError) as context:
            create_task("   ")
        self.assertEqual(str(context.exception), "Task title cannot be empty")

    def test_create_task_title_too_long(self):
        """T015: Error path - title exceeds 200 characters"""
        long_title = "a" * 201
        with self.assertRaises(ValueError) as context:
            create_task(long_title)
        self.assertEqual(str(context.exception), "Task title must be 200 characters or less")

    def test_create_task_description_too_long(self):
        """T015: Error path - description exceeds 1000 characters"""
        long_description = "a" * 1001
        with self.assertRaises(ValueError) as context:
            create_task("Valid title", description=long_description)
        self.assertEqual(str(context.exception), "Task description must be 1000 characters or less")

    def test_create_task_invalid_priority(self):
        """T015: Error path - invalid priority"""
        with self.assertRaises(ValueError) as context:
            create_task("Valid title", priority="urgent")
        self.assertEqual(str(context.exception), "Task priority must be 'low', 'medium', or 'high'")

    def test_create_task_sequential_ids(self):
        """T014: Verify sequential ID generation"""
        task1 = create_task("First task")
        task2 = create_task("Second task")
        task3 = create_task("Third task")
        self.assertEqual(task1.id, "task-1")
        self.assertEqual(task2.id, "task-2")
        self.assertEqual(task3.id, "task-3")


class TestListTasks(unittest.TestCase):
    """T016: Tests for list_tasks function"""

    def setUp(self):
        """Reset store before each test"""
        reset_store()

    def test_list_tasks_empty(self):
        """T016: Empty store returns empty list"""
        tasks = list_tasks()
        self.assertEqual(tasks, [])

    def test_list_tasks_with_tasks(self):
        """T016: Returns all tasks"""
        create_task("Task 1")
        create_task("Task 2")
        tasks = list_tasks()
        self.assertEqual(len(tasks), 2)
        task_titles = [t.title for t in tasks]
        self.assertIn("Task 1", task_titles)
        self.assertIn("Task 2", task_titles)


class TestUpdateTask(unittest.TestCase):
    """T017, T018: Tests for update_task function"""

    def setUp(self):
        """Reset store before each test"""
        reset_store()

    def test_update_task_title_only(self):
        """T017: Happy path - update title only"""
        task = create_task("Original title")
        updated = update_task("task-1", title="New title")
        self.assertEqual(updated.id, "task-1")
        self.assertEqual(updated.title, "New title")
        self.assertEqual(updated.status, "pending")
        self.assertEqual(updated.priority, "medium")

    def test_update_task_status(self):
        """T017: Happy path - update status"""
        task = create_task("Task")
        updated = update_task("task-1", status="complete")
        self.assertEqual(updated.status, "complete")

    def test_update_task_multiple_fields(self):
        """T017: Happy path - update multiple fields"""
        task = create_task("Task")
        updated = update_task(
            "task-1",
            title="Updated task",
            description="New description",
            priority="high"
        )
        self.assertEqual(updated.title, "Updated task")
        self.assertEqual(updated.description, "New description")
        self.assertEqual(updated.priority, "high")

    def test_update_task_partial_none(self):
        """T017: Happy path - None values preserve existing"""
        task = create_task("Original", description="Original desc", priority="high")
        updated = update_task("task-1", title="New title", description=None, priority=None)
        self.assertEqual(updated.title, "New title")
        self.assertEqual(updated.description, "Original desc")
        self.assertEqual(updated.priority, "high")

    def test_update_task_not_found(self):
        """T018: Error path - task ID doesn't exist"""
        with self.assertRaises(ValueError) as context:
            update_task("task-999", title="New title")
        self.assertEqual(str(context.exception), "Task 'task-999' not found")

    def test_update_task_invalid_status(self):
        """T018: Error path - invalid status"""
        create_task("Task")
        with self.assertRaises(ValueError) as context:
            update_task("task-1", status="done")
        self.assertEqual(str(context.exception), "Task status must be 'pending' or 'complete'")

    def test_update_task_invalid_priority(self):
        """T018: Error path - invalid priority"""
        create_task("Task")
        with self.assertRaises(ValueError) as context:
            update_task("task-1", priority="urgent")
        self.assertEqual(str(context.exception), "Task priority must be 'low', 'medium', or 'high'")

    def test_update_task_title_too_long(self):
        """T018: Error path - title too long"""
        create_task("Task")
        with self.assertRaises(ValueError) as context:
            update_task("task-1", title="a" * 201)
        self.assertEqual(str(context.exception), "Task title must be 200 characters or less")

    def test_update_task_description_too_long(self):
        """T018: Error path - description too long"""
        create_task("Task")
        with self.assertRaises(ValueError) as context:
            update_task("task-1", description="a" * 1001)
        self.assertEqual(str(context.exception), "Task description must be 1000 characters or less")


class TestDeleteTask(unittest.TestCase):
    """T019: Tests for delete_task function"""

    def setUp(self):
        """Reset store before each test"""
        reset_store()

    def test_delete_task_existing(self):
        """T019: Happy path - delete existing task"""
        task = create_task("Task to delete")
        self.assertEqual(len(list_tasks()), 1)
        delete_task("task-1")
        self.assertEqual(len(list_tasks()), 0)

    def test_delete_task_not_found(self):
        """T019: Error path - delete non-existent task"""
        with self.assertRaises(ValueError) as context:
            delete_task("task-999")
        self.assertEqual(str(context.exception), "Task 'task-999' not found")


class TestCompleteTask(unittest.TestCase):
    """T020: Tests for complete_task function"""

    def setUp(self):
        """Reset store before each test"""
        reset_store()

    def test_complete_task_existing(self):
        """T020: Happy path - mark task as complete"""
        task = create_task("Task to complete")
        self.assertEqual(task.status, "pending")
        completed = complete_task("task-1")
        self.assertEqual(completed.status, "complete")
        self.assertEqual(completed.id, "task-1")

    def test_complete_task_not_found(self):
        """T020: Error path - complete non-existent task"""
        with self.assertRaises(ValueError) as context:
            complete_task("task-999")
        self.assertEqual(str(context.exception), "Task 'task-999' not found")


if __name__ == "__main__":
    unittest.main()

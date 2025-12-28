"""
T051: Unit tests for summarize_tasks function
"""

import unittest
from src.storage.memory_store import reset_store
from src.core.task_crud import create_task, complete_task
from src.core.summarize import summarize_tasks


class TestSummarizeTasks(unittest.TestCase):
    """T051: Tests for summarize_tasks function"""

    def setUp(self):
        """Reset store before each test"""
        reset_store()

    def test_summarize_empty(self):
        """T051: Empty store returns zero counts"""
        summary = summarize_tasks()
        self.assertEqual(summary.total_count, 0)
        self.assertEqual(summary.pending_count, 0)
        self.assertEqual(summary.complete_count, 0)
        self.assertEqual(summary.high_priority_pending, [])
        self.assertEqual(summary.medium_priority_pending, [])
        self.assertEqual(summary.low_priority_pending, [])

    def test_summarize_all_pending(self):
        """T051: All pending tasks counted correctly"""
        create_task("Task 1", priority="high")
        create_task("Task 2", priority="medium")
        create_task("Task 3", priority="low")

        summary = summarize_tasks()
        self.assertEqual(summary.total_count, 3)
        self.assertEqual(summary.pending_count, 3)
        self.assertEqual(summary.complete_count, 0)
        self.assertEqual(summary.high_priority_pending, ["task-1"])
        self.assertEqual(summary.medium_priority_pending, ["task-2"])
        self.assertEqual(summary.low_priority_pending, ["task-3"])

    def test_summarize_all_complete(self):
        """T051: All complete tasks counted correctly"""
        create_task("Task 1")
        create_task("Task 2")
        complete_task("task-1")
        complete_task("task-2")

        summary = summarize_tasks()
        self.assertEqual(summary.total_count, 2)
        self.assertEqual(summary.pending_count, 0)
        self.assertEqual(summary.complete_count, 2)
        self.assertEqual(summary.high_priority_pending, [])
        self.assertEqual(summary.medium_priority_pending, [])
        self.assertEqual(summary.low_priority_pending, [])

    def test_summarize_mixed_statuses(self):
        """T051: Mixed statuses counted correctly"""
        create_task("Task 1", priority="high")
        create_task("Task 2", priority="high")
        create_task("Task 3", priority="medium")
        create_task("Task 4", priority="low")
        complete_task("task-1")

        summary = summarize_tasks()
        self.assertEqual(summary.total_count, 4)
        self.assertEqual(summary.pending_count, 3)
        self.assertEqual(summary.complete_count, 1)
        self.assertEqual(summary.high_priority_pending, ["task-2"])
        self.assertEqual(summary.medium_priority_pending, ["task-3"])
        self.assertEqual(summary.low_priority_pending, ["task-4"])

    def test_summarize_priority_grouping(self):
        """T051: Priority grouping works correctly"""
        create_task("High 1", priority="high")
        create_task("High 2", priority="high")
        create_task("Medium 1", priority="medium")
        create_task("Low 1", priority="low")

        summary = summarize_tasks()
        self.assertEqual(summary.high_priority_pending, ["task-1", "task-2"])
        self.assertEqual(summary.medium_priority_pending, ["task-3"])
        self.assertEqual(summary.low_priority_pending, ["task-4"])


if __name__ == "__main__":
    unittest.main()

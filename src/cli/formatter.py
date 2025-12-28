"""
T027, T045, T046, T049, T050, T055: Output formatters for CLI
"""

from src.storage.models import Task, TaskSummary


def format_task_list(tasks: list[Task]) -> str:
    """Format list of tasks for display.

    Args:
        tasks: List of Task objects

    Returns:
        Formatted string for display
    """
    if not tasks:
        return "No tasks found."

    # Calculate column widths
    max_id_len = max(len(t.id) for t in tasks)
    max_title_len = max(len(t.title) for t in tasks)
    max_status_len = max(len(t.status) for t in tasks)
    max_priority_len = max(len(t.priority) for t in tasks)

    # Ensure minimum widths for headers
    id_len = max(max_id_len, 3)
    title_len = min(max_title_len, 50)  # Cap title display at 50 chars
    status_len = max(max_status_len, 6)
    priority_len = max(max_priority_len, 8)

    # Header
    header = f"{'ID'.ljust(id_len)}  {'Title'.ljust(title_len)}  {'Status'.ljust(status_len)}  {'Priority'.ljust(priority_len)}"
    separator = "-" * len(header)

    # Task rows
    rows = []
    for task in tasks:
        # Truncate title if too long
        display_title = task.title[:title_len - 3] + "..." if len(task.title) > title_len else task.title
        row = f"{task.id.ljust(id_len)}  {display_title.ljust(title_len)}  {task.status.ljust(status_len)}  {task.priority.ljust(priority_len)}"
        rows.append(row)

    # Description rows for tasks with descriptions
    desc_rows = []
    for task in tasks:
        if task.description:
            desc_rows.append(f"  [{task.id}] Description: {task.description}")

    return "\n".join([header, separator] + rows + desc_rows)


def format_confirmation(action: str, task: Task) -> str:
    """T046: Format confirmation message with emoji.

    Args:
        action: Action taken (created, updated, deleted, completed)
        task: Task that was acted upon

    Returns:
        Formatted confirmation string
    """
    return f"Task '{task.title}' has been {action} (ID: {task.id})."


def format_error(message: str) -> str:
    """Format error message for display.

    Args:
        message: Error message

    Returns:
        Formatted error string
    """
    return f"Error: {message}"


def format_success(message: str) -> str:
    """Format success message for display.

    Args:
        message: Success message

    Returns:
        Formatted success string
    """
    return f"Success: {message}"


def format_info(message: str) -> str:
    """Format info message for display.

    Args:
        message: Info message

    Returns:
        Formatted info string
    """
    return f"Info: {message}"


def format_mode_switch(mode: str) -> str:
    """T062: Format mode switch confirmation.

    Args:
        mode: New mode ("ai" or "manual")

    Returns:
        Formatted mode switch message
    """
    mode_str = "AI mode" if mode == "ai" else "Manual mode"
    return f"Switched to {mode_str}"


def format_ambiguity_question(options: list[str]) -> str:
    """T049: Format ambiguity question for user.

    Args:
        options: List of possible options

    Returns:
        Formatted question string
    """
    return "Did you mean:\n" + "\n".join(f"  - {opt}" for opt in options)


def format_task_choices(tasks: list[Task]) -> str:
    """T050: Format task list for ambiguous queries.

    Args:
        tasks: List of available tasks

    Returns:
        Formatted task choices
    """
    if not tasks:
        return "No tasks available."

    lines = ["Available tasks:"]
    for task in tasks:
        line = f"  [{task.id}] {task.title}"
        if task.status == "complete":
            line += " (completed)"
        lines.append(line)
    return "\n".join(lines)


def format_summary(summary: TaskSummary) -> str:
    """T055: Format task summary for display.

    Args:
        summary: TaskSummary object

    Returns:
        Formatted summary string
    """
    if summary.total_count == 0:
        return "You have no tasks. Would you like to create one?"

    lines = [
        f"Task Summary:",
        f"  Total: {summary.total_count}",
        f"  Pending: {summary.pending_count}",
        f"  Complete: {summary.complete_count}",
    ]

    if summary.pending_count > 0:
        lines.append("\nPending tasks by priority:")
        if summary.high_priority_pending:
            lines.append(f"  High: {', '.join(summary.high_priority_pending)}")
        if summary.medium_priority_pending:
            lines.append(f"  Medium: {', '.join(summary.medium_priority_pending)}")
        if summary.low_priority_pending:
            lines.append(f"  Low: {', '.join(summary.low_priority_pending)}")

    return "\n".join(lines)


def format_verbose_intent(intent: str, entities: dict, confidence: float, function_call: str) -> str:
    """T047: Format verbose AI processing output.

    Args:
        intent: Parsed intent
        entities: Extracted entities
        confidence: Confidence score
        function_call: Function to be called

    Returns:
        Formatted verbose output
    """
    lines = [
        "AI Processing (verbose):",
        f"  Intent: {intent}",
        f"  Confidence: {confidence:.2f}",
        f"  Entities: {entities}",
        f"  Calling: {function_call}",
    ]
    return "\n".join(lines)

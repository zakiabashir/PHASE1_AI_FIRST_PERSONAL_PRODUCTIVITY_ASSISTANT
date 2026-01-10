"""
T026, T028, T029: CLI parser with mode switching and prompt support
"""

import argparse
import sys


def create_parser() -> argparse.ArgumentParser:
    """T026: Create CLI argument parser with subcommands.

    Returns:
        Configured ArgumentParser
    """
    parser = argparse.ArgumentParser(
        prog="AI Productivity Assistant",
        description="AI-First Personal Productivity Assistant CLI",
        add_help=True
    )

    # T028: Mode switching flags
    parser.add_argument(
        "--ai",
        action="store_true",
        help="Switch to AI mode"
    )
    parser.add_argument(
        "--manual",
        action="store_true",
        help="Switch to manual mode"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )

    # Subcommands for task operations
    subparsers = parser.add_subparsers(dest="command", help="Task commands")

    # create-task subcommand
    create_parser = subparsers.add_parser("create-task", help="Create a new task")
    create_parser.add_argument("title", help="Task title")
    create_parser.add_argument("--description", "-d", help="Task description")
    create_parser.add_argument(
        "--priority", "-p",
        choices=["low", "medium", "high"],
        default="medium",
        help="Task priority (default: medium)"
    )

    # list-tasks subcommand
    list_parser = subparsers.add_parser("list-tasks", help="List all tasks")

    # update-task subcommand
    update_parser = subparsers.add_parser("update-task", help="Update a task")
    update_parser.add_argument("id", help="Task ID (e.g., task-1)")
    update_parser.add_argument("--title", "-t", help="New title")
    update_parser.add_argument("--description", "-d", help="New description")
    update_parser.add_argument("--status", "-s", choices=["pending", "complete"], help="New status")
    update_parser.add_argument("--priority", "-p", choices=["low", "medium", "high"], help="New priority")

    # delete-task subcommand
    delete_parser = subparsers.add_parser("delete-task", help="Delete a task")
    delete_parser.add_argument("id", help="Task ID (e.g., task-1)")

    # complete-task subcommand
    complete_parser = subparsers.add_parser("complete-task", help="Mark a task as complete")
    complete_parser.add_argument("id", help="Task ID (e.g., task-1)")

    # summarize subcommand
    summarize_parser = subparsers.add_parser("summarize", help="Show task summary")

    return parser


def parse_args(args: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments.

    Args:
        args: Arguments to parse (defaults to sys.argv[1:])

    Returns:
        Parsed arguments namespace
    """
    parser = create_parser()
    return parser.parse_args(args)


def is_mode_switch(args: argparse.Namespace) -> bool:
    """T028: Check if user wants to switch modes.

    Args:
        args: Parsed arguments

    Returns:
        True if --ai or --manual flag is set
    """
    return args.ai or args.manual


def get_target_mode(args: argparse.Namespace) -> str | None:
    """T028: Get the target mode from arguments.

    Args:
        args: Parsed arguments

    Returns:
        "ai" if --ai flag, "manual" if --manual flag, None otherwise
    """
    if args.ai:
        return "ai"
    if args.manual:
        return "manual"
    return None


def is_cli_command(args: argparse.Namespace) -> bool:
    """Check if arguments represent a CLI command.

    Args:
        args: Parsed arguments

    Returns:
        True if a command subcommand is present
    """
    return args.command is not None


def looks_like_cli_command(input_line: str) -> bool:
    """Check if input looks like a CLI command before parsing.

    This prevents argparse errors for natural language input in AI mode.

    Args:
        input_line: User input line

    Returns:
        True if first word is a known CLI command
    """
    valid_commands = {
        "create-task", "list-tasks", "update-task",
        "delete-task", "complete-task", "summarize",
        "--ai", "--manual", "--verbose", "-h", "--help"
    }
    first_word = input_line.strip().split()[0].lower() if input_line.strip() else ""
    return first_word in valid_commands


def get_prompt() -> str:
    """T029: Get CLI prompt string based on current mode.

    Returns:
        Prompt string with current mode indicator
    """
    from src.storage.memory_store import get_current_mode
    mode = get_current_mode()
    mode_str = "ai-mode" if mode == "ai" else "manual-mode"
    return f"({mode_str}) $ "


def print_prompt() -> None:
    """T029: Print the current mode prompt."""
    print(get_prompt(), end="", flush=True)

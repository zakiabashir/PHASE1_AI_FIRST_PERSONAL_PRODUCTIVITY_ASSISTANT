"""
T030, T033, T043, T044, T061: CLI main entry point with mode-aware routing
"""

import sys

from src.cli.parser import (
    parse_args,
    is_mode_switch,
    get_target_mode,
    is_cli_command,
    looks_like_cli_command,
    print_prompt,
)
from src.cli.formatter import (
    format_confirmation,
    format_error,
    format_success,
    format_mode_switch,
    format_task_list,
    format_summary,
)
from src.resolver.dispatcher import (
    dispatch_cli,
    handle_ambiguity,
)
from src.storage.memory_store import (
    get_current_mode,
    set_current_mode,
    get_all_tasks,
)
from src.ai.intent_parser import Intent
from src.ai.main import process_ai_input


def cli_main(args: list[str]) -> int:
    """T030: Main CLI entry point.

    Args:
        args: Command-line arguments (excluding program name)

    Returns:
        Exit code (0 for success, 1 for error)
    """
    try:
        parsed = parse_args(args)

        # T028, T061: Handle mode switching
        if is_mode_switch(parsed):
            new_mode = get_target_mode(parsed)
            if new_mode:
                set_current_mode(new_mode)
                print(format_mode_switch(new_mode))
                # After mode switch, enter interactive loop if no command
                if not is_cli_command(parsed):
                    return run_interactive_loop(new_mode, verbose=parsed.verbose)
                return 0

        # T061: Mode-aware command routing
        current_mode = get_current_mode()

        # If no command and not mode switch, start interactive loop
        if not is_cli_command(parsed):
            return run_interactive_loop(current_mode, verbose=parsed.verbose)

        # Handle explicit CLI command
        return handle_cli_command(parsed, current_mode)

    except ValueError as e:
        # T033: Error handling for ValueError
        print(format_error(str(e)))
        return 1
    except Exception as e:
        # T044: Graceful error handling for unexpected errors
        print(format_error(f"Unexpected error: {e}"))
        return 1


def handle_cli_command(args, current_mode: str) -> int:
    """Handle a single CLI command.

    Args:
        args: Parsed arguments
        current_mode: Current interaction mode

    Returns:
        Exit code
    """
    # Manual mode: execute command directly
    if current_mode == "manual" or args.command:
        return execute_manual_command(args)

    # AI mode: process through AI layer (T043)
    return 0  # Will be implemented in AI phase


def execute_manual_command(args) -> int:
    """Execute a manual CLI command.

    Args:
        args: Parsed arguments with command and params

    Returns:
        Exit code
    """
    try:
        command = args.command

        if command == "create-task":
            task = dispatch_cli(
                command,
                title=args.title,
                description=args.description,
                priority=args.priority
            )
            print(format_confirmation("created", task))

        elif command == "list-tasks":
            tasks = dispatch_cli(command)
            print(format_task_list(tasks))

        elif command == "update-task":
            # Build kwargs with only provided arguments
            kwargs = {"id": args.id}
            if args.title:
                kwargs["title"] = args.title
            if args.description:
                kwargs["description"] = args.description
            if args.status:
                kwargs["status"] = args.status
            if args.priority:
                kwargs["priority"] = args.priority

            task = dispatch_cli(command, **kwargs)
            print(format_confirmation("updated", task))

        elif command == "delete-task":
            dispatch_cli(command, id=args.id)
            print(format_success(f"Task {args.id} deleted"))

        elif command == "complete-task":
            task = dispatch_cli(command, id=args.id)
            print(format_confirmation("marked as complete", task))

        elif command == "summarize":
            summary = dispatch_cli(command)
            print(format_summary(summary))

        else:
            print(format_error(f"Unknown command: {command}"))
            return 1

        return 0

    except ValueError as e:
        print(format_error(str(e)))
        return 1


def run_interactive_loop(current_mode: str, verbose: bool = False) -> int:
    """Run interactive CLI loop.

    Args:
        current_mode: Starting mode ("ai" or "manual")
        verbose: Whether to enable verbose output

    Returns:
        Exit code
    """
    print("AI Productivity Assistant - Interactive Mode")
    print(f"Starting in {current_mode} mode")
    print("Type 'exit' or 'quit' to exit, '--ai' or '--manual' to switch modes")
    print()

    while True:
        try:
            # T029: Print mode-aware prompt
            print_prompt()

            # Read user input
            line = sys.stdin.readline().strip()

            if not line:
                continue

            # Exit commands
            if line.lower() in ("exit", "quit"):
                print("Goodbye!")
                break

            # Parse and execute
            try:
                current_mode = get_current_mode()

                # In AI mode: check if this looks like a CLI command before parsing
                if current_mode == "ai" and not looks_like_cli_command(line):
                    # Natural language input - send to AI directly
                    process_ai_input(line, verbose=verbose)
                    continue

                # Looks like CLI command or in manual mode - parse it
                parsed = parse_args(line.split())

                # Handle mode switch
                if is_mode_switch(parsed):
                    new_mode = get_target_mode(parsed)
                    if new_mode:
                        set_current_mode(new_mode)
                        print(format_mode_switch(new_mode))
                    continue

                # Handle command
                if is_cli_command(parsed):
                    if current_mode == "manual":
                        execute_manual_command(parsed)
                    else:
                        # T043: AI mode CLI commands still use manual execution
                        execute_manual_command(parsed)

            except ValueError as e:
                print(format_error(str(e)))

        except KeyboardInterrupt:
            print("\nGoodbye!")
            break
        except EOFError:
            break

    return 0


def handle_ai_input(user_input: str, verbose: bool = False) -> int:
    """T043: Handle natural language input in AI mode.

    Args:
        user_input: User's natural language input
        verbose: Whether to show verbose AI processing

    Returns:
        Exit code
    """
    # T043: Integrate AI processing
    return process_ai_input(user_input, verbose=verbose)

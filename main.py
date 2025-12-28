#!/usr/bin/env python3
"""
AI-First Personal Productivity Assistant - CLI MVP
T004: Main application entry point
"""

import sys

from src.cli.main import cli_main


def main() -> int:
    """Entry point for the application."""
    try:
        return cli_main(sys.argv[1:])
    except KeyboardInterrupt:
        print("\nGoodbye!")
        return 0
    except Exception as e:
        print(f"Error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())

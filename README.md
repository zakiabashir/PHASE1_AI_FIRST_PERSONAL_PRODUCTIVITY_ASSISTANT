# AI-First Personal Productivity Assistant (CLI MVP)

An AI-first personal productivity assistant with a Command Line Interface (CLI). The system supports dual-mode interaction: manual CLI commands and AI-powered natural language processing.

## Features

- **Manual Mode**: Explicit CLI commands for deterministic task management
- **AI Mode**: Natural language interaction powered by LLM intent classification
- **Task CRUD Operations**: Create, Read, Update, Delete, and Complete tasks
- **Task Summarization**: Get a quick overview of your workload
- **Mode Switching**: Seamlessly toggle between manual and AI modes

## Setup Instructions

1. **Install Python 3.13+**
   ```bash
   python3 --version  # Should be 3.13 or higher
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set AI API Key** (required for AI mode)
   ```bash
   export AI_API_KEY=your_openai_api_key_here
   ```

4. **Run the Application**
   ```bash
   python main.py
   ```

## Usage Examples

### Manual Mode Commands

```bash
# Create a task
python main.py create-task "Study AI" --priority high

# Create a task with description
python main.py create-task "Build CLI app" --description "Implement CRUD functions" --priority medium

# List all tasks
python main.py list-tasks

# Update a task
python main.py update-task task-1 --title "Study AI tonight" --priority high

# Mark a task as complete
python main.py complete-task task-1

# Delete a task
python main.py delete-task task-1

# Show task summary
python main.py summarize
```

### Interactive Mode

Start the interactive loop:
```bash
python main.py
```

Once in interactive mode, you can:

**Switch modes:**
```
(ai-mode) $ --manual
Switched to Manual mode
(manual-mode) $
```

**Manual mode commands:**
```
(manual-mode) $ create-task "Test task"
Task 'Test task' has been created (ID: task-1).

(manual-mode) $ list-tasks
ID      Title      Status   Priority
----------------------------------------
task-1  Test task  pending  medium
```

**AI mode (requires AI_API_KEY):**
```
(ai-mode) $ add a task to study python
Task 'study python' has been created (ID: task-1).

(ai-mode) $ show me my tasks
ID      Title         Status   Priority
------------------------------------------
task-1  study python pending  medium

(ai-mode) $ mark task 1 as complete
Task 'study python' has been marked as complete (ID: task-1).

(ai-mode) $ summarize
Task Summary:
  Total: 1
  Pending: 0
  Complete: 1
```

### Verbose Mode

Enable verbose output to see AI processing details:
```bash
python main.py --verbose
```

In verbose mode, AI interactions show:
- Parsed intent
- Extracted entities
- Confidence score
- Function being called

## Architecture

The application follows a four-layer architecture:

```
User Input
   ├─ Manual CLI Commands ─────┐
   │                           │
   └─ AI Natural Language ─────┤
                               │
                       ┌───────▼────────┐
                       │ Action Resolver │
                       └───────┬────────┘
                               │
                       ┌───────▼────────┐
                       │  CRUD Functions │
                       └───────┬────────┘
                               │
                       ┌───────▼────────┐
                       │ In-Memory Store │
                       └────────────────┘
```

### Key Design Principles

1. **Explicit CRUD Functions**: AI layer ONLY calls CRUD functions - never generates code
2. **Clear Separation**: CLI, AI, Resolver, and CRUD layers are independent
3. **In-Memory Storage**: All data is stored in memory (lost on restart)
4. **Feature Parity**: Both modes support identical operations

## Project Structure

```
src/
├── cli/                    # CLI Layer
│   ├── parser.py          # argparse setup
│   ├── formatter.py       # output formatting
│   └── main.py            # CLI entry point
├── ai/                     # AI Intent Layer
│   ├── client.py          # LLM API wrapper
│   ├── intent_parser.py   # intent classification
│   ├── entity_extractor.py # parameter extraction
│   ├── prompts.py         # LLM system prompts
│   └── main.py            # AI mode entry point
├── resolver/               # Action Resolver
│   └── dispatcher.py      # intent → CRUD router
├── core/                   # CRUD Core
│   ├── task_crud.py       # CRUD functions
│   └── summarize.py       # summarization
├── storage/                # Storage Layer
│   ├── memory_store.py    # in-memory store
│   └── models.py          # Task model
└── config/                 # Configuration
    ├── settings.py        # environment variables
    └── constants.py       # default values

tests/unit/                 # Unit tests
├── test_task_crud.py
└── test_summarize.py

main.py                     # Application entry point
requirements.txt           # ONE dependency: openai>=1.0.0
README.md                  # This file
```

## Constitution Compliance

This project adheres to the following principles:

- **Python 3.13+**: Uses modern Python with type hints
- **Explicit CRUD Functions**: AI orchestrates, CRUD functions execute
- **Dual Mode Interaction**: Manual and AI modes with feature parity
- **In-Memory Storage**: Phase I uses only in-memory storage (no files, no databases)
- **Clear Separation**: Four-layer architecture with strict boundaries
- **Minimal Dependencies**: Only openai>=1.0.0 beyond Python standard library

## Testing

Run unit tests:
```bash
python3 -m unittest tests.unit.test_task_crud -v
python3 -m unittest tests.unit.test_summarize -v
```

Run all tests:
```bash
python3 -m unittest discover tests -v
```

## Troubleshooting

### "AI_API_KEY environment variable not set"

Set your OpenAI API key:
```bash
export AI_API_KEY=your_api_key_here
```

### "AI client not available"

Ensure:
1. OpenAI package is installed: `pip install openai`
2. AI_API_KEY environment variable is set
3. Your API key is valid

### "Task 'task-X' not found"

The task doesn't exist or was deleted. Remember: **data is not persisted** between runs.

### Commands show "No tasks found"

Each CLI invocation creates a new process with fresh memory. To test multiple operations:

```bash
python3 -c "
from src.core.task_crud import create_task, list_tasks
create_task('Test task')
print(list_tasks())
"
```

## Development

### Adding New Features

1. **New CRUD Operation**: Add function to `src/core/task_crud.py`
2. **New Intent**: Add to `Intent` enum in `src/ai/intent_parser.py`
3. **New Command**: Add subparser in `src/cli/parser.py`
4. **Update Resolver**: Add routing in `src/resolver/dispatcher.py`

### Testing Strategy

- Unit tests for all CRUD functions (using `unittest`)
- Manual testing for AI mode (LLM calls are slow/expensive)
- Test both modes for feature parity

## Future Phases

- **Phase II**: Web application with persistence
- **Phase III**: Chatbot integration (Discord, Slack, Telegram)

## License

This is a hackathon project for demonstration purposes.

## Acknowledgments

Built with Spec-Driven Development (SDD) methodology using SpecKit Plus templates.

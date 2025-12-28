# Quickstart Guide: AI-First Personal Productivity Assistant

**Feature**: 001-ai-productivity-assistant
**Phase**: I (CLI MVP)
**Date**: 2025-12-29

---

## Overview

This guide helps developers set up and run the AI-First Personal Productivity Assistant (CLI MVP) for local development and hackathon demo.

---

## Prerequisites

### Required

- **Python 3.13+**: [Download](https://www.python.org/downloads/)
- **OpenAI API Key**: [Get API key](https://platform.openai.com/api-keys)
- **Git**: For cloning repository (optional)

### Verify Installation

```bash
python --version  # Should show Python 3.13.x
```

---

## Setup (5 Minutes)

### 1. Clone or Navigate to Repository

```bash
cd /path/to/PHASE1_AI_FIRST_PERSONAL_PRODUCTIVITY_ASSISTANT
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/macOS)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Expected output**: Only one package installed (`openai`)

### 4. Set API Key

```bash
# Linux/macOS
export AI_API_KEY="your-api-key-here"

# Windows (Command Prompt)
set AI_API_KEY=your-api-key-here

# Windows (PowerShell)
$env:AI_API_KEY="your-api-key-here"
```

**Verify**: `echo $AI_API_KEY` (Linux/macOS) or `echo %AI_API_KEY%` (Windows)

---

## Running the Application

### Start AI Mode (Default)

```bash
python main.py
```

**Prompt**: `(ai-mode) $`

**AI Mode Examples**:
```bash
(ai-mode) $ add a task to study AI
✓ Task 'study AI' created with ID task-1.

(ai-mode) $ show my tasks
ID    Title         Status    Priority
task-1  study AI     pending   medium

(ai-mode) $ mark task 1 as complete
✓ Task 'study AI' has been marked as complete.
```

### Start Manual Mode

```bash
python main.py --manual
```

**Prompt**: `(manual-mode) $`

**Manual Mode Examples**:
```bash
(manual-mode) $ create-task "Prepare demo slides" --priority high
✓ Task 'Prepare demo slides' created with ID task-2.

(manual-mode) $ list-tasks
ID    Title                    Status    Priority
task-1  study AI                 complete  medium
task-2  Prepare demo slides     pending   high

(manual-mode) $ complete-task task-2
✓ Task 'Prepare demo slides' has been marked as complete.

(manual-mode) $ delete-task task-1
✓ Task 'study AI' has been deleted.
```

---

## Command Reference

### Global Flags

| Flag | Description |
|------|-------------|
| `--ai` | Start in AI mode (default) |
| `--manual` | Start in manual mode |
| `--verbose` | Enable verbose logging (shows AI decisions) |

### Manual Mode Commands

| Command | Arguments | Description |
|---------|-----------|-------------|
| `create-task` | `title` | Create new task |
| | `--description TEXT` | Optional description |
| | `--priority LEVEL` | Priority: low, medium, high |
| `list-tasks` | (none) | Display all tasks |
| `update-task` | `id` | Update task by ID |
| | `--title TEXT` | New title |
| | `--description TEXT` | New description |
| | `--status STATUS` | New status (pending/complete) |
| | `--priority LEVEL` | New priority |
| `delete-task` | `id` | Delete task by ID |
| `complete-task` | `id` | Mark task as complete |

### AI Mode Examples

| User Input | Intent | Entities Extracted |
|------------|--------|-------------------|
| "add a task to buy milk" | CREATE | title="buy milk" |
| "create high priority task: finish report" | CREATE | title="finish report", priority="high" |
| "show me all my tasks" | READ | (none) |
| "what's my status" | SUMMARIZE | (none) |
| "mark task 3 as done" | COMPLETE | id="task-3" |
| "remove task 2" | DELETE | id="task-2" |
| "change task 1 priority to high" | UPDATE | id="task-1", priority="high" |

---

## Verbose Mode

Enable verbose logging to see AI decision-making:

```bash
python main.py --verbose
```

**Output**:
```bash
(ai-mode) $ add a task to study AI
[AI] Parsing intent...
[AI] Intent: CREATE (confidence: 0.95)
[AI] Entities: title='study AI', priority=None
[AI] Calling: create_task(title='study AI', priority='medium')
✓ Task 'study AI' created with ID task-1.
```

---

## Mode Switching

Switch between modes during session:

```bash
# From AI to manual
(ai-mode) $ --manual
Switched to manual mode
(manual-mode) $

# From manual to AI
(manual-mode) $ --ai
Switched to AI mode
(ai-mode) $
```

---

## Error Handling

### API Key Missing

```bash
(ai-mode) $ add a task
Error: AI_API_KEY environment variable not set.
Use --manual mode or set AI_API_KEY environment variable.
```

**Fix**: Set `AI_API_KEY` environment variable (see Setup step 4)

### Task Not Found

```bash
(manual-mode) $ delete-task task-999
Error: Task 'task-999' not found
```

### Invalid Input

```bash
(manual-mode) $ create-task ""
Error: Task title cannot be empty
```

---

## Project Structure

```
src/
├── cli/            # CLI layer (argparse, formatting)
├── ai/             # AI intent layer (LLM client, parsing)
├── resolver/       # Action resolver (intent → CRUD routing)
├── core/           # CRUD functions (data manipulation)
├── storage/        # In-memory store (Task model, state)
└── config/         # Configuration (settings, constants)

tests/
└── unit/           # Unit tests for CRUD functions

main.py             # Application entry point
requirements.txt    # One dependency: openai
```

---

## Development Workflow

### Run Tests

```bash
# Run all unit tests
python -m unittest discover tests/

# Run specific test file
python -m unittest tests.unit.test_task_crud
```

### Manual Testing Checklist

1. **CRUD Operations**:
   - [ ] Create task with title only
   - [ ] Create task with title + description + priority
   - [ ] List tasks (empty, single, multiple)
   - [ ] Update task title
   - [ ] Update task status to complete
   - [ ] Delete task
   - [ ] Complete task

2. **AI Mode**:
   - [ ] Create task via natural language
   - [ ] List tasks via natural language
   - [ ] Complete task via natural language
   - [ ] Delete task via natural language
   - [ ] Update task via natural language
   - [ ] Summarize tasks
   - [ ] Handle ambiguous input

3. **Error Handling**:
   - [ ] Empty task title rejected
   - [ ] Non-existent task ID rejected
   - [ ] API key missing handled gracefully
   - [ ] Invalid manual command shows usage

4. **Mode Switching**:
   - [ ] Switch from AI to manual
   - [ ] Switch from manual to AI
   - [ ] Prompt reflects current mode

---

## Troubleshooting

### "Module not found" error

**Cause**: Virtual environment not activated

**Fix**: Activate virtual environment (see Setup step 2)

### "AI_API_KEY not set" error

**Cause**: Environment variable not set

**Fix**: Set `AI_API_KEY` environment variable (see Setup step 4)

### LLM API timeout

**Cause**: Network issue or API rate limit

**Fix**:
- Check internet connection
- Verify API key is valid
- Use `--manual` mode as fallback

### Tasks lost on restart

**Cause**: Phase I uses in-memory storage only (intentional)

**Note**: This is expected behavior. Persistence will be added in Phase II.

---

## Performance Expectations

| Operation | Target |
|-----------|--------|
| Manual CRUD | <500ms |
| AI task creation | <5 seconds |
| AI summarization | <2 seconds |

---

## Next Steps

1. **Review Architecture**: Read `plan.md` for detailed design
2. **Review Data Model**: Read `data-model.md` for entity definitions
3. **Review Contracts**: Read `contracts/crud.md` and `contracts/ai_intent.md`
4. **Run Tests**: Execute test suite to verify setup
5. **Start Coding**: Follow implementation tasks in `tasks.md` (generated by `/sp.tasks`)

---

## Demo Script (Hackathon)

Prepared demo sequence:

```bash
# Start in AI mode
python main.py

# Create tasks
(ai-mode) $ add a task to prepare hackathon demo
(ai-mode) $ create high priority task: test all CRUD functions
(ai-mode) $ add task "write documentation" with priority low

# Show tasks
(ai-mode) $ show my tasks

# Complete a task
(ai-mode) $ mark the first task as complete

# Summarize
(ai-mode) $ what's my status

# Switch to manual mode
(ai-mode) $ --manual

# Show manual commands work
(manual-mode) $ list-tasks
(manual-mode) $ complete-task task-2
(manual-mode) $ list-tasks

# Exit
(manual-mode) $ exit
```

---

## Support

**Issues**: Check constitution.md for architecture constraints
**Questions**: Review research.md for technology decisions
**Contracts**: See contracts/ directory for API specifications

---

**Quickstart Complete**: You're ready to develop and demo!

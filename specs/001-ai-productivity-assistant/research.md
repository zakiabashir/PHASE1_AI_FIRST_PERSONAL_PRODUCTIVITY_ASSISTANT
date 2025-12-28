# Research: AI-First Personal Productivity Assistant (Phase I)

**Feature**: 001-ai-productivity-assistant
**Date**: 2025-12-29
**Status**: Complete

---

## Overview

This document captures research findings and technology decisions for Phase I implementation. All technical unknowns from the plan have been resolved.

---

## Decision 1: LLM Provider Selection

### Options Evaluated

| Provider | SDK | Pros | Cons |
|----------|-----|------|------|
| **OpenAI** (GPT-4o) | `openai` | Fast responses, JSON mode, excellent intent classification | API key management, cost |
| **Anthropic** (Claude) | `anthropic` | Strong instruction following, long context | Slightly slower, JSON parsing less native |
| **Open-source local** (Ollama) | `ollama` | Free, no API key needed | Slower, requires local model setup |

### Decision: OpenAI GPT-4o

**Rationale**:
- **JSON Mode**: Native JSON output simplifies intent/entity extraction (no parsing gymnastics)
- **Speed**: GPT-4o is optimized for fast responses (<2 seconds for classification tasks)
- **Hackathon Demo**: Proven reliability, less risk of API issues during demo
- **Python SDK**: `openai` package is well-maintained, simple interface

**Alternatives Considered and Rejected**:
- Anthropic Claude: Excellent model but JSON response requires more parsing logic
- Local Ollama: Setup overhead too high for hackathon timeline

**Implementation Notes**:
- Use `response_format={"type": "json_object"}` for structured output
- Set `temperature=0` for deterministic intent classification
- Store API key in environment variable `AI_API_KEY` (FR-025)

---

## Decision 2: CLI Argument Parsing Strategy

### Options Evaluated

| Approach | Pros | Cons |
|----------|------|------|
| **argparse** (standard lib) | No dependency, powerful subcommands, help generation | Verbose setup |
| **click** (third-party) | Declarative, cleaner code | Violates constitution (no external deps) |
| **typer** (third-party) | Modern, type-based | Violates constitution (no external deps) |

### Decision: argparse (Standard Library)

**Rationale**:
- **Constitution Compliance**: Principle VI mandates standard library preference
- **No Dependencies**: Keeps `requirements.txt` to one item (LLM SDK only)
- **Sufficient Power**: argparse handles subcommands, arguments, validation, and help text

**Alternatives Considered and Rejected**:
- click/typer: Both violate "Minimal Dependencies" principle

**Implementation Notes**:
- Use `argparse.ArgumentParser` with `subparsers` for command routing
- Define subcommands: `create-task`, `list-tasks`, `update-task`, `delete-task`, `complete-task`
- Global flags: `--ai`, `--manual`, `--verbose`

---

## Decision 3: Task Model Implementation

### Options Evaluated

| Approach | Pros | Cons |
|----------|------|------|
| **dataclasses** (standard lib) | Type-safe, minimal boilerplate, `__repr__` free | Less validation than Pydantic |
| **Pydantic** (third-party) | Runtime validation, serialization | External dependency |
| **TypedDict** | Lightweight, JSON-serializable | No methods, less readable |

### Decision: dataclasses (Standard Library)

**Rationale**:
- **Constitution Compliance**: No external dependencies
- **Type Safety**: Python 3.13+ has enhanced type hints, dataclasses leverage this
- **Sufficient**: Validation happens in CRUD functions, not model layer

**Alternatives Considered and Rejected**:
- Pydantic: Violates "Minimal Dependencies" principle

**Implementation Notes**:
```python
from dataclasses import dataclass

@dataclass
class Task:
    id: str
    title: str
    description: str | None
    status: str  # "pending" | "complete"
    priority: str  # "low" | "medium" | "high"
```

---

## Decision 4: In-Memory Store Implementation

### Options Evaluated

| Approach | Pros | Cons |
|----------|------|------|
| **Global dict** | Simple, fast, thread-safe (GIL) | No query capabilities beyond ID lookup |
| **list** with search | Simple, ordered | O(n) lookup |
| **custom class** with methods | Encapsulated, testable | More boilerplate |

### Decision: Global Dict with Store Class Wrapper

**Rationale**:
- **Constitution Compliance**: Principle IV mandates in-memory only
- **Performance**: Dict lookup is O(1) by task ID
- **Simplicity**: Single global dict wrapped in a class for clean interface

**Implementation Notes**:
```python
# src/storage/memory_store.py
_tasks: dict[str, Task] = {}
_next_id: int = 1

def get_store() -> MemoryStore:
    return MemoryStore(_tasks, _next_id)
```

---

## Decision 5: Output Formatting Strategy

### Options Evaluated

| Approach | Pros | Cons |
|----------|------|------|
| **f-strings** with manual spacing | Full control, simple | Tedious for tables |
| **tabulate** (third-party) | Pretty tables | External dependency |
| **rich** (third-party) | Beautiful output | Heavy dependency |

### Decision: f-strings with format helper functions

**Rationale**:
- **Constitution Compliance**: Standard library only
- **Sufficient**: Task list is simple (ID, title, status, priority)
- **Emoji Support**: Unicode emoji work fine in f-strings

**Implementation Notes**:
- `format_task_list()`: builds aligned string using f-strings and str lengths
- `format_confirmation()`: uses emoji (✅, ❌) for visual feedback
- Use `str.ljust()`, `str.rjust()` for column alignment

---

## Decision 6: Error Handling Strategy

### Options Evaluated

| Approach | Pros | Cons |
|----------|------|------|
| **Exceptions** (ValueError, KeyError) | Pythonic, stack traces | Requires try/except at boundaries |
| **Result type** (Return success/failure) | Explicit, no exceptions | Non-idiomatic Python |
| **Custom error hierarchy** | Specific error types | Overkill for MVP |

### Decision: Built-in Exceptions with Clear Messages

**Rationale**:
- **Pythonic**: Exception-based error handling is standard
- **Simplicity**: No custom error classes needed
- **Clear Messages**: Raise `ValueError` with descriptive message for user

**Implementation Notes**:
```python
def create_task(title: str, ...):
    if not title or not title.strip():
        raise ValueError("Task title cannot be empty")
    if len(title) > 200:
        raise ValueError("Task title must be 200 characters or less")
```

---

## Decision 7: AI Prompt Strategy

### Options Evaluated

| Approach | Pros | Cons |
|----------|------|------|
| **Single-shot** with JSON schema | Simple, fast | No conversation context |
| **Few-shot** with examples | Better accuracy | More tokens, slower |
| **Function calling** (OpenAI) | Native, structured | Less portable |

### Decision: System Prompt + JSON Mode

**Rationale**:
- **JSON Mode**: Enforces structured output (intent + entities)
- **System Prompt**: Clear instructions on behavior constraints
- **No Examples**: Token efficiency, GPT-4o understands intent classification well

**Implementation Notes**:
```python
SYSTEM_PROMPT = """
You are a task management assistant. Parse user input and classify intent.
Extract entities (title, id, description, priority, status).
NEVER generate code—only return JSON.

Return format:
{
  "intent": "CREATE" | "READ" | "UPDATE" | "DELETE" | "COMPLETE" | "SUMMARIZE",
  "entities": {
    "title": "string or null",
    "id": "string or null",
    "description": "string or null",
    "priority": "low" | "medium" | "high" or null,
    "status": "pending" | "complete" or null
  },
  "confidence": 0.0 to 1.0
}
"""
```

---

## Decision 8: Mode Persistence Strategy

### Options Evaluated

| Approach | Pros | Cons |
|----------|------|------|
| **In-memory variable** | Simple, resets on restart | Expected for Phase I |
| **Environment variable** | Persists across sessions | Requires shell setup |
| **Config file** | Persistent | Violates "no file I/O" |

### Decision: In-Memory Variable

**Rationale**:
- **Constitution Compliance**: Principle IV prohibits file I/O
- **Expected Behavior**: CLI tools typically reset on restart
- **Simplicity**: Single variable `current_mode: str = "ai"` (default)

**Implementation Notes**:
- Default to AI mode (AI-first product)
- Switch with `--ai` or `--manual` flags
- Display mode in CLI prompt: `(ai-mode) $` or `(manual-mode) $`

---

## Decision 9: Testing Strategy

### Options Evaluated

| Approach | Pros | Cons |
|----------|------|------|
| **unittest** (standard lib) | Built-in, sufficient | More verbose than pytest |
| **pytest** (third-party) | Cleaner, powerful | External dependency |
| **Manual only** | Fastest | No regression protection |

### Decision: unittest for CRUD, Manual for AI

**Rationale**:
- **Constitution Compliance**: unittest is standard library
- **CRUD Focus**: CRUD functions are pure and easily unit-testable
- **AI Manual**: LLM calls are slow/expensive, manual testing acceptable
- **Hackathon Speed**: Minimal test suite, focus on core CRUD

**Implementation Notes**:
- `tests/unit/test_task_crud.py`: CRUD function tests (happy path + error cases)
- `tests/unit/test_summarize.py`: Summarization logic tests
- Manual testing checklist for AI mode (demo preparation)

---

## Dependencies Summary

### requirements.txt
```
# ONE external dependency (Constitution Principle VI)
openai>=1.0.0
```

### Standard Library Modules Used
- `argparse` - CLI parsing
- `dataclasses` - Task model
- `unittest` - Testing
- `os` - Environment variable access
- `sys` - Command-line args
- `json` - LLM response parsing
- `enum` - Intent and status enums

---

## Performance Considerations

### Target Metrics (from Success Criteria)

| Metric | Target | Implementation Strategy |
|--------|--------|-------------------------|
| Manual CRUD | <500ms | In-memory operations are <10ms, margin ample |
| AI summarization | <2s | LLM call is bottleneck; optimize prompt length |
| Task creation (AI) | <5s | LLM call + CRUD; GPT-4o fast enough |

### Optimization Notes
- Use `temperature=0` for deterministic, fast responses
- Cache LLM client (reuse connection)
- Minimize prompt tokens (system prompt only, no few-shot examples)

---

## Security Considerations

### API Key Management
- Store in environment variable `AI_API_KEY`
- Load via `os.getenv("AI_API_KEY")`
- Fail gracefully if missing: "Error: AI_API_KEY environment variable not set. Use --manual mode or set API key."

### Input Validation
- All user inputs validated at CRUD layer
- No SQL injection risk (no database)
- No command injection (argparse handles escaping)

---

## Future Phase Considerations

### Phase II (Web) Preparation
- Keep CRUD functions pure (no CLI-specific logic)
- Document CRUD function signatures for API translation
- Task model compatible with ORM migration (dataclasses → SQLAlchemy)

### Phase III (Chatbot) Preparation
- AI Intent Layer already NLP-focused
- Entity extraction handles conversational input
- Confirmation messages format adaptable to platforms

---

## Research Complete

All technical unknowns resolved. Architecture aligns with constitution principles. Ready for Phase 1 design (data model, contracts, quickstart).

**Sign-off**: Research artifacts validated against spec and constitution.

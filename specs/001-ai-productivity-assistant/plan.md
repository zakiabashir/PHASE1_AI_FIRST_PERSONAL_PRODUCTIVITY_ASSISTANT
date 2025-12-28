# Implementation Plan: AI-First Personal Productivity Assistant (CLI MVP)

**Branch**: `001-ai-productivity-assistant` | **Date**: 2025-12-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-productivity-assistant/spec.md`

---

## Summary

Build an AI-first personal productivity assistant with CLI interface. The system supports dual-mode interaction: manual CLI commands and AI-powered natural language processing. Both modes share the same explicit CRUD functions, ensuring feature parity and enabling clean evolution to web (Phase II) and chatbot (Phase III) interfaces.

**Technical Approach**:
- Python 3.13+ with standard library + one LLM SDK
- In-memory storage for Phase I (no persistence)
- Four-layer architecture: CLI → AI/Resolver → CRUD → Storage
- AI parses intent and maps to explicit CRUD functions (never generates operations inline)

---

## Technical Context

**Language/Version**: Python 3.13+ (constitution mandate)
**Primary Dependencies**: Python standard library + one LLM SDK (OpenAI or Anthropic)
**Storage**: In-memory data structures (dict, list, set) - NO files, NO databases
**Testing**: `unittest` from Python standard library
**Target Platform**: Any OS with Python 3.13+ installed (local terminal execution)
**Project Type**: Single-project CLI application
**Performance Goals**:
  - Manual CRUD commands: <500ms response time (SC-002)
  - AI summarization: <2 seconds for up to 100 tasks (SC-007)
  - Task creation via natural language: <5 seconds end-to-end (SC-001)
**Constraints**:
  - Manual mode works offline (AI mode requires network)
  - No persistence - all data lost on restart (intentional for Phase I)
  - Only one external dependency beyond standard library (LLM SDK)
**Scale/Scope**:
  - Task counts: <1000 tasks (performance degrades gracefully beyond)
  - Single user, single session
  - English language only

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Compliance

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Python 3.13+ Foundation | ✅ PASS | Mandated in Technical Context |
| II. Explicit CRUD Functions | ✅ PASS | Architecture enforces AI layer only maps to functions |
| III. Dual Mode Interaction | ✅ PASS | Both CLI and AI modes call same CRUD core |
| IV. In-Memory Storage Only (Phase I) | ✅ PASS | No file I/O or databases planned |
| V. Clear Separation of Concerns | ✅ PASS | Four-layer architecture defined |
| VI. Minimal Dependencies | ✅ PASS | Standard library + one LLM SDK only |

**Gate Result**: ✅ **PASSED** - Proceed to Phase 0 Research

### Post-Design Compliance (after Phase 1)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Python 3.13+ Foundation | ✅ PASS | Python 3.13+ specified in Technical Context and research.md |
| II. Explicit CRUD Functions | ✅ PASS | contracts/crud.md defines explicit function signatures; AI layer only maps to functions |
| III. Dual Mode Interaction | ✅ PASS | Both modes converge at Action Resolver; feature parity enforced |
| IV. In-Memory Storage Only (Phase I) | ✅ PASS | data-model.md specifies dict-based storage; no file I/O |
| V. Clear Separation of Concerns | ✅ PASS | Four-layer architecture (CLI/AI/Resolver/CRUD) with strict boundaries |
| VI. Minimal Dependencies | ✅ PASS | requirements.txt contains only `openai>=1.0.0` |

**Gate Result**: ✅ **PASSED** - Design fully compliant with constitution

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌─────────────────┐              ┌─────────────────┐             │
│   │   Manual CLI    │              │   AI Natural    │             │
│   │   Mode Input    │              │   Language      │             │
│   │                 │              │   Mode Input    │             │
│   │ create-task     │              │ "add a task..." │             │
│   │ list-tasks      │              │ "show my tasks" │             │
│   │ update-task     │              │ "mark task 1    │             │
│   │ delete-task     │              │  as complete"   │             │
│   │ complete-task   │              │                 │             │
│   └────────┬────────┘              └────────┬────────┘             │
│            │                                │                       │
│            ▼                                ▼                       │
│   ┌─────────────────┐              ┌─────────────────┐             │
│   │  CLI Parser     │              │  AI Intent      │             │
│   │  (argparse)     │              │  Layer          │             │
│   │                 │              │                 │             │
│   │  Validates      │              │  LLM API Call   │             │
│   │  syntax         │              │  - Parse intent │             │
│   │  Extracts       │              │  - Extract      │             │
│   │  args           │              │    entities     │             │
│   └────────┬────────┘              └────────┬────────┘             │
│            │                                │                       │
│            └────────────┬───────────────────┘                       │
│                         ▼                                           │
│            ┌─────────────────────┐                                  │
│            │   Action Resolver   │                                  │
│            │   (Router)          │                                  │
│            │                     │                                  │
│            │  Maps intent/args   │                                  │
│            │  to CRUD function   │                                  │
│            │  Validates params   │                                  │
│            └──────────┬──────────┘                                  │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────┐                 │
│   │            CRUD Functions Layer               │                 │
│   │  (Pure functions - no I/O, no side effects)   │                 │
│   │                                               │                 │
│   │  create_task(title, desc?, priority?)        │                 │
│   │  list_tasks()                                 │                 │
│   │  update_task(id, title?, desc?, status?,      │                 │
│   │              priority?)                        │                 │
│   │  delete_task(id)                              │                 │
│   │  complete_task(id)                            │                 │
│   │  summarize_tasks()                            │                 │
│   └───────────────────┬───────────────────────────┘                 │
│                       │                                             │
│                       ▼                                             │
│   ┌──────────────────────────────────────────────┐                 │
│   │          In-Memory Store                     │                 │
│   │   (dict, list, set - NO files, NO DB)        │                 │
│   │                                               │                 │
│   │  tasks: Dict[str, Task]                      │                 │
│   │  next_id: int                                │                 │
│   └──────────────────────────────────────────────┘                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-productivity-assistant/
├── plan.md              # This file
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (developer setup)
├── contracts/           # Phase 1 output (CRUD function contracts)
│   ├── crud.md         # CRUD function signatures and specifications
│   └── ai_intent.md    # AI intent classification schema
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
src/
├── __init__.py
│
├── cli/                    # CLI Layer - parses arguments, formats output
│   ├── __init__.py
│   ├── parser.py          # argparse setup, command definitions
│   ├── formatter.py       # output formatting (tables, confirmations)
│   └── main.py            # CLI entry point
│
├── ai/                     # AI Intent Layer - natural language processing
│   ├── __init__.py
│   ├── client.py          # LLM API client wrapper
│   ├── intent_parser.py   # intent classification (create/read/update/delete)
│   ├── entity_extractor.py # parameter extraction (title, id, etc.)
│   └── prompts.py         # LLM system/user prompt templates
│
├── resolver/               # Action Resolver - maps intent to CRUD function
│   ├── __init__.py
│   └── dispatcher.py      # intent → function router, validation
│
├── core/                   # CRUD Core - pure data manipulation functions
│   ├── __init__.py
│   ├── task_crud.py       # create, read, update, delete, complete
│   └── summarize.py       # task summarization logic
│
├── storage/                # Storage Layer - in-memory data container
│   ├── __init__.py
│   ├── memory_store.py    # global state, Task collection management
│   └── models.py          # Task dataclass/Pydantic model definition
│
└── config/                 # Configuration
    ├── __init__.py
    └── settings.py        # environment variables, constants

tests/
├── __init__.py
├── unit/                  # Unit tests for CRUD functions
│   ├── __init__.py
│   ├── test_task_crud.py
│   └── test_summarize.py
│
└── integration/           # Integration tests (if time permits)
    ├── __init__.py
    ├── test_cli_mode.py
    └── test_ai_mode.py

main.py                     # Application entry point
requirements.txt           # ONE dependency: LLM SDK
README.md                  # User documentation
```

**Structure Decision**: Single-project structure with four-layer separation. This aligns with Constitution Principle V (Clear Separation of Concerns) and enables clean evolution to web/chatbot phases. The CLI and AI layers are replaceable interfaces; CRUD core and storage remain unchanged across phases.

---

## Layer Responsibilities

### 1. CLI Layer (`src/cli/`)

**Responsibilities**:
- Parse command-line arguments using `argparse` (standard library)
- Validate syntax and display usage guidance for invalid commands
- Format output for terminal display (tables, aligned columns, emoji indicators)
- NEVER contains business logic
- NEVER touches AI

**Key Functions**:
- `parse_cli_args(sys.argv)` → returns parsed command or None (if not CLI mode)
- `format_task_list(tasks: List[Task])` → formatted string
- `format_confirmation(action: str, task: Task)` → formatted string
- `format_error(message: str)` → formatted string

---

### 2. AI Intent Layer (`src/ai/`)

**Responsibilities**:
- Parse natural language input to classify user intent
- Extract parameters (task title, ID, description, priority, status)
- NEVER generates CRUD logic—ONLY maps to functions
- Handle ambiguity by asking follow-up questions

**Key Functions**:
- `classify_intent(user_input: str) → Intent` (enum: CREATE, READ, UPDATE, DELETE, COMPLETE, SUMMARIZE)
- `extract_entities(user_input: str, intent: Intent) → Dict[str, Any]` (extracts title, id, etc.)
- `build_system_prompt() → str` (defines AI behavior constraints)

**LLM Prompts**:
- System prompt enforces: "You are a task management assistant. Parse user input and classify intent. Extract entities. NEVER generate code—only return structured intent + entities."

---

### 3. Action Resolver (`src/resolver/`)

**Responsibilities**:
- Map AI-identified intent to specific CRUD function
- Validate extracted parameters match function signature
- Handle ambiguous intents (e.g., "add" vs. "create")
- Act as the "router" between intent and execution

**Key Functions**:
- `dispatch(intent: Intent, entities: Dict) → Any` (calls appropriate CRUD function)
- `validate_params(intent: Intent, params: Dict) → bool` (checks required fields)
- `handle_ambiguity(intent: Intent, confidence: float) → str` (asks user for clarification)

**Routing Table**:

| Intent | CRUD Function | Required Parameters | Optional Parameters |
|--------|---------------|---------------------|---------------------|
| CREATE | `create_task()` | title | description, priority |
| READ | `list_tasks()` | none | none |
| UPDATE | `update_task()` | id | title, description, status, priority |
| DELETE | `delete_task()` | id | none |
| COMPLETE | `complete_task()` | id | none |
| SUMMARIZE | `summarize_tasks()` | none | none |

---

### 4. CRUD Core (`src/core/`)

**Responsibilities**:
- Contain all data manipulation functions
- Pure functions: input → output (no I/O except in-memory mutations)
- NO awareness of CLI or AI layers
- Testable in isolation

**Key Functions**:
- `create_task(title: str, description: str | None = None, priority: str = "medium") → Task`
- `list_tasks() → List[Task]`
- `update_task(id: str, title: str | None = None, description: str | None = None, status: str | None = None, priority: str | None = None) → Task`
- `delete_task(id: str) → None`
- `complete_task(id: str) → Task`
- `summarize_tasks() → TaskSummary`

**Constraints**:
- Functions import from `storage.memory_store` (read/write in-memory state)
- Functions raise `ValueError` for invalid inputs (empty title, non-existent ID)
- Functions NEVER call LLM API or touch CLI

---

### 5. Storage Layer (`src/storage/`)

**Responsibilities**:
- Manage in-memory task collection
- Provide Task model definition
- Handle ID generation (task-1, task-2, etc.)

**Key Components**:
- `Task` dataclass with fields: id, title, description, status, priority
- `tasks: Dict[str, Task]` (global in-memory store)
- `next_id: int` (counter for sequential ID generation)

**Constraints**:
- NO file I/O (Constitution Principle IV)
- NO database connections
- All data lost on application restart (intentional)

---

## Data Model Design

### Task Entity

```text
Task:
  id: string              # Format: "task-N" where N is sequential integer (task-1, task-2, ...)
  title: string           # Required, 1-200 characters
  description: string | null  # Optional, 0-1000 characters
  status: enum            # Values: "pending" | "complete"
  priority: enum          # Values: "low" | "medium" | "high"
```

**State Transitions**:
```
pending → complete (via complete_task function)
complete → pending (via update_task function - status change)
```

**Validation Rules**:
- `title` cannot be empty (FR-029)
- `title` max length: 200 characters (FR-007)
- `description` max length: 1000 characters (FR-008)
- `id` must exist in store for update/delete/complete operations (FR-030)

---

## CLI Control Flow

### Manual Mode Execution

```
User Input: "create-task 'Study AI' --priority high"
     │
     ▼
┌─────────────────────────────────┐
│  CLI Parser (argparse)          │
│  - Validates command syntax     │
│  - Extracts arguments           │
│  - command = "create-task"      │
│  - title = "Study AI"           │
│  - priority = "high"            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Action Resolver (dispatcher)   │
│  - Maps CLI command → CRUD func │
│  - Validates parameters         │
│  - Calls: create_task(          │
│      title="Study AI",          │
│      priority="high")           │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  CRUD Function (create_task)    │
│  - Validates title non-empty    │
│  - Generates ID: "task-1"       │
│  - Creates Task object          │
│  - Stores in memory             │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  CLI Formatter                  │
│  - Formats confirmation:        │
│    "✓ Task 'Study AI' created   │
│     with ID task-1."             │
└─────────────────────────────────┘
```

### Mode Switching

```
CLI Prompt: (ai-mode) $ or (manual-mode) $

User: "--manual" or "/manual"
     │
     ▼
┌─────────────────────────────────┐
│  Set current_mode = "manual"    │
│  - Update prompt                │
│  - Subsequent inputs bypass AI  │
└─────────────────────────────────┘

User: "--ai" or "/ai"
     │
     ▼
┌─────────────────────────────────┐
│  Set current_mode = "ai"        │
│  - Update prompt                │
│  - Subsequent inputs processed  │
│    by AI Intent Layer           │
└─────────────────────────────────┘
```

---

## AI Intent Resolution Flow

```
User Input: "add a task to study AI for my hackathon"
     │
     ▼
┌─────────────────────────────────┐
│  AI Intent Layer                │
│  - client.py calls LLM API      │
│  - System prompt: "Parse intent │
│    and extract entities. Return  │
│    JSON: {intent, entities}"    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  LLM Response (JSON)            │
│  {                             │
│    "intent": "CREATE",         │
│    "entities": {               │
│      "title": "study AI for    │
│               my hackathon",   │
│      "priority": null          │
│    }                           │
│  }                             │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Entity Extractor               │
│  - Validates extracted entities │
│  - Handles missing fields       │
│  - Applies defaults             │
│    (priority = "medium")        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Action Resolver (dispatcher)   │
│  - Intent: CREATE              │
│  - Maps to: create_task()      │
│  - Calls create_task(          │
│      title="study AI for my     │
│            hackathon",          │
│      priority="medium")         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  CRUD Function (create_task)    │
│  - Same execution path as       │
│    manual mode                  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  AI Confirmation                │
│  - "✓ Task 'study AI for my     │
│     hackathon' created with     │
│     ID task-1."                 │
└─────────────────────────────────┘
```

### Ambiguity Handling

```
User Input: "complete the task" (multiple tasks exist)
     │
     ▼
┌─────────────────────────────────┐
│  AI Intent Layer                │
│  - Detects ambiguity: missing   │
│    task ID                      │
│  - Returns low confidence       │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Action Resolver                │
│  - Handles low confidence       │
│  - Asks user:                   │
│    "Which task would you like   │
│     to complete?"               │
│  - Lists available tasks        │
└─────────────────────────────────┘
```

### Verbose Mode (--verbose flag)

```
User Input: "--verbose" followed by command
     │
     ▼
┌─────────────────────────────────┐
│  Set verbose_mode = True        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  AI Processing Output (before   │
│  confirmation)                  │
│  - "Parsed intent: CREATE"      │
│  - "Extracted entities:         │
│     title='Study AI',            │
│     priority='high'"             │
│  - "Calling: create_task()"     │
└────────────┬────────────────────┘
             │
                 ▼
             (confirmation as normal)
```

---

## Dual-Mode Internal Operation

### Shared Execution Path

Both manual CLI mode and AI mode converge at the **Action Resolver**, ensuring identical CRUD execution:

```
                    ┌──────────────────┐
                    │  User Input      │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
          ┌─────┴─────┐           ┌──────┴──────┐
          │  Manual   │           │     AI      │
          │  Mode     │           │    Mode     │
          └─────┬─────┘           └──────┬──────┘
                │                         │
                ▼                         ▼
        ┌──────────────┐         ┌──────────────┐
        │ CLI Parser   │         │ AI Intent    │
        │ (argparse)   │         │ Layer (LLM)  │
        └──────┬───────┘         └──────┬───────┘
               │                        │
               └────────────┬─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   Action     │
                    │  Resolver    │
                    │  (Dispatcher)│
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   CRUD       │
                    │  Functions   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  In-Memory   │
                    │    Store     │
                    └──────────────┘
```

### Key Invariants

1. **Feature Parity**: Any operation available in CLI mode MUST be available in AI mode
2. **Deterministic Manual Mode**: CLI commands produce identical outputs for identical inputs (no AI variability)
3. **AI Transparency**: Confirmation messages show exactly what CRUD function was executed
4. **Mode Isolation**: CLI layer does NOT import AI layer; AI layer does NOT import CRUD (only via Resolver)

---

## Evolution to Future Phases

### Phase II: Web Application

**Architecture Changes**:

```
Phase I (CLI) → Phase II (Web)
─────────────────────────────

┌─────────────┐                ┌──────────────────┐
│  CLI Layer  │         →      │  Web Layer       │
│  (replace)  │                │  (FastAPI/Flask) │
└─────────────┘                │  - REST API      │
                                │  - HTML/JS UI    │
                                └────────┬─────────┘
                                         │
                                         ▼
                              [AI Layer, Resolver, CRUD, Storage]
                              ──────────────────────────────────
                              (UNCHANGED - direct reuse)
```

**What Changes**:
- **Replace**: CLI Layer → Web Layer (HTTP endpoints, web UI)
- **Add**: Persistence layer (replace in-memory with database)
- **Reuse**: AI Intent Layer, Action Resolver, CRUD Core (100% code reuse)

**API Endpoints** (new):
```
POST   /api/tasks          → create_task()
GET    /api/tasks          → list_tasks()
PUT    /api/tasks/{id}     → update_task()
DELETE /api/tasks/{id}     → delete_task()
POST   /api/tasks/{id}/complete → complete_task()
GET    /api/tasks/summary  → summarize_tasks()
```

**Data Migration**:
```
In-Memory Store → Database (SQLite or PostgreSQL)
- Task model remains identical
- Add persistence to CRUD functions (via repository pattern)
- CRUD function signatures UNCHANGED
```

---

### Phase III: Chatbot

**Architecture Changes**:

```
Phase II (Web) → Phase III (Chatbot)
────────────────────────────────────

┌─────────────┐                ┌──────────────────┐
│  Web Layer  │         →      │  Chatbot Layer   │
│  (keep)     │                │  (Discord/Slack/ │
└─────────────┘                │   Telegram)      │
                                └────────┬─────────┘
                                         │
                                         ▼
                              [AI Layer, Resolver, CRUD, Storage]
                              ──────────────────────────────────
                              (UNCHANGED - direct reuse)
```

**What Changes**:
- **Add**: Chatbot Platform Integration (Discord bot, Slack bot, etc.)
- **Reuse**: AI Intent Layer (already has NLP), Action Resolver, CRUD Core, Persistence

**Chatbot Message Flow**:
```
User Message (Discord/Slack)
     │
     ▼
Chatbot Adapter (platform-specific event handler)
     │
     ▼
[AI Intent Layer → Resolver → CRUD] (reused)
     │
     ▼
Chatbot Response Formatter (platform-specific message formatting)
```

**Message Adaptation**:
- Discord: Embeds, slash commands
- Slack: Blocks, slash commands
- Telegram: Markdown, bot commands

---

## Cross-Phase Reusability

### Components That Never Change

| Component | Phase I | Phase II | Phase III |
|-----------|---------|----------|-----------|
| AI Intent Layer | ✅ | ✅ (reuse) | ✅ (reuse) |
| Action Resolver | ✅ | ✅ (reuse) | ✅ (reuse) |
| CRUD Functions | ✅ | ✅ (reuse) | ✅ (reuse) |
| Task Model | ✅ | ✅ (reuse) | ✅ (reuse) |
| **Storage Strategy** | In-memory | Database | Database |

### Components That Replace

| Phase I | Phase II | Phase III |
|---------|----------|-----------|
| CLI Layer | Web Layer | + Chatbot Layer |
| In-Memory Store | Database | Database |

---

## Complexity Tracking

> **No constitution violations - this section intentionally left blank.**

The proposed architecture fully complies with all six constitution principles. No complexity justification is required.

---

## Next Steps

1. **Phase 0**: Run research tasks to finalize technology decisions (LLM provider selection, environment setup)
2. **Phase 1**: Generate detailed data model, CRUD contracts, AI intent schema
3. **Phase 2**: Run `/sp.tasks` to generate actionable implementation tasks
4. **Implementation**: Run `/sp.implement` to begin coding (after spec and plan approval)

---

**Generated**: 2025-12-29 | **Status**: Draft | **Ready for Review**

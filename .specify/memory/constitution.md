<!--
========================================================================
SYNC IMPACT REPORT
========================================================================
Version Change: INITIAL → 1.0.0
Rationale: Initial constitution establishment for AI-First Personal Productivity Assistant (CLI MVP)

Modified Principles:
  N/A (initial version)

Added Sections:
  - Core Principles (6 principles defined)
  - Technology Constraints
  - Development Workflow
  - Governance

Removed Sections:
  N/A (initial version)

Templates Status:
  ✅ plan-template.md    - Reviewed, Constitution Check section compatible
  ✅ spec-template.md    - Reviewed, requirements alignment verified
  ✅ tasks-template.md   - Reviewed, task categorization compatible
  ✅ phr-template.prompt.md - Reviewed, structure compatible
  ⚠ agent-file-template.md - Not reviewed (not accessed)

Follow-up TODOs:
  None - all placeholders filled

========================================================================
-->

# AI-First Personal Productivity Assistant Constitution

## Core Principles

### I. Python 3.13+ Foundation

**Rule**: All code MUST use Python 3.13 or later. NO exceptions.

**Rationale**: Python 3.13 provides enhanced performance, improved type hinting, and modern syntax that supports clean, maintainable code. This is a hackathon project with aggressive timelines—leveraging the latest stable Python reduces technical debt and ensures access to modern tooling.

**Requirements**:
- Type hints MANDATORY on all function signatures
- Use modern Python patterns (match/case, structural pattern matching where applicable)
- No compatibility shims for older Python versions
- Leverage standard library over third-party packages wherever possible

---

### II. Explicit CRUD Functions (NON-NEGOTIABLE)

**Rule**: ALL data operations MUST exist as explicit, standalone CRUD functions. AI layer MUST ONLY decide WHICH function to call—NEVER generate operations inline.

**Rationale**: This separation ensures testability, debuggability, and extensibility. When the AI layer generates CRUD operations inline, we lose the ability to:
- Test CRUD logic independently
- Reason about data operations statically
- Extend to web/chatbot phases without rewriting core logic
- Debug data issues without tracing through AI-generated code paths

**Requirements**:
```python
# CORRECT: Explicit CRUD function
def create_task(title: str, description: str) -> Task:
    """Create a new task with validation."""
    # Implementation

# AI layer calls this function
AI: "The user wants to create a task" → calls create_task(...)

# INCORRECT: AI-generated CRUD
AI: generates task creation code inline in response
```

**Acceptance Criteria**:
- Every data operation has a corresponding function in `src/crud/` or `src/core/`
- AI layer imports and calls these functions—NEVER defines them
- CRUD functions have pure inputs/outputs (no side effects beyond data mutation)
- All CRUD functions are unit-testable without AI layer present

---

### III. Dual Mode Interaction

**Rule**: Application MUST support two interaction modes with EQUAL functionality:
1. **Manual CLI Mode**: Users invoke commands directly (e.g., `python main.py add task "Buy milk"`)
2. **AI Natural Language Mode**: Users type natural language, AI maps to CRUD functions

**Rationale**: Hackathon demo requires both modes:
- CLI mode proves the CRUD functions work and provides deterministic control
- AI mode demonstrates the "AI-First" value proposition
- Both modes share the SAME CRUD core—ensures feature parity and prevents divergence

**Requirements**:
- CLI commands MUST be 1:1 mappings to CRUD functions (e.g., `add task` → `create_task()`)
- AI mode MUST parse natural language and invoke the SAME CRUD functions
- Feature parity enforced: if CLI can do X, AI must be able to do X
- Output formatting MUST be consistent across both modes

**Architecture**:
```
User Input
   ├─ CLI Parser  ─────┐
   │                   │
   └─ AI Intent Layer ─┼──→ Action Resolver → CRUD Functions → In-Memory Store
                       │
                   (maps intent to
                    specific CRUD function)
```

---

### IV. In-Memory Storage Only (Phase I)

**Rule**: Phase I MUST use in-memory storage ONLY. NO files, NO databases, NO persistence.

**Rationale**:
- Hackathon MVP: Persistence is out of scope for Phase I
- Forces focus on core CRUD logic and AI interaction
- Eliminates I/O debugging overhead
- Enables fast restart/iteration during development
- Web and chatbot phases will add persistence

**Requirements**:
- Use Python data structures: `dict`, `list`, `set`
- Global state container in `src/storage/memory_store.py`
- NO `open()`, NO `sqlite3`, NO file I/O
- ALL data lost on application restart—this is INTENTIONAL

**Exception**: Logging and debugging output to stdout/stderr is permitted (this is not "data persistence").

---

### V. Clear Separation of Concerns

**Rule**: Code MUST be organized into four distinct layers with STRICT boundaries. NO cross-contamination.

**Layers**:

1. **CLI Layer** (`src/cli/`)
   - Parses command-line arguments
   - Formats output for terminal
   - NEVER contains business logic
   - NEVER touches AI

2. **AI Intent Layer** (`src/ai/`)
   - Parses natural language input
   - Classifies user intent (create, read, update, delete)
   - Extracts parameters (e.g., task title, description)
   - NEVER generates CRUD logic—ONLY maps to functions

3. **Action Resolver** (`src/resolver/`)
   - Maps AI-identified intent to specific CRUD function
   - Validates parameters match function signature
   - Handles ambiguous intents (e.g., "add" vs. "create")
   - Acts as the "router" between intent and execution

4. **CRUD Core** (`src/core/` or `src/crud/`)
   - Contains all data manipulation functions
   - Pure functions: input → output (no I/O except in-memory mutations)
   - NO awareness of CLI or AI layers
   - Testable in isolation

**Rationale**: This separation enables:
- Independent testing of each layer
- Future extension to web/chatbot without rewriting CRUD
- Clear debugging boundaries
- Team parallelization (different developers own different layers)

**Acceptance Criteria**:
- Import graph verified: CLI does NOT import AI; AI does NOT import CRUD (only imports via Resolver)
- Each layer can be unit-tested in isolation
- Replacing CLI with web framework requires ZERO changes to CRUD layer

---

### VI. Minimal Dependencies (Hackathon Speed)

**Rule**: Phase I MUST use ONLY Python standard library + ONE LLM SDK. NO other external dependencies.

**Rationale**:
- Reduce setup friction for hackathon demo
- Eliminate dependency hell during time-constrained development
- Forces creative use of standard library (better learning)
- Web phase will add frameworks; Phase I is intentionally bare-metal

**Allowed Dependencies**:
- Python 3.13+ standard library (FULL USE encouraged)
- ONE LLM SDK (e.g., OpenAI Python SDK, Anthropic SDK) for AI layer

**Prohibited Dependencies**:
- NO web frameworks (FastAPI, Flask, Django)
- NO ORMs (SQLAlchemy, Django ORM)
- NO CLI libraries (Click, Typer, argparse is standard lib—USE IT)
- NO testing frameworks (pytest, unittest is standard lib—USE IT)
- NO formatters/linters shipped with project (black, ruff—developers can use locally, but NOT required for project to run)

**Acceptance Criteria**:
- `requirements.txt` contains ONLY the LLM SDK
- Project runs with: `pip install -r requirements.txt` (ONE dependency)
- NO build step, NO compilation, NO complex setup

---

## Technology Constraints

### Language & Platform
- **Language**: Python 3.13+ (MANDATORY)
- **Platform**: Any OS with Python 3.13+ installed
- **Target Environment**: Local terminal / command prompt

### Storage Architecture
- **Phase I**: In-memory ONLY (see Principle IV)
- **Future Phases**: To be determined during Phase II (Web) and Phase III (Chatbot) planning

### External APIs
- **LLM API**: ONE LLM provider (OpenAI, Anthropic, or compatible) for AI Intent Layer
- **NO other external APIs** in Phase I

### Deployment
- **Phase I**: NO deployment—runs locally only
- **Future Phases**: Deployment strategies to be defined in later constitutions or ADRs

---

## Development Workflow

### Code Generation Policy (NON-NEGOTIABLE)
**NO code generation until specification is approved.**

**Rationale**: This project follows Spec-Driven Development (SDD). Writing code before specs are approved violates the core workflow and leads to:
- Wasted effort building the wrong thing
- Misaligned expectations
- Untraceable requirements
- Impossible-to-verify completion

**Workflow**:
1. User provides feature description → `/sp.specify` generates spec
2. Review and approve spec → `/sp.plan` generates architecture plan
3. Review and approve plan → `/sp.tasks` generates task list
4. ONLY THEN can implementation begin with `/sp.implement`

**Enforcement**:
- Any code written before spec approval MUST be deleted and rewritten
- Constitution violations result in immediate revert

### Testing Strategy
- **Unit Tests**: Test CRUD functions in isolation (using `unittest` from standard library)
- **Integration Tests**: Test end-to-end CLI and AI modes (if time permits—NOT mandatory for hackathon MVP)
- **Manual Testing**: PRIMARY testing method for hackathon demo—run CLI commands and AI prompts manually

**Minimum Testing Bar**:
- CRUD functions MUST have at least one happy-path unit test
- AI layer MAY be tested manually (LLM calls are slow/expensive—unit tests not mandatory)

### Git & Commit Discipline
- **Commit Frequency**: After each logical task completion (not necessarily after every line)
- **Commit Messages**: Use conventional commits format: `type: description`
  - Types: `feat` (new feature), `fix` (bug fix), `refactor` (restructure, no behavior change), `docs` (documentation), `test` (tests)
- **NO commits to master during implementation**: Use feature branches
- **PR Review**: For team collaboration—single developer can skip PRs for hackathon speed

---

## Governance

### Amendment Procedure
1. **Proposal**: Document proposed change with rationale in ADR (Architecture Decision Record)
2. **Review**: Team discusses impact on existing code and workflow
3. **Approval**: Requires consensus OR "benevolent dictator" approval (for hackathon speed)
4. **Migration Plan**: If amendment requires code changes, create migration tasks in `tasks.md`
5. **Update Constitution**: Increment version, add Sync Impact Report at top

### Versioning Policy
- **MAJOR**: Backward-incompatible changes (e.g., removing a principle, breaking a core rule)
- **MINOR**: New principles added, or existing principles materially expanded
- **PATCH**: Clarifications, wording improvements, typo fixes (no semantic change)

### Compliance Review
- **Before every commit**: Mental check—does this violate constitution?
- **Before every feature**: Review spec/plan against constitution principles
- **After major changes**: Re-read constitution to ensure no drift

### Complexity Justification
- **Default**: Keep it simple—constitution principles are defaults, not suggestions
- **Violations**: If a principle MUST be violated, document in ADR with:
  - What principle is being violated
  - Why it's necessary (specific problem)
  - Simpler alternative considered and why it was rejected
  - Plan to revert to constitutional compliance when possible

---

**Version**: 1.0.0 | **Ratified**: 2025-12-29 | **Last Amended**: 2025-12-29

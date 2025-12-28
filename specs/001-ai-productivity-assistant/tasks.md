# Tasks: AI-First Personal Productivity Assistant (CLI MVP)

**Input**: Design documents from `/specs/001-ai-productivity-assistant/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit tests included for CRUD functions (per constitution requirement)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, etc.)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure per implementation plan (src/, tests/, requirements.txt)
- [X] T002 Create requirements.txt with openai>=1.0.0 dependency
- [X] T003 [P] Create __init__.py files in all package directories (src/, src/cli/, src/ai/, src/resolver/, src/core/, src/storage/, src/config/, tests/, tests/unit/, tests/integration/)
- [X] T004 Create main.py entry point at repository root
- [X] T005 Create placeholder README.md with project description

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement Task dataclass model in src/storage/models.py with fields: id, title, description, status, priority
- [X] T007 Implement TaskSummary dataclass model in src/storage/models.py with aggregation fields
- [X] T008 Implement Intent enum in src/ai/intent_parser.py with values: CREATE, READ, UPDATE, DELETE, COMPLETE, SUMMARIZE
- [X] T009 Implement in-memory task store in src/storage/memory_store.py with global _tasks dict and _next_id counter
- [X] T010 Implement generate_id() function in src/storage/memory_store.py returning "task-N" format
- [X] T011 Implement get_store() function in src/storage/memory_store.py returning MemoryStore instance
- [X] T012 [P] Implement environment configuration in src/config/settings.py for AI_API_KEY loading
- [X] T013 [P] Create constants file in src/config/constants.py for default values (default_priority="medium", default_status="pending")

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Manual Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can manually create, read, update, delete, and complete tasks using explicit CLI commands

**Independent Test**: Execute manual commands (create-task, list-tasks, update-task, delete-task, complete-task) and verify database state changes

**Specification**: spec.md User Story 1, contracts/crud.md

### Tests for User Story 1

- [X] T014 [P] [US1] Unit test for create_task() happy path in tests/unit/test_task_crud.py
- [X] T015 [P] [US1] Unit test for create_task() validation errors (empty title, title too long) in tests/unit/test_task_crud.py
- [X] T016 [P] [US1] Unit test for list_tasks() in tests/unit/test_task_crud.py
- [X] T017 [P] [US1] Unit test for update_task() happy path in tests/unit/test_task_crud.py
- [X] T018 [P] [US1] Unit test for update_task() task not found error in tests/unit/test_task_crud.py
- [X] T019 [P] [US1] Unit test for delete_task() in tests/unit/test_task_crud.py
- [X] T020 [P] [US1] Unit test for complete_task() in tests/unit/test_task_crud.py

### Implementation for User Story 1

- [X] T021 [US1] Implement create_task() function in src/core/task_crud.py with validation per contracts/crud.md
- [X] T022 [US1] Implement list_tasks() function in src/core/task_crud.py per contracts/crud.md
- [X] T023 [US1] Implement update_task() function in src/core/task_crud.py per contracts/crud.md
- [X] T024 [US1] Implement delete_task() function in src/core/task_crud.py per contracts/crud.md
- [X] T025 [US1] Implement complete_task() function in src/core/task_crud.py per contracts/crud.md
- [X] T026 [P] [US1] Implement CLI parser in src/cli/parser.py with argparse setup and subcommands: create-task, list-tasks, update-task, delete-task, complete-task
- [X] T027 [P] [US1] Implement output formatter in src/cli/formatter.py with format_task_list(), format_confirmation(), format_error()
- [X] T028 [US1] Implement mode switching logic in src/cli/parser.py with --ai, --manual, --verbose flags
- [X] T029 [US1] Implement CLI prompt display showing current mode (ai-mode or manual-mode)
- [X] T030 [US1] Implement CLI entry point in src/cli/main.py integrating parser, resolver, and formatter
- [X] T031 [US1] Wire manual CLI commands to Action Resolver in src/resolver/dispatcher.py
- [X] T032 [US1] Implement Action Resolver dispatch() function in src/resolver/dispatcher.py mapping CLI commands to CRUD functions
- [X] T033 [US1] Add error handling in src/cli/main.py catching ValueError and displaying formatted errors

**Checkpoint**: At this point, User Story 1 should be fully functional - test all manual CRUD commands

---

## Phase 4: User Story 2 - AI-Powered Natural Language Interaction (Priority: P1)

**Goal**: Users can manage tasks using natural language commands without memorizing CLI syntax

**Independent Test**: Issue natural language inputs and verify correct CRUD operations are executed

**Specification**: spec.md User Story 2, contracts/ai_intent.md

### Implementation for User Story 2

- [X] T034 [P] [US2] Implement OpenAI client wrapper in src/ai/client.py with API key loading from environment
- [X] T035 [P] [US2] Implement LLM system prompt in src/ai/prompts.py per contracts/ai_intent.md
- [X] T036 [US2] Implement classify_intent() function in src/ai/intent_parser.py calling LLM with JSON mode
- [X] T037 [US2] Implement extract_entities() function in src/ai/entity_extractor.py validating and normalizing extracted entities
- [X] T038 [US2] Implement confidence threshold handling in src/ai/intent_parser.py (<0.7 triggers clarification)
- [X] T039 [US2] Implement AI mode entry point in src/ai/main.py reading user input and calling intent parser
- [X] T040 [US2] Update Action Resolver dispatch() function to handle Intent enum values from AI layer
- [X] T041 [US2] Implement validate_params() function in src/resolver/dispatcher.py checking required entities per intent
- [X] T042 [US2] Implement handle_ambiguity() function in src/resolver/dispatcher.py asking user for clarification
- [X] T043 [US2] Integrate AI mode with main.py routing natural language input through AI layer
- [X] T044 [US2] Add error handling for AI failures (timeout, rate limit) falling back to manual mode with error message per FR-033

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - test natural language task management

---

## Phase 5: User Story 3 - AI Confirmation and Feedback (Priority: P1)

**Goal**: Users receive clear confirmations from AI after each action to build trust

**Independent Test**: Execute AI commands and verify confirmation messages appear with correct task details

**Specification**: spec.md User Story 3

### Implementation for User Story 3

- [X] T045 [P] [US3] Implement AI confirmation formatter in src/cli/formatter.py with emoji indicators (✅, ❌)
- [X] T046 [US3] Update format_confirmation() to include action description: "Task '[title]' has been [action]."
- [X] T047 [US3] Implement verbose mode output in src/ai/main.py showing parsed intent, extracted entities, and CRUD function call
- [X] T048 [US3] Update AI response handling to display confirmation after each successful operation
- [X] T049 [US3] Implement ambiguity question formatter in src/cli/formatter.py displaying "Did you mean to [action A] or [action B]?"
- [X] T050 [US3] Add task list display for ambiguous queries showing available tasks with IDs

**Checkpoint**: AI confirmations working - all actions transparent to user

---

## Phase 6: User Story 4 - Task Summarization (Priority: P2)

**Goal**: Users can ask AI to summarize tasks to quickly understand workload and priorities

**Independent Test**: Create multiple tasks and request summary, verify concise overview generated

**Specification**: spec.md User Story 4, contracts/crud.md (summarize_tasks)

### Tests for User Story 4

- [X] T051 [P] [US4] Unit test for summarize_tasks() in tests/unit/test_summarize.py

### Implementation for User Story 4

- [X] T052 [US4] Implement summarize_tasks() function in src/core/summarize.py per contracts/crud.md
- [X] T053 [US4] Implement TaskSummary object generation with counts by status and priority groupings
- [X] T054 [US4] Add SUMMARIZE intent to AI Intent classification in src/ai/intent_parser.py
- [X] T055 [US4] Implement summary message formatter in src/cli/formatter.py displaying counts and high-priority pending tasks
- [X] T056 [US4] Handle empty task list in summarize_tasks() returning "You have no tasks. Would you like to create one?"
- [X] T057 [US4] Update Action Resolver to route SUMMARIZE intent to summarize_tasks() function

**Checkpoint**: Task summarization working - users get quick workload overview

---

## Phase 7: User Story 5 - Mode Switching (Priority: P2)

**Goal**: Users can switch between manual and AI mode to choose interaction style

**Independent Test**: Toggle between modes and execute both manual commands and natural language inputs

**Specification**: spec.md User Story 5

### Implementation for User Story 5

- [X] T058 [P] [US5] Implement mode persistence in src/storage/memory_store.py with current_mode variable (default="ai")
- [X] T059 [US5] Implement --manual flag handling in src/cli/parser.py switching current_mode and updating prompt
- [X] T060 [US5] Implement --ai flag handling in src/cli/parser.py switching current_mode and updating prompt
- [X] T061 [US5] Implement mode-aware command routing in main.py checking current_mode before processing input
- [X] T062 [US5] Add mode confirmation messages: "Switched to manual mode" and "Switched to AI mode"
- [X] T063 [US5] Update CLI prompt display to show (ai-mode) $ or (manual-mode) $ based on current_mode
- [X] T064 [US5] Implement mode-specific help text showing available commands for current mode

**Checkpoint**: Mode switching working - seamless transition between CLI and AI interaction

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T065 [P] Add validation for empty task titles in create_task() raising ValueError per FR-029
- [X] T066 [P] Add validation for task title length (200 char max) in create_task() per FR-007
- [X] T067 [P] Add validation for description length (1000 char max) in update_task() per FR-008
- [X] T068 [P] Add validation for task ID existence in update_task(), delete_task(), complete_task() per FR-030
- [X] T069 [P] Implement graceful degradation when AI_API_KEY not set in src/ai/client.py
- [X] T070 [P] Implement API timeout handling in src/ai/client.py with fallback error message
- [X] T071 [P] Add help command implementation in src/cli/parser.py displaying all available commands
- [X] T072 [P] Update README.md with setup instructions from quickstart.md
- [X] T073 [P] Add example commands to README.md demonstrating both manual and AI modes
- [X] T074 [P] Add troubleshooting section to README.md covering common errors
- [X] T075 [P] Run all unit tests and verify they pass
- [X] T076 [P] Manual testing: Execute demo script from quickstart.md and verify all commands work
- [X] T077 [P] Manual testing: Test AI mode with various phrasings (add, create, show, list, mark complete, delete)
- [X] T078 [P] Manual testing: Test mode switching and verify prompt updates correctly
- [X] T079 [P] Manual testing: Test error handling (empty title, non-existent task ID, missing API key)
- [X] T080 [P] Verify quickstart.md instructions work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - US1, US2, US3 are P1 (highest priority - implement first)
  - US4, US5 are P2 (implement after P1 stories)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Extends US1 but independently testable
- **User Story 3 (P1)**: Can start after US2 complete - Enhances AI mode with confirmations
- **User Story 4 (P2)**: Can start after Foundational - Independent feature (summarization)
- **User Story 5 (P2)**: Can start after US2 complete - Enhances mode switching

### Critical Path for MVP

1. **Setup (T001-T005)**: Project structure
2. **Foundational (T006-T013)**: Models, store, config
3. **US1 Tests (T014-T020)**: Unit tests for CRUD
4. **US1 Implementation (T021-T033)**: Manual CRUD + CLI
5. **STOP HERE FOR MVP** - Manual mode fully functional

### Full Product Path

6. **US2 Implementation (T034-T044)**: AI natural language mode
7. **US3 Implementation (T045-T050)**: AI confirmations
8. **US4 Tests + Implementation (T051-T057)**: Summarization
9. **US5 Implementation (T058-T064)**: Mode switching
10. **Polish (T065-T080)**: Validation, error handling, documentation

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach for CRUD)
- Models before services
- Services before endpoints/features
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase (T001-T005)**:
- T003 can run parallel (all __init__.py files)

**Foundational Phase (T006-T013)**:
- T012, T013 can run in parallel (config files independent)

**User Story 1 Tests**:
- T014-T020 can all run in parallel (separate test functions)

**User Story 1 Implementation**:
- T026, T027 can run in parallel (parser and formatter independent)
- T021-T025 must be sequential (CRUD functions have dependencies)

**User Story 2 Implementation**:
- T034, T035 can run in parallel (client and prompts independent)

**User Story 3 Implementation**:
- T045, T049 can run in parallel (formatters independent)

**User Story 4**:
- T051 test before T052 implementation

**Polish Phase**:
- T065-T074 can all run in parallel (validation and docs independent)
- T075-T080 can run in parallel (different test scenarios)

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for create_task() happy path in tests/unit/test_task_crud.py"
Task: "Unit test for create_task() validation errors in tests/unit/test_task_crud.py"
Task: "Unit test for list_tasks() in tests/unit/test_task_crud.py"
Task: "Unit test for update_task() in tests/unit/test_task_crud.py"
Task: "Unit test for update_task() task not found error in tests/unit/test_task_crud.py"
Task: "Unit test for delete_task() in tests/unit/test_task_crud.py"
Task: "Unit test for complete_task() in tests/unit/test_task_crud.py"

# After tests, launch parser and formatter in parallel:
Task: "Implement CLI parser in src/cli/parser.py"
Task: "Implement output formatter in src/cli/formatter.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T013) - CRITICAL
3. Complete Phase 3: User Story 1 (T014-T033)
4. **STOP and VALIDATE**: Test all manual CRUD commands independently
5. Demo if ready - manual mode fully functional

### Incremental Delivery (Recommended)

1. **Setup + Foundational** → Foundation ready (T001-T013)
2. **Add User Story 1** → Test independently → Manual CRUD works (T014-T033)
3. **Add User Story 2** → Test independently → AI mode works (T034-T044)
4. **Add User Story 3** → Test independently → Confirmations working (T045-T050)
5. **Add User Story 4** → Test independently → Summarization works (T051-T057)
6. **Add User Story 5** → Test independently → Mode switching works (T058-T064)
7. **Polish** → Production ready (T065-T080)

Each phase adds value without breaking previous functionality.

### Hackathon Timeline Strategy

**Day 1 - Morning**:
- Setup (T001-T005): 30 min
- Foundational (T006-T013): 2 hours

**Day 1 - Afternoon**:
- US1 Tests (T014-T020): 1 hour
- US1 Implementation (T021-T033): 4 hours
- **Checkpoint**: Manual mode working

**Day 2 - Morning**:
- US2 Implementation (T034-T044): 3 hours
- US3 Implementation (T045-T050): 2 hours
- **Checkpoint**: AI mode working with confirmations

**Day 2 - Afternoon**:
- US4 Implementation (T051-T057): 2 hours
- US5 Implementation (T058-T064): 1 hour
- Polish (T065-T080): 2 hours
- **Checkpoint**: Full MVP ready for demo

---

## Notes

- [P] tasks = different files, no dependencies
- [US#] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD for CRUD functions)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution compliance: All CRUD functions have explicit unit tests (T014-T020, T051)
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

**Total Tasks**: 80
- Setup: 5 tasks
- Foundational: 8 tasks
- User Story 1: 20 tasks (7 tests + 13 implementation)
- User Story 2: 11 tasks
- User Story 3: 6 tasks
- User Story 4: 7 tasks (1 test + 6 implementation)
- User Story 5: 7 tasks
- Polish: 16 tasks

**MVP Tasks (Phases 1-3)**: 33 tasks
**Full Product (All Phases)**: 80 tasks

**Suggested MVP Scope**: Phases 1-3 (Setup + Foundational + User Story 1) = Manual CRUD mode

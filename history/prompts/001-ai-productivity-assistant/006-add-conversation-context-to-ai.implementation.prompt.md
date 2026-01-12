---
id: 006
title: Add conversation context to AI responses
stage: implementation
date: 2026-01-12
surface: agent
model: glm-4.6
feature: 001-ai-productivity-assistant
branch: 001-ai-productivity-assistant
user: nshafeys0
command: add conversation context to ai responses
labels: [ai,conversation-context,nlp,chat-history]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - src/ai/intent_parser.py
  - src/backend/api/routes/ai.py
  - src/backend/core/repository.py (ChatRepository.get_conversation_history)
tests:
  - Manual test: Created task "test context feature"
  - Manual test: Referenced with "mark it complete" - AI correctly identified task
  - Manual test: Referenced with "change its priority to high" - AI correctly updated priority
---

## Prompt

add conversation context to ai responses

## Response snapshot

Implemented conversation context feature by:

1. Updated `src/ai/intent_parser.py`:
   - Added `conversation_history` parameter to `classify_intent()`
   - Created `_format_conversation_history()` to format previous messages
   - Modified system prompt building to include conversation context

2. Updated `src/backend/api/routes/ai.py`:
   - Modified `/chat` endpoint to fetch history using `chat_repo.get_conversation_history(hours=24, limit=10)`
   - Applied same changes to `/chat/stream` endpoint
   - Both endpoints now pass conversation history to intent parser

3. Deployed to Hugging Face space:
   - Updated `/tmp/ai-productivity-assistant/src/ai/intent_parser.py`
   - Updated `/tmp/ai-productivity-assistant/src/backend/api/routes/ai.py`
   - Committed and pushed changes

4. Tested successfully:
   - Created task "test context feature" (ID: 23)
   - AI understood "mark it complete" - correctly marked task 23 as complete
   - AI understood "change its priority to high" - correctly updated task 23 priority

## Outcome

- ✅ Impact: AI now maintains conversation context and understands pronouns like "it", "that task", "its"
- 🧪 Tests: Manual testing confirmed AI correctly resolves references to previous tasks
- 📁 Files: Modified intent_parser.py and ai.py routes; deployed to production
- 🔁 Next prompts: Consider adding entity disambiguation for multiple tasks
- 🧠 Reflection: Simple context window (last 10 messages) works well for this use case

## Evaluation notes (flywheel)

- Failure modes observed: None during testing
- Graders run and results (PASS/FAIL): PASS - all three test cases succeeded
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Could test with larger context windows for longer conversations

# AI Conversation Specification

## ADDED Requirements

### Requirement: Generate initial interview question
The system SHALL generate a contextually relevant opening question based on the user's selected role and stack. This question SHALL be generated in the background immediately after session creation (non-blocking) and sent when ready.

#### Scenario: First question pre-generated after session_ready
- **WHEN** session is created and `session_ready` is sent to client
- **THEN** backend starts generating first question in background (non-blocking)
- **WHEN** question generation completes (within timeout of 2s)
- **THEN** backend sends `tts_audio` message with the generated question
- **WHEN** generation times out (> 2s)
- **THEN** backend sends generic fallback question

---

### Requirement: Generate follow-up questions in context
The system SHALL generate natural follow-up questions that:
- Acknowledge the user's previous answer
- Probe deeper into technical understanding
- Stay within the scope of 2-3 total questions for a 5-minute session

#### Scenario: AI responds to user's first answer
- **WHEN** backend detects end-of-utterance from Deepgram
- **THEN** backend sends conversation history (user's answer) + role + stack to GPT-4o-mini
- **THEN** GPT-4o-mini generates contextual follow-up question
- **THEN** backend converts question to TTS and sends `tts_audio` to client

---

### Requirement: Maintain conversational flow
The system SHALL alternate between user and AI turns naturally, waiting for complete utterances before responding.

#### Scenario: Multi-turn conversation
- **WHEN** user speaks (utterance_end detected)
- **THEN** backend records answer in conversation[]
- **THEN** backend generates AI response and sends TTS
- **WHEN** user speaks again
- **THEN** backend records new answer and generates follow-up
- **THEN** process repeats until timer=0 or user ends session

---

### Requirement: Use role and stack for question relevance
The system SHALL pass role and stack to GPT-4o-mini in every prompt to ensure questions match the user's domain and tech choices.

#### Scenario: Backend engineer with Node.js stack
- **WHEN** user selects role="Backend Engineer" and stack=["Node.js", "PostgreSQL"]
- **THEN** questions generated are relevant to backend architecture, databases, scalability (not frontend)

#### Scenario: Frontend engineer with React stack
- **WHEN** user selects role="Frontend Engineer" and stack=["React", "TypeScript"]
- **THEN** questions generated are relevant to component design, state management, performance (not backend infrastructure)

---

### Requirement: Respect language preference in responses
The system SHALL generate all conversation responses in the user's selected language.

#### Scenario: Spanish conversation
- **WHEN** user selected language="es"
- **THEN** all AI responses are in Spanish
- **THEN** all questions and follow-ups are in Spanish

---

### Requirement: Handle LLM failures with retries
The system SHALL attempt to recover from LLM errors by retrying once with exponential backoff.

#### Scenario: GPT-4o-mini generation fails
- **WHEN** OpenAI API returns an error (rate limit, temporary outage)
- **THEN** backend retries once after 1s delay
- **THEN** if retry succeeds, session continues
- **THEN** if retry fails, backend sends `error` message with code `LLM_ERROR` and `fatal: true`

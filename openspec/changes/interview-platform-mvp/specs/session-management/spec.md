# Session Management Specification

## ADDED Requirements

### Requirement: Create ephemeral interview session
The system SHALL create an ephemeral interview session in RAM when a client connects via WebSocket after passing rate-limit checks. Each session SHALL have a unique session ID, configuration (role, stack, language), and a 5-minute timer.

#### Scenario: Session creation on valid connection
- **WHEN** client opens WebSocket and passes rate limit check
- **THEN** backend creates a Session object in RAM with session_id, role, stack, language, and started_at timestamp
- **THEN** backend sends `session_ready` message to client with session_id and duration_seconds (300)

#### Scenario: Session creation blocked by rate limit
- **WHEN** client IP has opened a session in the past hour
- **THEN** backend rejects WebSocket with code 1008 and message "Rate limited: 1 session/hour"

---

### Requirement: Initialize conversation state
The system SHALL initialize conversation tracking (empty transcript, 0 questions asked, user turn state) when session starts.

#### Scenario: Conversation initialized
- **WHEN** session is created
- **THEN** backend initializes empty `conversation: []` list and `current_turn: "idle"`

---

### Requirement: Track session state during lifetime
The system SHALL track session state including: current speaker (user/ai/idle), last audio timestamp (for silence detection), questions asked, and conversation transcript.

#### Scenario: User starts speaking
- **WHEN** backend receives first `audio_chunk` after silence
- **THEN** backend sets `current_turn: "user"` and updates `last_audio_timestamp`

#### Scenario: AI starts speaking
- **WHEN** backend finishes generating LLM response and sends TTS audio
- **THEN** backend sets `current_turn: "ai"`

---

### Requirement: Enforce 5-minute session timeout
The system SHALL enforce a 5-minute maximum session duration. When timer reaches 0, the session SHALL end and generate a final report.

#### Scenario: Timer reaches 0
- **WHEN** 300 seconds have elapsed since session_ready
- **THEN** backend stops accepting audio, generates final report, sends `session_end` message
- **THEN** backend sends `report` message with feedback and recommendations
- **THEN** client downloads report file

#### Scenario: Timer reaches 60 seconds remaining
- **WHEN** 240 seconds have elapsed (60 seconds remaining)
- **THEN** backend changes timer color/style in UI to indicate urgency (implementation detail, frontend-driven)

---

### Requirement: Clean up session on disconnect
The system SHALL remove session from RAM and clean up all resources when WebSocket closes.

#### Scenario: Client closes WebSocket
- **WHEN** WebSocket connection closes (client-initiated or network error)
- **THEN** backend removes Session object from active sessions dict
- **THEN** backend releases all resources (Deepgram connection, timers)
- **THEN** if session had conversation data, final report is generated (for logging/debugging, not sent to client)

---

### Requirement: Generate report from conversation
The system SHALL generate a structured feedback report containing technical clarity, depth, and communication feedback plus 2-3 recommendations based on the conversation transcript.

#### Scenario: Report generation at session end
- **WHEN** session ends (timer=0 or user action)
- **THEN** backend collects conversation transcript from RAM
- **THEN** backend sends conversation + role + stack to GPT-4o with report prompt
- **THEN** backend receives JSON response with feedback and recommendations
- **THEN** backend sends `report` message to client with filename

#### Scenario: Report download
- **WHEN** client receives `report` message
- **THEN** client downloads file as `reporte_entrevista_<timestamp>.txt` with formatted report text

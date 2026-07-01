# Speech-to-Text Specification

## ADDED Requirements

### Requirement: Stream audio from client and transcribe
The system SHALL accept audio chunks from the client and stream them to Deepgram for real-time transcription. Audio SHALL be in PCM 16kHz mono format, sent every 250ms.

#### Scenario: Receive audio chunk and send to Deepgram
- **WHEN** client sends `audio_chunk` message with byte payload
- **THEN** backend forwards audio to active Deepgram connection
- **THEN** backend updates `last_audio_timestamp` to track silence

#### Scenario: Receive transcription from Deepgram
- **WHEN** Deepgram streams back partial transcription
- **THEN** backend sends `transcript_partial` message to client with current text (for UI display)

---

### Requirement: Detect end of user utterance
The system SHALL detect when the user finishes speaking using Deepgram's native VAD (voice activity detection) with utterance_end event.

#### Scenario: Utterance end detected
- **WHEN** Deepgram sends utterance_end event
- **THEN** backend saves final transcription to conversation[]
- **THEN** backend sets `current_turn: "idle"` and triggers LLM response generation

---

### Requirement: Support user-selected language
The system SHALL pass the user's selected language (from form) to Deepgram for correct STT model.

#### Scenario: Spanish language selected
- **WHEN** user selects "es" in the form and opens WebSocket
- **THEN** backend configures Deepgram with `language: "es"`
- **THEN** backend transcriptions are in Spanish

#### Scenario: English language selected
- **WHEN** user selects "en" in the form and opens WebSocket
- **THEN** backend configures Deepgram with `language: "en"`
- **THEN** backend transcriptions are in English

---

### Requirement: Handle STT failures gracefully
The system SHALL attempt to reconnect if Deepgram disconnects during a session, and send error message if reconnect fails.

#### Scenario: Deepgram connection lost during session
- **WHEN** Deepgram connection closes unexpectedly
- **THEN** backend attempts 1 reconnection with 2s timeout
- **THEN** if reconnect succeeds, session continues
- **THEN** if reconnect fails, backend sends `error` message with code `STT_DISCONNECTED` and `fatal: true`

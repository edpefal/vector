# Text-to-Speech Specification

## ADDED Requirements

### Requirement: Convert generated questions to audio
The system SHALL convert AI-generated interview questions to natural-sounding audio using OpenAI TTS with voice `alloy`, then send to client for playback.

#### Scenario: Question converted to audio
- **WHEN** backend generates an interview question (text)
- **THEN** backend sends text to OpenAI TTS API
- **THEN** OpenAI returns MP3 audio
- **THEN** backend encodes audio as base64 and sends `tts_audio` message to client

#### Scenario: Client receives and plays audio
- **WHEN** client receives `tts_audio` message
- **THEN** client decodes base64 audio
- **THEN** client plays audio through speaker/headphones
- **THEN** user hears the interviewer asking the question

---

### Requirement: Support streaming for low latency
The system SHALL not wait for full TTS response; instead, send audio chunks as they arrive for streaming playback.

#### Scenario: Streaming audio playback
- **WHEN** TTS generates audio in chunks
- **THEN** backend sends first chunk immediately (is_final: false)
- **THEN** client begins playback while subsequent chunks arrive
- **THEN** final chunk is marked is_final: true

---

### Requirement: Fall back to text if TTS fails
The system SHALL send the question as text (text_fallback) if TTS fails, allowing the interview to continue.

#### Scenario: TTS API unavailable
- **WHEN** OpenAI TTS API fails or times out
- **THEN** backend sends `text_fallback` message with the question as plain text
- **THEN** client displays text on screen for user to read
- **THEN** user can still respond verbally

#### Scenario: User proceeds with text fallback
- **WHEN** user sees text_fallback and reads the question
- **THEN** user speaks their answer
- **THEN** silence detection timeout is extended from 30s to 60s (user needs extra time to read)
- **THEN** user can continue the interview normally

---

### Requirement: Ensure voice naturalness and language match
The system SHALL use voice parameters appropriate to the selected language and maintain consistency.

#### Scenario: Spanish language audio
- **WHEN** user selected language="es"
- **THEN** TTS generates Spanish audio with voice `alloy`

#### Scenario: English language audio
- **WHEN** user selected language="en"
- **THEN** TTS generates English audio with voice `alloy`

---

### Requirement: Respect latency targets
The system SHALL generate TTS responses in < 500ms to meet overall 2s latency target.

#### Scenario: TTS latency within budget
- **WHEN** backend sends text to TTS
- **THEN** TTS responds within 500ms
- **THEN** combined STT (~300ms) + LLM (~600ms) + TTS (~500ms) = ~1.4s total

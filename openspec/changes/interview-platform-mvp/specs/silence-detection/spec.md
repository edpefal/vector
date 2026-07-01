# Silence Detection Specification

## ADDED Requirements

### Requirement: Detect user inactivity (silence > 30 seconds)
The system SHALL monitor for periods of silence (no audio input) lasting more than 30 seconds. When this threshold is exceeded, the system SHALL send an automatic retomada (resumption prompt) to encourage the user to continue.

#### Scenario: 30 seconds of silence detected
- **WHEN** backend has not received audio_chunk events for 30 seconds
- **THEN** backend sends TTS audio: "¿Sigues ahí? Puedes continuar cuando estés listo." (or equivalent in selected language)
- **THEN** backend sets silence_warned = true
- **THEN** backend continues monitoring for further silence

#### Scenario: User resumes after retomada
- **WHEN** user receives retomada prompt and speaks
- **THEN** backend receives audio_chunk event
- **THEN** backend updates last_audio_timestamp and resets silence counter

---

### Requirement: End session if user remains silent > 90 seconds
The system SHALL end the session if the user remains silent for more than 90 seconds (total, not after retomada).

#### Scenario: Prolonged silence leads to session end
- **WHEN** backend has not received audio for 90 seconds
- **THEN** backend stops accepting audio and closes Deepgram connection
- **THEN** backend generates final report from whatever conversation data exists
- **THEN** backend sends `session_end` message with reason="inactivity"
- **THEN** backend sends `report` message with final report

---

### Requirement: Adjust silence thresholds if text fallback occurred
The system SHALL extend silence detection thresholds if a text_fallback (TTS failure) occurred, giving the user extra time to read and respond.

#### Scenario: Text fallback increases tolerance
- **WHEN** backend has sent text_fallback message for a question
- **THEN** backend sets silence_threshold_warning = 60 seconds (instead of 30)
- **THEN** backend sets silence_threshold_fatal = 150 seconds (instead of 90)
- **THEN** user has more time to read question and formulate response

#### Scenario: Extended threshold applies to that turn only
- **WHEN** user receives text_fallback and eventually speaks
- **THEN** backend processes response normally
- **WHEN** next question is asked (with or without TTS)
- **THEN** thresholds revert to 30s/90s if no further text_fallback

---

### Requirement: Track last audio timestamp
The system SHALL maintain a `last_audio_timestamp` in the session object and update it whenever an audio_chunk is received.

#### Scenario: Timestamp updated on audio
- **WHEN** backend receives audio_chunk from Deepgram
- **THEN** backend sets session.last_audio_timestamp = now()

#### Scenario: Silence timer calculated from timestamp
- **WHEN** backend runs silence check (every 1-2 seconds)
- **THEN** elapsed = now() - last_audio_timestamp
- **WHEN** elapsed > 30 and silence_warned == false
- **THEN** send retomada prompt

---

### Requirement: Respect language in silence prompts
The system SHALL deliver silence detection prompts (retomada, warnings) in the user's selected language.

#### Scenario: Spanish retomada prompt
- **WHEN** user selected language="es"
- **THEN** silence prompt is: "¿Sigues ahí? Puedes continuar cuando estés listo."

#### Scenario: English retomada prompt
- **WHEN** user selected language="en"
- **THEN** silence prompt is: "Are you still there? Feel free to continue whenever you're ready."

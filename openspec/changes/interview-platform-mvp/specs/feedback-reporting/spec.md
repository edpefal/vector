# Feedback Reporting Specification

## ADDED Requirements

### Requirement: Generate structured feedback report
The system SHALL generate a feedback report containing evaluation across three dimensions: technical clarity, depth, and communication. Each dimension SHALL have 2-3 sentences of qualitative feedback.

#### Scenario: Report generation at session end
- **WHEN** session timer reaches 0 or user clicks end_session
- **THEN** backend collects full conversation transcript
- **THEN** backend sends transcript + role + stack to GPT-4o with report prompt
- **THEN** GPT-4o generates JSON with three feedback sections and 2-3 recommendations
- **THEN** backend formats JSON into human-readable text report

#### Scenario: Report structure
- **WHEN** report is generated
- **THEN** report contains:
  - `feedback.technical_clarity`: Text feedback on clarity of technical explanations
  - `feedback.depth`: Text feedback on depth of knowledge demonstrated
  - `feedback.communication`: Text feedback on communication style and structure
  - `recommendations[]`: 2-3 actionable improvement suggestions

---

### Requirement: Base feedback on actual conversation
The system SHALL evaluate feedback only on content spoken during the session (conversation transcript), not on assumptions or generic statements.

#### Scenario: Feedback accuracy
- **WHEN** GPT-4o generates report
- **THEN** feedback references specific topics discussed in conversation
- **THEN** recommendations are tailored to the user's actual performance, not generic tips

---

### Requirement: Deliver report as downloadable text file
The system SHALL format the report as a human-readable text file and initiate automatic download on the client.

#### Scenario: Report download
- **WHEN** backend sends `report` message to client
- **THEN** report message includes `filename: "reporte_entrevista_2026-06-18_093045.txt"`
- **THEN** client automatically downloads file with that name
- **THEN** file contains formatted report text (not JSON)

#### Scenario: Report file format
- **WHEN** file is downloaded
- **THEN** file is plain text (.txt) with sections:
  ```
  === REPORTE DE ENTREVISTA TÉCNICA ===
  Rol: Backend Engineer
  Stack: Node.js, PostgreSQL
  Fecha: 2026-06-18 09:30:45
  
  === FEEDBACK ===
  Claridad Técnica: [text]
  Profundidad: [text]
  Comunicación: [text]
  
  === RECOMENDACIONES ===
  1. [recommendation 1]
  2. [recommendation 2]
  3. [recommendation 3]
  ```

---

### Requirement: Support feedback generation in user's language
The system SHALL generate report feedback in the user's selected language (Spanish, English, etc.).

#### Scenario: Spanish report
- **WHEN** user selected language="es"
- **THEN** report is generated in Spanish
- **THEN** all feedback and recommendations are in Spanish

#### Scenario: English report
- **WHEN** user selected language="en"
- **THEN** report is generated in English
- **THEN** all feedback and recommendations are in English

---

### Requirement: Include session metadata in report
The system SHALL include timestamp, role, stack, and duration in the report header for context.

#### Scenario: Report metadata
- **WHEN** report is generated
- **THEN** report header includes: role, stack, language, start timestamp, duration (5 minutes)

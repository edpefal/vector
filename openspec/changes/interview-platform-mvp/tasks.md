# Implementation Tasks

## 1. Project Setup

- [ ] 1.1 Create frontend directory structure (Next.js 14 with App Router)
- [ ] 1.2 Create backend directory structure (FastAPI with async handlers)
- [ ] 1.3 Initialize backend requirements.txt with: fastapi, uvicorn, python-multipart, deepgram-sdk, openai, python-dotenv
- [ ] 1.4 Initialize frontend package.json with: next, react, typescript
- [ ] 1.5 Create .env files (backend and frontend) with placeholders for API keys
- [ ] 1.6 Create backend/config.py with environment variable parsing

## 2. Backend Core Infrastructure

- [ ] 2.1 Implement FastAPI app initialization in backend/main.py
- [ ] 2.2 Implement CORS middleware (allow frontend origin from config)
- [ ] 2.3 Implement in-memory rate limiter in backend/rate_limiter.py (dict-based, 1 session/IP/hour)
- [ ] 2.4 Implement Session dataclass in backend/session.py with: session_id, role, stack, language, conversation[], current_turn, timer_task, last_audio_timestamp, silence_warned
- [ ] 2.5 Implement SessionManager in backend/session.py to manage active sessions dict
- [ ] 2.6 Implement WebSocket endpoint /ws in backend/main.py with rate limit check

## 3. Backend WebSocket Message Handling

- [ ] 3.1 Implement session_init message handler (parse role, stack, language; create session)
- [ ] 3.2 Implement audio_chunk message handler (forward to Deepgram, update last_audio_timestamp)
- [ ] 3.3 Implement end_session message handler (stop timers, generate report, clean up)
- [ ] 3.4 Implement mute/unmute handlers (pause/resume Deepgram)
- [ ] 3.5 Implement error handling and WebSocket disconnect cleanup

## 4. Backend STT Pipeline

- [ ] 4.1 Implement Deepgram client wrapper in backend/pipeline/stt.py (async streaming)
- [ ] 4.2 Implement language-based Deepgram model selection (VAD enabled, utterance_end events)
- [ ] 4.3 Implement partial transcription forwarding to client (transcript_partial messages)
- [ ] 4.4 Implement utterance_end detection and conversation saving
- [ ] 4.5 Implement Deepgram error handling and reconnection logic

## 5. Backend LLM Pipeline

- [ ] 5.1 Implement GPT-4o-mini client wrapper in backend/pipeline/llm.py (async)
- [ ] 5.2 Implement prompt templates in backend/prompts.py (system prompt + conversation history + role/stack context)
- [ ] 5.3 Implement first question generation (non-blocking, with 2s timeout + fallback)
- [ ] 5.4 Implement follow-up question generation in conversational context
- [ ] 5.5 Implement language-aware prompt injection (role/stack/language all passed)
- [ ] 5.6 Implement retry logic for LLM failures (1 retry with 1s backoff)

## 6. Backend TTS Pipeline

- [ ] 6.1 Implement OpenAI TTS client wrapper in backend/pipeline/tts.py (async)
- [ ] 6.2 Implement streaming audio response (base64 encoding, is_final flag)
- [ ] 6.3 Implement text_fallback handler (send question as text if TTS fails)
- [ ] 6.4 Implement language selection in TTS (Spanish/English voice)
- [ ] 6.5 Implement timeout handling for TTS calls

## 7. Backend Session Management and Timers

- [ ] 7.1 Implement 5-minute session timer (asyncio.Task) that ends session at 0
- [ ] 7.2 Implement silence monitor task (runs every 1-2s, checks last_audio_timestamp)
- [ ] 7.3 Implement 30s silence warning with retomada prompt (extended to 60s if text_fallback)
- [ ] 7.4 Implement 90s silence fatal condition (extended to 150s if text_fallback)
- [ ] 7.5 Implement timer color change at 60s remaining (trigger from backend to UI)

## 8. Backend Report Generation

- [ ] 8.1 Implement report generator in backend/reporter.py (call GPT-4o 200B with conversation)
- [ ] 8.2 Implement JSON parsing of GPT-4o report response
- [ ] 8.3 Implement text formatting: convert JSON report to human-readable .txt format
- [ ] 8.4 Implement report generation in user's language (Spanish/English)
- [ ] 8.5 Implement filename generation with timestamp (reporte_entrevista_YYYY-MM-DD_HHMMSS.txt)

## 9. Frontend Project Setup

- [ ] 9.1 Create Next.js app/page.tsx (form page: role, stack, language inputs)
- [ ] 9.2 Create Next.js app/call/page.tsx (call interface: timer, transcription, controls)
- [ ] 9.3 Create app/layout.tsx with global styling
- [ ] 9.4 Create components/ directory structure

## 10. Frontend Form and Validation

- [ ] 10.1 Implement form in app/page.tsx with role, stack (multi-select), language dropdowns
- [ ] 10.2 Implement form validation (role and stack required)
- [ ] 10.3 Implement microphone permission request (on form submit)
- [ ] 10.4 Implement permission denied error with browser-specific instructions (Chrome, Safari, Edge)
- [ ] 10.5 Implement navigation to /call after form submission

## 11. Frontend Audio Capture

- [ ] 11.1 Implement MediaRecorder in lib/audio.ts (PCM 16kHz mono, 250ms chunks)
- [ ] 11.2 Implement Web Audio API context (for playback of TTS audio)
- [ ] 11.3 Implement microphone permission handling (browser-specific)
- [ ] 11.4 Implement audio context resumption on user interaction (iOS requirement)
- [ ] 11.5 Implement mute/unmute button (pause recording, send mute message)

## 12. Frontend WebSocket Client

- [ ] 12.1 Implement WebSocket connection in lib/websocket.ts (ws:// + error handling)
- [ ] 12.2 Implement message parsing: handle session_ready, tts_audio, text_fallback, report, error
- [ ] 12.3 Implement session_init payload creation (role, stack, language from form state)
- [ ] 12.4 Implement audio_chunk sending (MediaRecorder → WebSocket binary)
- [ ] 12.5 Implement end_session handler (stop recording, close WebSocket, show report)

## 13. Frontend Call Page UI Components

- [ ] 13.1 Implement Timer component (5:00 countdown, change color at 60s)
- [ ] 13.2 Implement AudioVisualizer component (indicate "user talking" / "AI talking" / "idle")
- [ ] 13.3 Implement real-time transcription display (transcript_partial updates)
- [ ] 13.4 Implement control buttons: Mute/Unmute, End Session
- [ ] 13.5 Implement error banner (connection lost, retry button)
- [ ] 13.6 Implement text_fallback display (show question on screen if TTS fails)

## 14. Frontend Report Display and Download

- [ ] 14.1 Parse report JSON and format for display
- [ ] 14.2 Implement report display page (feedback sections + recommendations)
- [ ] 14.3 Implement auto-download trigger when report is received
- [ ] 14.4 Implement downloadFile utility (blob → file download)
- [ ] 14.5 Implement "Download Again" button (re-download same report)

## 15. Integration and Testing

- [ ] 15.1 Test WebSocket connection with valid rate limit (first session succeeds)
- [ ] 15.2 Test WebSocket rejection with rate limit (second session from same IP fails)
- [ ] 15.3 Test full 5-minute conversation flow (form → session_ready → questions → responses → report)
- [ ] 15.4 Test Deepgram STT accuracy (with Spanish/English audio samples)
- [ ] 15.5 Test LLM conversation quality (do questions make sense? Does GPT stay in role?)
- [ ] 15.6 Test TTS audio playback (audio plays smoothly without stuttering)
- [ ] 15.7 Test text_fallback flow (TTS failure → text question → user responds → continue)
- [ ] 15.8 Test silence detection (30s → retomada, 90s → end session)
- [ ] 15.9 Test report generation accuracy (feedback is contextual and useful)
- [ ] 15.10 Test report download (file downloads with correct format and filename)
- [ ] 15.11 Test microphone permission denied (shows correct browser instructions)
- [ ] 15.12 Test WebSocket disconnect handling (banner appears, reconnect option offered)

## 16. Deployment

- [ ] 16.1 Deploy backend to Railway (create Railway project, set env variables)
- [ ] 16.2 Deploy frontend to Vercel (set NEXT_PUBLIC_WS_URL to Railway endpoint)
- [ ] 16.3 Test end-to-end in staging (1 full 5-min session)
- [ ] 16.4 Run QA checklist from SOLUTION-SPEC.md section 13
- [ ] 16.5 Prepare demo script and test credentials

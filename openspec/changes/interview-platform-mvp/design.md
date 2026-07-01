## Context

Building an MVP interview simulator requires:
- Real-time bidirectional audio (user → STT, TTS → client)
- Sub-2s latency from user finishing speaking to interviewer responding
- Privacy by design (no audio recording or persistence)
- Minimal cost per session (~$0.07–0.20 USD)
- Support for multiple languages (Spanish MVP, English Phase 2)

Stack: Next.js 14 frontend + FastAPI backend. No authentication or database needed for MVP (ephemeral sessions only).

## Goals / Non-Goals

**Goals:**
- 5-minute audio-only interview simulation with 2-3 questions
- Real-time feedback with 3 dimensions: technical clarity, depth, communication
- < 2s latency from user finishing speaking to AI response
- Downloadable text report (no persistence)
- Rate limiting (1 session per IP per hour)
- Support for user-selected languages

**Non-Goals:**
- Persistent user sessions / authentication (Phase 2)
- Video or camera integration (Phase 2)
- Score calibration (needs >50 sessions of ground truth)
- Multi-user or peer evaluation
- Offline functionality

## Decisions

### 1. WebSockets vs. REST Polling
**Decision:** WebSocket for bidirectional real-time streaming

**Rationale:**
- Audio chunks must arrive 250ms continuously (REST polling too high latency)
- TTS responses need immediate playback (no request-response cycle delay)
- WebSocket is native in both Next.js and FastAPI

**Alternative rejected:** REST polling (100ms+ latency per request)

---

### 2. Rate Limiting: In-Memory vs. Redis
**Decision:** In-memory dict with IP keys (no Redis for MVP)

**Rationale:**
- POC volume: ~20 sessions in first week (low scale)
- Survives single-server deployments
- If server restarts, users can retry (acceptable for POC)

**Alternative rejected:** Redis adds infra complexity for low traffic

---

### 3. First Question Generation: Blocking vs. Non-Blocking
**Decision:** Non-blocking (Opción B): `session_ready` returns immediately (~50ms), question generates in background (~800ms)

**Rationale:**
- User perceives immediate session start (UI feedback)
- Pre-generation happens transparently
- Question audio arrives ~800ms later (within 2s target)

**Alternative rejected:** Blocking (wait for full question before sending session_ready causes 1s+ latency)

---

### 4. Report Persistence: Database vs. Downloadable File
**Decision:** Downloadable TXT file (no database for MVP)

**Rationale:**
- Ephemeral sessions; user downloads report immediately after session ends
- No auth needed (anon users don't need to "retrieve" reports)
- Simplifies backend (no Supabase, RLS policies, migration scripts)
- Cost: $0 for storage

**Alternative rejected:** Supabase persistence adds auth/BD complexity not needed for MVP

---

### 5. STT Service: Deepgram vs. Whisper
**Decision:** Deepgram Nova-2 with native VAD/endpointing

**Rationale:**
- Streaming: sends transcription in real-time (not batch)
- Native VAD: detects when user finishes speaking (no custom implementation)
- Latency: <300ms utterance detection
- Language support: 99+ languages

**Alternative rejected:** Whisper batch processing (300ms+ latency, no streaming)

---

### 6. LLM: GPT-4o-mini (conversation) + GPT-4o (reporte)
**Decision:** Two-tier approach

**Rationale:**
- **Conversation (GPT-4o-mini)**: 30× cheaper, sufficient for generating contextual interview questions
- **Reporte (GPT-4o)**: Deeper reasoning needed to evaluate multi-turn conversation

**Alternative rejected:** Single GPT-4o (costs 3× more; overkill for conversations)

---

### 7. Silence Detection: Deepgram VAD vs. Backend Timer
**Decision:** Backend timer monitoring Deepgram events

**Rationale:**
- Deepgram VAD detects utterance-end, not "silence duration"
- Backend tracks `last_audio_timestamp`; when > 30s/90s elapsed, trigger warnings/end
- Simpler than custom VAD logic

---

### 8. Authentication: None (Anon) vs. Supabase Auth
**Decision:** No authentication for MVP

**Rationale:**
- No need to track user progress (ephemeral sessions)
- Rate limiting by IP is sufficient
- Auth adds: login flow, DB, JWT validation—unnecessary friction
- Phase 2 can add auth for persistent history

---

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| **TTS fails mid-session** | Fall back to `text_fallback`: send question as text, extend silence timeout (60s instead of 30s) |
| **Deepgram disconnects** | Retry once with 2s timeout; if fails, send error fatal |
| **First question takes > 2s** | Timeout at 2s, send generic fallback question ("Tell me about your experience with [stack]") |
| **User silence for 30s** | Send retomada prompt automatically (non-fatal) |
| **Cost per session higher than estimated** | MVP estimates $0.07 (best case); realistic is $0.10–0.20. Rate limit to 1/IP/hour prevents runaway costs |
| **Backend restart loses sessions** | Ephemeral by design; user knows session is live-only |
| **Browser closes during session** | WebSocket disconnect triggers session-end in backend; reporte is generated from whatever was captured |

---

## Architecture Sketch

```
┌─────────────────────────────┐
│   Browser (Next.js)         │
│  ┌─────────────────────┐    │
│  │ Form: role+stack    │    │
│  │ Call: WebSocket +   │    │
│  │       MediaRecorder │    │
│  └─────────────────────┘    │
└────────────┬────────────────┘
             │ ws://
┌────────────▼────────────────┐
│  Backend (FastAPI)          │
│  ┌─────────────────────┐    │
│  │ SessionManager      │    │
│  │ Rate Limiter (IP)   │    │
│  ├─────────────────────┤    │
│  │ STT: Deepgram       │    │
│  │ LLM: OpenAI (mini+o)│    │
│  │ TTS: OpenAI         │    │
│  └─────────────────────┘    │
│  Silence Monitor            │
│  Report Generator           │
└─────────────────────────────┘
```

---

## Migration Plan (Deployment)

1. Deploy backend to Railway (main.py + dependencies)
2. Deploy frontend to Vercel (NEXT_PUBLIC_WS_URL → Railway endpoint)
3. Add environment variables (API keys)
4. Test 1 session locally, then 5 sessions in staging
5. QA checklist before demo

Rollback: Redeploy previous main branch commit (stateless architecture makes rollback trivial)

---

## Open Questions

- Should we pre-cache the first 5–10 most common questions (by role) as audio to eliminate first-question latency? (Nice-to-have, not MVP)
- Do we want to log anonymized metrics (e.g., "5 backend-eng sessions, 4 completed") during POC? (Optional, not MVP)

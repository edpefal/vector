## Why

Technical professionals need a low-cost, privacy-first way to practice technical interviews and get immediate feedback. Current alternatives (LeetCode, Pramp) either don't focus on communication, are expensive, or require pairing with other users. This MVP provides an AI-powered interview simulator with zero audio recording and ephemeral sessions—enabling practice without privacy concerns.

## What Changes

This is a **new product MVP** consisting of:
- Frontend: Next.js form for role/stack selection + audio-only call interface
- Backend: FastAPI WebSocket server orchestrating STT (Deepgram) → LLM (GPT) → TTS (OpenAI)
- Deliverable: 5-minute audio-only interview simulation + downloadable text report

No breaking changes to existing code—this is a new service.

## Capabilities

### New Capabilities

- `session-management`: Orchestrate 5-minute interview sessions with ephemeral state (RAM-based, no persistence)
- `speech-to-text`: Stream audio from browser, convert to text using Deepgram Nova-2 with language detection
- `ai-conversation`: Generate context-aware interview questions with GPT-4o-mini, handle multi-turn dialogue
- `text-to-speech`: Convert generated questions/responses to audio using OpenAI TTS
- `rate-limiting`: Enforce 1 session per IP per hour to prevent abuse during POC
- `feedback-reporting`: Generate structured feedback report (clarity, depth, communication) with recommendations using GPT-4o
- `silence-detection`: Monitor for user inactivity (30s → warning, 90s → end session) with text fallback support

### Modified Capabilities

<!-- No existing capabilities are being modified. This is a new application. -->

## Impact

- **New services**: Backend (FastAPI), Frontend (Next.js page)
- **New dependencies**: Deepgram SDK, OpenAI SDK, FastAPI, python-multipart
- **Infrastructure**: Railway (backend), Vercel (frontend)
- **Cost**: ~$0.07–0.20 USD per session (API calls only)
- **Privacy**: Audio is ephemeral (never recorded or persisted); only transcription kept in RAM during session

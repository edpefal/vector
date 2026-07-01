# Implementation Tasks

## 1. Setup & AdSense Integration

- [ ] 1.1 Set up Google AdSense account (or use existing) and obtain ad unit ID for in-stream video ads
- [ ] 1.2 Create `frontend/lib/adsense.ts` module with AdSense SDK initialization and callback handlers
- [ ] 1.3 Load Google IMA SDK via Next.js `<Script>` component in `app/layout.tsx` or create AdSenseProvider component
- [ ] 1.4 Document AdSense account setup steps in `.env.local` or `.env.example` (store ad unit ID)

## 2. AdGateModal Component

- [ ] 2.1 Create `frontend/components/AdGateModal.tsx` component with:
  - Props: `isOpen`, `onClose`, `onAdComplete`, `originalName`
  - Displays modal with message "Watch an ad to download your SVG"
  - Two buttons: [Watch Ad] and [No, thanks]
- [ ] 2.2 Implement [Watch Ad] button behavior:
  - Hides buttons and shows ad container div
  - Calls AdSense SDK to load and play video ad
  - Listens for ad completion callback
- [ ] 2.3 Implement [No, thanks] button behavior:
  - Closes modal and calls `onClose` callback
- [ ] 2.4 Implement fallback timeout:
  - If AdSense doesn't complete within 60 seconds, show manual "Download Now" button
  - Log timeout event to analytics
- [ ] 2.5 Style modal with Tailwind (match existing design):
  - Centered modal, dark overlay, clear typography
  - Mobile responsive (full-width on small screens)
- [ ] 2.6 Handle ad load failures:
  - If AdSense script fails to load, show error message and disable download
  - Log failure to analytics

## 3. AdSense SDK Integration

- [ ] 3.1 In `frontend/lib/adsense.ts`, implement:
  - `loadAdSense()` function that initializes Google IMA SDK
  - `playAd(container: HTMLElement, onComplete: () => void)` function that loads and plays ad
  - `handleAdComplete()` callback that fires `onComplete` prop
- [ ] 3.2 Add error handling in AdSense functions:
  - Catch script load errors, ad load errors, ad playback errors
  - Log errors with event type, error message, timestamp
- [ ] 3.3 Add event listeners for ad lifecycle:
  - `onAdStart`: Log ad start
  - `onAdComplete`: Log ad completion, trigger download
  - `onAdSkip`: Log rejection/skip (if applicable)
  - `onAdError`: Log ad error

## 4. Update App State Machine

- [ ] 4.1 Modify `app/page.tsx` state machine type:
  - Add new phase: `"ad-gate"` between `"done"` and download
  - State type: `{ phase: "ad-gate"; preview: string; svgContent: string; originalName: string }`
- [ ] 4.2 Create `handleDownloadClick()` handler:
  - Transitions state from "done" to "ad-gate"
  - Opens AdGateModal
- [ ] 4.3 Create `handleAdComplete()` handler:
  - Triggered when AdSense callback fires
  - Triggers browser download (client-side blob)
  - Logs analytics event: ad completed
  - Closes modal and returns to "done" state
- [ ] 4.4 Create `handleAdReject()` handler:
  - Triggered when user clicks [No, thanks]
  - Logs analytics event: ad rejected
  - Returns state to "done" without downloading

## 5. Update ResultPanel Component

- [ ] 5.1 Modify `frontend/components/ResultPanel.tsx`:
  - Change "Download SVG" button click behavior
  - Instead of direct download, call new `onDownloadClick()` prop
  - Existing download logic moves to app/page.tsx
- [ ] 5.2 Remove old `downloadSvg()` function from ResultPanel
- [ ] 5.3 Add `onDownloadClick` prop to ResultPanel interface:
  - `onDownloadClick: () => void`

## 6. Render AdGateModal in Page

- [ ] 6.1 Import AdGateModal in `app/page.tsx`
- [ ] 6.2 Render AdGateModal conditionally:
  - Show when `state.phase === "ad-gate"`
  - Pass props: `isOpen={true}`, `onClose={handleAdReject}`, `onAdComplete={handleAdComplete}`, `originalName={state.originalName}`
- [ ] 6.3 Render state machine phases correctly:
  - `idle` → UploadZone
  - `processing` → Image preview + Spinner
  - `done` → ResultPanel
  - `ad-gate` → ResultPanel + AdGateModal overlay
  - `error` → Error message

## 7. Backend Analytics Logging

- [ ] 7.1 Add logging utility to `backend/main.py`:
  - Create `log_event(event_type: str, data: dict)` function
  - Logs to stdout in JSON format: `{"timestamp": "ISO", "event": "type", ...}`
  - Include timestamp, event type, and any metadata
- [ ] 7.2 Add logging to `/vectorize` endpoint:
  - Log on vectorization start: `{"event": "vectorization", "filename": "...", "status": "start"}`
  - Log on success: `{"event": "vectorization", "filename": "...", "duration_ms": 2500, "status": "success"}`
  - Log on failure: `{"event": "vectorization", "filename": "...", "error": "...", "status": "failure"}`
- [ ] 7.3 Implement client-side ad event logging:
  - Create POST endpoint (or just log client-side to server via fetch)
  - Log: `{"event": "ad_start", "ad_id": "...", "timestamp": "ISO"}`
  - Log: `{"event": "ad_complete", "ad_id": "...", "duration_sec": 30}`
  - Log: `{"event": "ad_reject", "duration_sec": 5}`
- [ ] 7.4 Add download attempt logging:
  - Log when user clicks Download button: `{"event": "download_attempt", "ip": "..."}`
  - Log when ad completes and download triggers: `{"event": "download_complete", "ad_id": "...", "file_size": 5000}`

## 8. Testing & Verification

- [ ] 8.1 Manual test: Full user flow
  - Upload image → vectorize → see result → click Download → modal appears → watch ad (or use timeout) → verify download starts
- [ ] 8.2 Manual test: Rejection flow
  - Upload image → vectorize → click Download → modal appears → click [No, thanks] → verify modal closes, buttons still visible
- [ ] 8.3 Manual test: Multiple downloads
  - Download same file twice → verify each download shows new ad
- [ ] 8.4 Manual test: Ad blocker scenario
  - Enable ad blocker → try to download → verify error message or fallback button
- [ ] 8.5 Verify analytics logging:
  - Check server logs for all event types
  - Verify JSON format, timestamps, required fields
- [ ] 8.6 Check mobile UX:
  - Test modal on small screens (iPhone 12 size)
  - Verify buttons are clickable and modal is readable
- [ ] 8.7 Browser console check:
  - No JavaScript errors
  - No missing images or 404s
  - AdSense SDK loads correctly

## 9. Documentation

- [ ] 9.1 Update README.md:
  - Add "Monetization" section explaining ad gate feature
  - Document how to set up Google AdSense account
- [ ] 9.2 Add `.env.local.example` file:
  - Document `NEXT_PUBLIC_ADSENSE_UNIT_ID` environment variable
- [ ] 9.3 Document analytics log format in backend:
  - Add comment in `main.py` describing JSON log schema
- [ ] 9.4 Add comment in AdGateModal:
  - Explain state machine phases and ad flow

## 10. Deployment Checklist

- [ ] 10.1 Verify all environment variables set:
  - `NEXT_PUBLIC_ADSENSE_UNIT_ID` in `.env.local`
- [ ] 10.2 Run linter and format checks:
  - `npm run lint` in frontend
  - `pylint` or `ruff` in backend (if configured)
- [ ] 10.3 Test build:
  - `npm run build` in frontend (verify no build errors)
  - Backend venv intact and dependencies installed
- [ ] 10.4 Final manual test:
  - Full flow end-to-end one more time
  - Check logs are written correctly
- [ ] 10.5 Commit and push:
  - All changes committed with clear messages
  - Ready for code review

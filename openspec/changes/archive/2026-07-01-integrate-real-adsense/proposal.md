## Why

The current ad-gate implementation uses a simulated ad that completes instantly after 3 seconds. While this works for development and testing, it doesn't reflect real AdSense behavior. To prepare for production deployment, we need to integrate actual Google AdSense with real callbacks and error handling. This ensures the system works correctly when a real AdSense account is approved and the domain is deployed to production.

## What Changes

- Replace simulated ad placeholder with real Google IMA SDK integration
- Implement dual-mode support: test ads in development (localhost), real AdSense in production
- Add proper error handling for AdSense failures (block download if ad doesn't complete)
- Configure ad mode via environment variables (NEXT_PUBLIC_ADSENSE_MODE)
- Improve error messaging when AdSense fails or is blocked
- No changes to user-facing UX flow (ad still triggers automatic download on completion)

## Capabilities

### New Capabilities
- `real-adsense-integration`: Integrate Google AdSense video ads with dual-mode support (test in dev, real in production). Support real IMA SDK callbacks and error handling.

### Modified Capabilities
- `ad-gating-for-downloads`: No requirement changes, but implementation switches from simulated to real AdSense integration.

## Impact

**Frontend:**
- Major rewrite of `frontend/lib/adsense.ts` to use real Google IMA SDK
- Minor updates to `frontend/components/AdGateModal.tsx` for error handling
- New environment variables in `.env.local` and `.env.production`

**Backend:**
- No changes

**Dependencies:**
- Google IMA SDK (already loaded via script, now actually used)

**Breaking Changes:**
- None. Test mode maintains current behavior, real mode is opt-in via environment variable.

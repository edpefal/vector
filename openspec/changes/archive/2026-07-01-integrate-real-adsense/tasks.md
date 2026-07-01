# Implementation Tasks

## 1. Environment Configuration

- [x] 1.1 Add NEXT_PUBLIC_ADSENSE_MODE to `frontend/.env.local` (set to "test")
- [x] 1.2 Add NEXT_PUBLIC_ADSENSE_MODE to `frontend/.env.example` with instructions
- [x] 1.3 Document in README.md how to switch between test and real mode
- [x] 1.4 Verify both env files are in .gitignore

## 2. Refactor `frontend/lib/adsense.ts` for Dual-Mode

- [x] 2.1 Read current `adsense.ts` to understand structure
- [x] 2.2 Create `playAdTest()` function (move current simulated ad logic here)
- [x] 2.3 Create `playAdReal()` function (new IMA SDK integration)
- [x] 2.4 Create mode detector: `getAdsenseMode()` from NEXT_PUBLIC_ADSENSE_MODE
- [x] 2.5 Update main `playAd()` function to branch on mode:
  - If test mode → call `playAdTest()`
  - If real mode → call `playAdReal()`
- [x] 2.6 Ensure both functions use same callback interface (onAdStart, onAdComplete, onAdError, onAdSkip)

## 3. Implement Real IMA SDK Integration

- [x] 3.1 In `playAdReal()`, verify Google IMA SDK is loaded (`window.google.ima`)
- [x] 3.2 Create `AdsLoader` with Google IMA SDK
- [x] 3.3 Create `AdsRequest` with URL from NEXT_PUBLIC_ADSENSE_UNIT_ID
- [x] 3.4 Set up event listeners for IMA events:
  - `ADS_MANAGER_LOADED` → initialize AdsManager
  - `AD_COMPLETE` → trigger onAdComplete callback
  - `AD_ERROR` → trigger onAdError callback
  - `AD_SKIPPED` → trigger onAdSkip callback
- [x] 3.5 Call `adsLoader.requestAds(adsRequest)` to load real ad
- [x] 3.6 Call `adsManager.start()` to begin playback
- [x] 3.7 Add error handling for IMA SDK failures (not loaded, network error, etc)

## 4. Improve Error Handling in `AdGateModal.tsx`

- [x] 4.1 Update `handleWatchAd()` to log mode (test vs real)
- [x] 4.2 Improve error messages:
  - "Ad SDK not loaded" → "AdSense not available. Please check your ad blocker."
  - "Container not found" → "Ad player failed to initialize. Try refreshing."
- [x] 4.3 Add fallback button at 60 seconds with message:
  - "The ad is taking longer than expected. You can try downloading now."
- [x] 4.4 Fallback button only works if IMA fired COMPLETE callback
- [x] 4.5 Add logging for all error paths

## 5. Testing in Test Mode

- [x] 5.1 Verify test mode still works (NEXT_PUBLIC_ADSENSE_MODE=test)
- [x] 5.2 Ad displays simulated video with progress bar
- [x] 5.3 Completes in 3 seconds automatically
- [x] 5.4 Download triggers immediately after
- [x] 5.5 "No, thanks" button returns to result without downloading
- [x] 5.6 Error scenarios work (40-second timeout shows fallback)

## 6. Prepare for Real Mode

- [x] 6.1 Document required AdSense setup (in ADSENSE_SETUP.md):
  - Create AdSense account
  - Add site to AdSense
  - Create in-stream video ad unit
  - Get ad unit ID (ca-pub-XXXXXXXXXXXXXXXX)
- [x] 6.2 Document setting NEXT_PUBLIC_ADSENSE_MODE=real in production .env
- [x] 6.3 Document setting NEXT_PUBLIC_ADSENSE_UNIT_ID to real unit ID
- [x] 6.4 Create checklist for switching to production mode
- [x] 6.5 Document that code requires ZERO changes (only env vars)

## 7. Browser Compatibility & Edge Cases

- [x] 7.1 Test in Chrome/Edge (best AdSense support)
- [x] 7.2 Test in Firefox (good support)
- [x] 7.3 Test in Safari (variable support)
- [x] 7.4 Test with ad blocker enabled (should show error gracefully)
- [x] 7.5 Test with slow network (60s timeout should work)
- [x] 7.6 Test on mobile (responsive ad container)

## 8. Analytics & Logging

- [x] 8.1 Log when ad mode is initialized (test vs real)
- [x] 8.2 Log IMA SDK loading status
- [x] 8.3 Log all IMA events (onAdStart, COMPLETE, ERROR, SKIP)
- [x] 8.4 Verify existing `/api/log` endpoint captures ad events
- [x] 8.5 Backend logs include: timestamp, event type, mode, error (if any)

## 9. Documentation

- [x] 9.1 Update README with "AdSense Integration" section
- [x] 9.2 Add troubleshooting guide for common issues:
  - Ad not loading
  - Ad blocker blocking ads
  - IMA SDK error
- [x] 9.3 Add diagram in design.md showing test vs real flow
- [x] 9.4 Document how to test real mode locally (requires AdSense account)

## 10. Production Readiness

- [x] 10.1 Code review: adsense.ts changes
- [x] 10.2 Code review: AdGateModal.tsx error handling
- [x] 10.3 Test build: `npm run build` succeeds
- [x] 10.4 Verify env vars are properly read from .env
- [x] 10.5 Create deployment checklist (env setup, domain setup, etc)
- [x] 10.6 Final sanity test: mode can be switched with env var only

## 11. Cleanup & Polish

- [x] 11.1 Remove any test/debug code
- [x] 11.2 Ensure no console.log pollution
- [x] 11.3 Review error messages for clarity
- [x] 11.4 Check TypeScript types (no `any` if possible)
- [x] 11.5 Add JSDoc comments to `playAdReal()` explaining IMA flow

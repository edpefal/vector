# Design: Real AdSense Integration

## Context

The current implementation uses a simulated ad that completes instantly. To prepare for production, we need to integrate real Google AdSense while maintaining the ability to test locally without a real AdSense account. The dual-mode approach allows test mode to use the current simulated ad, while real mode uses Google IMA SDK with actual AdSense callbacks.

**Current State:**
- Simulated ad in `frontend/lib/adsense.ts`
- Google IMA SDK script loaded but unused
- Test unit ID configured in `.env.local`
- No error handling for real AdSense scenarios

**Constraints:**
- Must not require AdSense account for local development
- Same UX flow in both modes
- Strict error handling: AdSense failure = no download
- Ready for production with zero code changes (only env var change)

## Goals / Non-Goals

**Goals:**
- Support real Google IMA SDK callbacks in production
- Dual-mode architecture (test/real via env variable)
- Robust error handling for AdSense failures
- Zero code changes needed to switch from test to real

**Non-Goals:**
- Async mode selection (mode is fixed at build time via env)
- Support for other ad networks
- Custom ad parameters per user
- Analytics integration with AdSense (separate concern)

## Decisions

### 1. **Dual-Mode via Environment Variable**

**Decision**: Use `NEXT_PUBLIC_ADSENSE_MODE` environment variable to control test vs. real mode.

**Rationale**:
- Simple, deterministic configuration
- No runtime branching logic
- Easy to debug (mode is visible in env)
- Follows Next.js conventions

**Implementation**:
```
Development:  NEXT_PUBLIC_ADSENSE_MODE=test    → simulated ad
Production:   NEXT_PUBLIC_ADSENSE_MODE=real    → real AdSense (IMA SDK)
```

**Alternatives Considered**:
- Runtime detection (NODE_ENV): Too implicit, harder to debug
- Feature flag service: Overkill, adds latency
- Conditional imports: Requires build-time distinction anyway

### 2. **IMA SDK Integration Approach**

**Decision**: Use Google IMA SDK directly (not a wrapper library). Handle callbacks explicitly.

**Rationale**:
- IMA SDK is the official, supported way to integrate AdSense video ads
- No additional dependencies
- Full control over error handling
- Direct access to all callback events

**How It Works**:
```
User clicks "Watch Ad"
  ↓ (in real mode)
Create AdsLoader with IMA SDK
  ↓
Request ad via NEXT_PUBLIC_ADSENSE_UNIT_ID
  ↓
IMA fires onAdStart callback
  ↓
User watches ad
  ↓
IMA fires COMPLETE event
  ↓
onAdComplete callback triggers download
```

**Alternatives Considered**:
- Google Ad Manager (too enterprise-focused)
- Simpler ad SDKs: Missing features, less reliable callbacks

### 3. **Error Handling: Strict Mode**

**Decision**: If AdSense fails, block download. No fallback to skipping ads.

**Rationale**:
- Monetization is non-negotiable
- If AdSense fails, better to show error than lose revenue
- User can try again or contact support
- Matches the business requirement

**Error Scenarios Handled**:
1. IMA SDK fails to load → Show error, disable download
2. Ad fails to load → Show error, disable download
3. Ad doesn't complete in 60s → Show message, show fallback button
4. Ad blocker prevents loading → Detect, show message, disable download

**Fallback Button Logic**:
- Button only appears after 60s timeout
- Clicking it only works if IMA SDK marked ad as completed
- If IMA never fired COMPLETE, download still blocked

### 4. **Test Mode Implementation**

**Decision**: Keep current simulated ad for test mode, but switch to real IMA SDK in real mode.

**Rationale**:
- Test mode: Developers can iterate fast without AdSense setup
- Real mode: Full IMA SDK behavior for production validation
- No code duplication (same AdGateModal works for both)

**Code Structure**:
```typescript
if (mode === "test") {
  playAdSimulated(container)  // Current implementation
} else {
  playAdReal(container)       // New IMA SDK implementation
}
```

### 5. **No Code Changes for Mode Switch**

**Decision**: Switching from test to real requires ONLY environment variable change, zero code changes.

**Rationale**:
- Simplifies CI/CD and deployment
- Reduces risk of deployment errors
- Allows safe rollback (just change env var)

**Implementation**:
- All mode logic is in `lib/adsense.ts`
- AdGateModal is mode-agnostic
- Environment variable read at build time
- Same binary works for both modes (just change env)

## Risks / Trade-offs

### Risk 1: IMA SDK Complex Behavior
**Risk**: Google IMA SDK has complex error modes and edge cases not fully documented.

**Mitigation**:
- Comprehensive error handling for all known events
- 60-second timeout as safety net
- Test thoroughly with real AdSense account before production
- Monitor error logs in production

### Risk 2: Ad Blocker Blocking
**Risk**: Ad blockers prevent IMA SDK from loading entirely.

**Mitigation**:
- Detect IMA SDK failure gracefully
- Show user-friendly error message
- Log blocker detection for analytics
- Consider future "premium no-ads" tier if this becomes common

### Risk 3: Missing Callbacks
**Risk**: IMA SDK may not fire expected callbacks in rare scenarios.

**Mitigation**:
- 60-second timeout ensures user isn't stuck forever
- Fallback button as safety net (optional override)
- Extensive testing with various ad types
- Monitor callback failures in production

## Open Questions

1. **Ad Unit Verification**: When user creates AdSense account, should we validate the unit ID format? (Answer: Yes, validate format in env setup docs)
2. **Multiple Ad Types**: Should we support banner ads, native ads, or only video? (Answer: Video only for now, as specified)
3. **Production Monitoring**: Should we log IMA events to analytics backend? (Answer: Yes, capture in backend logs already in place)
4. **Fallback Button UX**: Should fallback button appear at 60s, or should user wait indefinitely? (Answer: Appear at 60s with message, this was decided in exploration)

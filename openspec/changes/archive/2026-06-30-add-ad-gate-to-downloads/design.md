# Design: Ad-Gating for Downloads

## Context

The vectorizer app currently allows unrestricted SVG downloads with no monetization. Users upload images, see vectorized results, and download the SVG directly via client-side download (browser blob creation). We need to introduce Google AdSense video ads as a monetization point while maintaining a smooth user experience.

**Current State:**
- ResultPanel has a "Download SVG" button that triggers client-side download via blob + <a> element
- No modal system in place
- No ad network integration
- App state machine: idle → processing → done (result view)

**Constraints:**
- Client-side download (first version) — no server-side file serving
- No database — logging only to server stdout/logs
- Simple integration (no complex ad networks)
- Google AdSense for ads (simplest path, no custom implementations)

## Goals / Non-Goals

**Goals:**
- Gate SVG downloads behind a required Google AdSense video ad
- Monetize every download without rate limiting
- Track ad completion, rejection, and conversion metrics
- Maintain smooth UX (auto-download after ad, one-click rejection)

**Non-Goals:**
- Premium tiers or user accounts (out of scope for v1)
- Database-backed analytics (logs sufficient)
- Ad retargeting or frequency capping
- Mobile app (web only)
- Server-side file serving (client-side download only for v1)

## Decisions

### 1. **AdSense Integration via Script Tag + Callbacks**

**Decision**: Integrate Google AdSense using the official script tag (no npm package). Use AdSense's JavaScript callback API to detect ad completion.

**Rationale**: 
- Simplest integration path (no extra npm dependencies)
- AdSense provides callbacks for ad completion via `google.ima.AdsManager` events
- No need for a third-party React wrapper

**Alternatives Considered:**
- React-google-ads npm package: Adds dependency, more complex setup, overkill for single use case
- Google Ad Manager (GAM): Enterprise-level, unnecessary complexity

**Implementation Sketch**:
```
1. Load AdSense script in Next.js layout or via <Script> component
2. In AdGateModal, create container div
3. On "Watch Ad" click, trigger ad load via Google IMA SDK
4. Listen for adComplete or similar callback
5. On callback, trigger download automatically
```

### 2. **State Machine Extension: Add "ad-gate" Phase**

**Decision**: Extend the app's 3-state machine (idle, processing, done) to include "ad-gate" phase between done and download trigger.

**Rationale**:
- Keeps state machine clean and explicit
- Clear separation of concerns (ad gate modal ≠ result display)
- Enables easy testing and debugging of state transitions

**Current State Machine:**
```
idle → [upload] → processing → [vectorize completes] → done
```

**New State Machine:**
```
idle → [upload] → processing → [vectorize completes] → done
                                                        ↓ [click Download]
                                                     ad-gate
                                                        ↓ [watch ad completes]
                                                     downloading (or back to done)
```

**Alternatives Considered:**
- Use modal open/closed state instead: Less explicit, harder to track in Redux/Context if added later
- Single "done" state with nested modal: Mixes concerns, harder to test

### 3. **Ad Completion Validation: AdSense Callbacks (Not Client-Side Trust)**

**Decision**: Use Google AdSense's server-side or callback-based completion confirmation. Do NOT trust client-side "I watched" buttons.

**Rationale**:
- AdSense callbacks are triggered by ad network (not user-hackable without significant effort)
- Prevents users from bypassing ads by clicking buttons before watching
- Industry standard for monetization

**How It Works**:
- AdSense IMA SDK fires `adComplete` or similar event when video finishes
- This event is part of the ad network's flow, not client-side logic
- Download only triggers on legitimate callback

**Security Note**: 
- DevTools can still access the SVG from the page DOM before download
- This is acceptable for v1 (see trade-offs)

### 4. **Modal Component Structure**

**Decision**: Create a dedicated `AdGateModal.tsx` component (not embedded in ResultPanel).

**Rationale**:
- Separation of concerns
- Reusable if needed elsewhere
- Easier to test and maintain

**Component API**:
```typescript
<AdGateModal
  isOpen: boolean
  onClose: () => void
  onAdComplete: () => void  // Called when ad completes
  svgContent: string         // For reference, not needed in modal
/>
```

**Alternatives Considered:**
- Modal inside ResultPanel: Mixes concerns, harder to refactor
- Use Headless UI / Radix: Overkill, keep it simple

### 5. **Download Trigger: Automatic on Callback**

**Decision**: Automatically trigger browser download immediately after AdSense callback, no additional user action.

**Rationale**:
- Smooth UX (watch ad → file downloads, one action)
- No confusion about "Download Now" button
- Simplest implementation

**Implementation**:
```typescript
const handleAdComplete = () => {
  // AdSense callback signals ad finished
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${originalName}.svg`;
  a.click();
  URL.revokeObjectURL(url);
  // Close modal, return to done state
};
```

### 6. **Analytics: Server-Side Logging (No Database)**

**Decision**: Log all events (vectorize, download, ad) to stdout/server logs. No database.

**Rationale**:
- Simple, works immediately
- Can filter logs by timestamp, event type via CLI tools
- Sufficient for v1 metrics

**Log Format** (JSON lines for easy parsing):
```json
{"timestamp":"2026-06-30T10:15:00Z","event":"vectorization","filename":"logo.png","duration_ms":2500,"status":"success"}
{"timestamp":"2026-06-30T10:15:05Z","event":"download_attempt","ip":"192.168.1.1"}
{"timestamp":"2026-06-30T10:15:10Z","event":"ad_start","ad_id":"xyz123"}
{"timestamp":"2026-06-30T10:15:40Z","event":"ad_complete","ad_id":"xyz123","duration_sec":30}
```

**Alternatives Considered**:
- Firebase / Google Analytics: Overkill, data privacy concerns
- Custom database: Over-engineered for v1

### 7. **Client-Side Download (First Version)**

**Decision**: Keep SVG download client-side (blob creation). Do NOT implement server-side file serving.

**Rationale**:
- Simplest path, leverages existing code
- No server-side changes needed
- Reduces load on backend

**Trade-offs**:
- Users with DevTools can extract SVG before download (see risks)
- Acceptable for v1 (estimated 5-10% of users)

**Future Path**:
- v2 could implement server-side download with token validation
- Each ad completion generates a 15-minute download token
- Download triggers `/api/download?token=xyz` instead of blob

## Risks / Trade-offs

### Risk 1: DevTools SVG Extraction
**Risk**: Technical users can open DevTools, find `<div dangerouslySetInnerHTML={{__html: svgContent}}>`, copy the SVG, and download it without viewing ads.

**Mitigation**: 
- Accept this for v1 (5-10% of users)
- v2 implements server-side download with token validation
- Track "DevTools exits" via referrer policy if needed

### Risk 2: Ad Blocker Bypass
**Risk**: Ad blocker (uBlock Origin) prevents AdSense script from loading, modal never appears, download button remains functional.

**Mitigation**:
- Add fallback: If AdSense fails to load after 5 seconds, show warning "Please disable ad blocker" and disable download button
- Log ad load failures for monitoring

### Risk 3: AdSense Account Issues
**Risk**: Google suspends AdSense account for policy violations, ads stop serving, users see broken modal.

**Mitigation**:
- Design UI to handle "No ads available" state
- Show clear message: "Ads unavailable, please try again later"
- Disable download button if ads can't load

### Risk 4: Callback Unreliability
**Risk**: AdSense callback doesn't fire, user watches ad but download never triggers.

**Mitigation**:
- Add manual "Download now" button that appears after 5 seconds (fallback)
- Log callback failures for debugging
- Set a 60-second timeout to show fallback

## Open Questions

1. **AdSense Account Setup**: Do we have Google AdSense account configured? If not, need to set up before implementation.
2. **Ad Placement**: Which AdSense ad unit should we use? (Video ads, in-stream, etc.)
3. **Logging Infrastructure**: Where should logs go? stdout/stderr for now, or should they write to a file?
4. **Testing**: How do we test ad completion in dev? (AdSense sandbox mode, mock callbacks?)
5. **Mobile UX**: Should modal be full-screen on mobile, or float? (Out of scope for v1, but note for design)

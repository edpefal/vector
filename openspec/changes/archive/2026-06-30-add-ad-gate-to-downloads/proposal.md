## Why

The vectorizer app currently allows unlimited free downloads with no monetization. To sustain the product, we need to introduce a revenue stream through non-intrusive video advertising. Gating downloads behind a required ad view creates a conversion point that balances user experience with revenue generation.

## What Changes

- Users can vectorize images freely (no change)
- When clicking "Download SVG", a modal appears requiring them to watch a Google AdSense video ad
- After the ad completes (validated via AdSense callback), the download starts automatically
- If users reject the ad, they return to the result view without downloading
- Each download attempt requires viewing a new ad (monetization scales with usage)
- All ad events and download metrics are logged server-side for analytics

## Capabilities

### New Capabilities
- `ad-gating-for-downloads`: Gate SVG downloads behind a Google AdSense video ad. Users must watch the complete ad before the download triggers. Rejection returns them to the result view.
- `analytics-logging`: Track vectorization events, download attempts, ad completions, ad rejections, and conversion rates via server-side logging.

### Modified Capabilities
- `image-vectorization`: No requirement changes, but flow is modified to include ad gate before download (implementation detail).

## Impact

**Frontend:**
- New component: `AdGateModal.tsx` - Modal that displays ad gate and handles AdSense integration
- New utility: `lib/adsense.ts` - AdSense integration and callback handling
- Modified: `components/ResultPanel.tsx` - Download button now opens ad gate modal instead of direct download
- Modified: `app/page.tsx` - State machine extended to include ad-gate phase

**Backend:**
- Modified: `main.py` - Add analytics logging for events (vectorizations, download attempts, ad events)

**Dependencies:**
- Google AdSense account setup (external)
- No new npm packages required (AdSense via script tag)

**Breaking Changes:**
- None - download experience changes but no API/contract breaks

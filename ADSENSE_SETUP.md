# Google AdSense Setup for Image Vectorizer

## Dual-Mode Setup (Test & Production)

The Image Vectorizer supports two modes of operation for Google AdSense integration:

- **Test Mode**: Simulated ads for development (no AdSense account needed)
- **Real Mode**: Google IMA SDK with actual AdSense (requires approved account)

Environment variables determine which mode is used.

---

## Development Mode (Recommended)

### For Local Development - Test Mode

No AdSense account needed. Test mode uses a simulated ad that completes in 3 seconds.

**Environment Variables:**
```bash
NEXT_PUBLIC_ADSENSE_MODE=test
NEXT_PUBLIC_ADSENSE_UNIT_ID=ca-pub-3626050409831541
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**What You Get:**
- Simulated video ad with progress bar
- Completes automatically after 3 seconds
- Perfect for local development and testing
- No Google AdSense account required
- Same UX as production

**Steps:**
1. `.env.local` is already configured with test mode
2. Run `npm run dev` in frontend directory
3. Upload an image and click "Download SVG"
4. Click "Watch Ad" to see the simulated ad
5. Ad completes after 3 seconds → automatic download

---

## Production Mode (Real AdSense)

### Requirements

To switch to real AdSense ads:
- Google Account
- Approved Google AdSense account
- Domain verified in AdSense
- In-stream video ad unit created
- Real Publisher ID (format: `ca-pub-xxxxxxxxxxxxxxxx`)

### Setup Steps

1. **Create AdSense Account:**
   - Visit https://www.google.com/adsense/start/
   - Sign in with Google Account
   - Enter your vectorizer domain
   - Complete verification (AdSense will email you)
   - Wait for approval (1-3 days typically)

2. **Create In-Stream Video Ad Unit:**
   - Go to https://adsense.google.com
   - Navigate to Ads → Ad units
   - Click "Create new ad unit"
   - Select "In-stream video"
   - Configure settings as needed
   - Copy the Publisher ID

3. **Set Environment Variables:**
   ```bash
   NEXT_PUBLIC_ADSENSE_MODE=real
   NEXT_PUBLIC_ADSENSE_UNIT_ID=ca-pub-YOUR-REAL-ID
   NEXT_PUBLIC_API_URL=https://your-production-domain.com
   ```

4. **Deploy:**
   - Push code to production
   - Real ads appear after 15-30 minutes
   - Monitor ad performance in AdSense dashboard

### Important Notes

- **Ads serve after 15-30 minutes** - Not immediately
- **Earnings tracked** - Real revenue starts after setup
- **Account protection** - Violate AdSense policies = account ban
- **Minimum threshold** - Need $100+ earned before withdrawal
- **Zero code changes** - Only environment variables change

---

## Switching Modes

### Test → Real

When you're ready to go live:

```bash
# Before
NEXT_PUBLIC_ADSENSE_MODE=test

# After
NEXT_PUBLIC_ADSENSE_MODE=real
NEXT_PUBLIC_ADSENSE_UNIT_ID=ca-pub-YOUR-ID
```

**That's it!** No code changes needed. Same binary, same UX, different ad source.

### Real → Test (Rollback)

If you need to rollback:

```bash
NEXT_PUBLIC_ADSENSE_MODE=test
```

---

## Testing Checklist

### Test Mode (Local)
- [ ] App loads with `NEXT_PUBLIC_ADSENSE_MODE=test`
- [ ] Upload image → Vectorize → Click "Download SVG"
- [ ] Modal appears with "Watch Ad" button
- [ ] Click "Watch Ad" → Simulated ad shows with progress bar
- [ ] Ad completes after 3 seconds
- [ ] SVG downloads automatically
- [ ] "No, thanks" button returns to result without downloading
- [ ] 60-second timeout: if ad doesn't complete, fallback button appears

### Real Mode (Production)
- [ ] AdSense account approved
- [ ] Ad unit created and enabled
- [ ] `NEXT_PUBLIC_ADSENSE_MODE=real` set
- [ ] Real Publisher ID configured
- [ ] Deploy to production domain
- [ ] Wait 15-30 minutes for ads to serve
- [ ] Test flow: Upload → Download → Watch real ad → Auto-download
- [ ] Check AdSense dashboard for impressions
- [ ] Monitor console for IMA SDK errors

---

## Troubleshooting

### Ad Not Loading (Real Mode)

**Issue:** Ad container shows error "Ad blocker detected" or "Ad SDK not available"

**Solutions:**
1. Disable ad blocker extension
2. Check browser console for IMA SDK errors
3. Verify Publisher ID format (ca-pub-...)
4. Confirm ad unit is "Enabled" in AdSense dashboard
5. Wait 15-30 minutes for ads to start serving

### Ad Completes But Download Doesn't Trigger

**Issue:** Modal closes but no file downloads

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify onAdComplete callback is firing (check console logs)
3. Check browser console network tab for download request
4. Try different browser/device
5. Check backend logs for analytics events

### Real Ads Not Appearing in Production

**Issue:** Switched to real mode but ads still don't show

**Solutions:**
1. **Wait 15-30 minutes** - Ads take time to start serving
2. Check AdSense account status is "Active"
3. Verify ad unit is "Enabled"
4. Confirm Publisher ID is correct (copy-paste from dashboard)
5. Check ad review status (some ads need content review)
6. Review AdSense policies - account might be pending review

### Ad Modal Stuck / Timeout

**Issue:** "The ad is taking longer than expected" message

**Solutions:**
1. Slow network - try again with better connection
2. Ad blocker still partially blocking - disable completely
3. Browser cache - clear cookies and reload
4. Manual fallback - click "Download Now" button (if available)

---

## Analytics & Monitoring

All ad events are logged:
- Ad start (impression)
- Ad complete (user watched full ad)
- Ad skip (if allowed by network)
- Ad error (any SDK failures)
- Download (user downloaded after ad)

Check backend logs for JSON events with format:
```json
{
  "timestamp": "2026-07-01T...",
  "event_type": "ad_complete",
  "mode": "test|real",
  "filename": "image.png",
  "error": null
}
```

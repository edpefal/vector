# Image Vectorizer - Frontend

A modern web application for converting PNG/JPG images to scalable SVG vectors using Google AdSense monetization.

## Features

- **Drag & Drop Upload** - Upload images easily via drag-and-drop or click to select
- **Real-time Vectorization** - Convert images to SVG using vtracer backend
- **Side-by-Side Comparison** - View original and vectorized images side-by-side
- **Ad-Gated Downloads** - Users watch a Google AdSense video ad before downloading
- **Analytics Logging** - Track vectorization, download, and ad events

## Getting Started

### Prerequisites

- Node.js 18+
- Google AdSense account (for video ad unit ID)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure AdSense Mode:**

   This app supports dual-mode AdSense integration:

   **Development (Test Mode - Recommended):**
   ```bash
   cp .env.example .env.local
   # No further config needed - uses simulated ads
   NEXT_PUBLIC_ADSENSE_MODE=test
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

   **Production (Real Mode):**
   ```bash
   # Requires Google AdSense account and approved ad unit
   NEXT_PUBLIC_ADSENSE_MODE=real
   NEXT_PUBLIC_ADSENSE_UNIT_ID=ca-pub-xxxxxxxxxxxxxxxx
   NEXT_PUBLIC_API_URL=https://your-production-backend.com
   ```

   To get a real AdSense unit ID:
   - Go to [Google AdSense](https://adsense.google.com)
   - Create account and verify domain
   - Navigate to Ads → Ad units
   - Create an in-stream video ad unit
   - Copy the Publisher ID (format: `ca-pub-xxxxxxxxxxxxxxxx`)

### Development

Run the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production

```bash
npm run build
npm start
```

## Architecture

### State Machine

The app uses a 4-state machine:
1. **idle** - Show upload zone
2. **processing** - Show vectorization spinner
3. **done** - Show result comparison + download button
4. **ad-gate** - Show modal with Google AdSense ad
5. **error** - Show error message

### Components

- **UploadZone** - Drag & drop file upload with validation
- **ResultPanel** - Side-by-side image comparison and download button
- **AdGateModal** - Ad gate modal with Google IMA SDK integration
- **Spinner** - Loading indicator

### Libraries

- **Google IMA SDK** - In-stream video ads (loaded via script tag)
- **Next.js 14** - Frontend framework with App Router
- **Tailwind CSS** - Styling

## Monetization

### Ad-Gating Flow

1. User uploads and vectorizes image
2. Clicks "Download SVG"
3. Modal appears: "Watch an ad to download"
4. User clicks "Watch Ad"
5. Google IMA video ad plays (non-skippable)
6. Ad completion callback triggers automatic browser download
7. SVG file downloads to user's device

### Ad Configuration

- **Ad Provider**: Google AdSense
- **Ad Type**: In-stream video (non-skippable)
- **Ad Unit**: Configured via `NEXT_PUBLIC_ADSENSE_UNIT_ID`
- **Timeout Fallback**: If ad doesn't complete in 60s, shows manual download button

### Analytics

Events logged to backend via `/api/log`:
- `vectorization` - Image vectorization start/success/failure
- `download_attempt` - User clicked Download button
- `ad_start` - Ad began playing
- `ad_complete` - Ad completed successfully
- `ad_reject` - User declined to watch ad

## Development Tips

### Testing Ad Integration

During development, you can:
1. Use Google AdSense test ad unit IDs (provided in AdSense account)
2. Check browser DevTools console for ad events
3. Monitor backend logs for analytics events

### Debugging

- **Ad not loading?** Check browser console for Google IMA SDK errors
- **Download not triggering?** Verify AdSense callback is firing (browser DevTools → Console)
- **Analytics missing?** Check backend logs with `tail -f logs/app.log | grep ad_`

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Production Deployment

1. Set `NEXT_PUBLIC_ADSENSE_UNIT_ID` to production ad unit ID
2. Set `NEXT_PUBLIC_API_URL` to production backend URL
3. Run `npm run build` and verify no errors
4. Deploy to Vercel or your hosting platform
5. Monitor backend logs for errors

## License

MIT

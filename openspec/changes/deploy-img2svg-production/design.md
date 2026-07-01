# Design: Production Deployment to img2svg.com

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    img2svg.com (Domain)                 │
└─────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────────────────────────┐
         │    Vercel (Frontend, CDN, Proxy)     │
         ├──────────────────────────────────────┤
         │ ├─ GET /                  → pages    │
         │ ├─ POST /api/*            → proxy    │
         │ └─ HTTPS + automatic SSL  → free     │
         └──────────────────────────────────────┘
                   ↓ (internal proxy)
         ┌──────────────────────────────────────┐
         │   Railway (Backend, Auto-Scale)      │
         ├──────────────────────────────────────┤
         │ ├─ FastAPI server                    │
         │ ├─ vtracer subprocess                │
         │ └─ Auto-scale on demand              │
         └──────────────────────────────────────┘
```

## Key Design Decisions

### 1. **Single Domain Architecture**

**Decision**: Both frontend and API under img2svg.com (no separate api.img2svg.com)

**Rationale**:
- Simpler CORS configuration (same-origin requests)
- Easier DNS setup (one A record)
- Better for SEO (all content on one domain)
- Easier for users (single memorable URL)

**Implementation**:
```
img2svg.com/            → Vercel (frontend)
img2svg.com/api/*       → Vercel proxy → Railway (backend)
```

Vercel's `vercel.json` rewrites `/api/*` requests to Railway backend.

### 2. **Vercel for Frontend (Auto-Scaling)**

**Decision**: Deploy Next.js 14 to Vercel (official Next.js platform)

**Rationale**:
- Zero configuration (detect Next.js automatically)
- Automatic scaling (handles traffic spikes)
- Free tier generous (100GB bandwidth/month)
- HTTPS + CDN included
- Preview deployments for testing

**Cost Progression**:
- 0-100GB/month bandwidth: FREE
- 100-1TB/month: $0.15 per 100GB
- (Most MVPs stay free for months)

### 3. **Railway for Backend (Pay-Per-Use)**

**Decision**: Deploy FastAPI + vtracer to Railway with auto-scaling

**Rationale**:
- Auto-scales compute on demand (no idle servers)
- Pay only for CPU time used (not monthly fee)
- Free tier: 5GB compute/month (covers ~5,000 vectorizations)
- Simple Docker deployment
- Built-in environment variable management

**Cost Progression**:
- 0-5GB compute/month: FREE
- 5GB-∞: $0.10 per GB-hour
- Example: 50,000 vectorizations/month @ 2 sec each = ~28GB = $28

### 4. **Environment Variable Strategy**

**Decision**: All configuration via `.env.production` (zero code changes)

**Rationale**:
- NEXT_PUBLIC_ADSENSE_MODE=real (enables monetization)
- NEXT_PUBLIC_API_URL=https://img2svg.com (production backend)
- No code changes between dev and prod
- Easy to toggle features or rollback

### 5. **Proxy Configuration**

**Decision**: Vercel handles `/api/*` routing internally via `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://railway-backend-url/api/$1"
    }
  ]
}
```

**Rationale**:
- No CORS errors (same-origin proxy)
- Vercel CDN caches responses
- Simple to set up, hard to break
- Railway URL is hidden from browser

### 6. **AdSense Real Mode from Launch**

**Decision**: Enable NEXT_PUBLIC_ADSENSE_MODE=real on day 1

**Rationale**:
- Users watch ads immediately (validates business model)
- Google sees real usage before approving (builds trust)
- No code changes needed to switch to test mode if needed
- Monetization starts instantly after AdSense approval

### 7. **Missing Pages for AdSense Approval**

**Decision**: Add About, Privacy, Contact pages (required by Google)

**Pages to add**:
```
/about       → Explain what the app does
/privacy     → Privacy policy (generated template)
/contact     → Contact form or email
```

**Rationale**:
- Google AdSense requires these
- Builds legitimacy (looks like real company)
- Contact page helps with feedback

## Deployment Flow

```
Day 1: Prepare Code
├─ Create .env.production files
├─ Create vercel.json (proxy config)
├─ Add About, Privacy, Contact pages
└─ Commit to GitHub

Day 2: Register Domain
├─ Buy img2svg.com on Namecheap ($10)
├─ No immediate DNS changes needed
└─ Keep domain parked for now

Day 3-4: Deploy Backend
├─ Create Railway account
├─ Connect GitHub repo
├─ Deploy backend (auto-detects FastAPI)
├─ Get Railway production URL
├─ Set environment variables
└─ Test: curl https://railway-url/api/vectorize

Day 4-5: Deploy Frontend
├─ Create Vercel account
├─ Connect GitHub repo
├─ Set NEXT_PUBLIC_API_URL to Railway URL (in Vercel env)
├─ Deploy frontend (auto-detects Next.js)
├─ Get Vercel production URL
└─ Test: https://vercel-url → should work

Day 5-6: Connect Domain
├─ In Vercel, add img2svg.com as custom domain
├─ Vercel shows DNS records to add
├─ In Namecheap, update A record to Vercel IP
├─ Wait 10-60 minutes for DNS propagation
├─ Test: https://img2svg.com should work
└─ HTTPS automatic (Vercel manages cert)

Day 6-7: End-to-End Testing
├─ Upload image on img2svg.com
├─ Verify vectorization works
├─ Verify AdSense modal shows
├─ Watch ad, verify download triggers
├─ Check backend logs for errors
└─ Fix any issues

Day 7-10: AdSense Submission
├─ Verify all required pages exist
├─ Test privacy policy link
├─ Test contact page
├─ Submit to Google AdSense
├─ Await approval (1-3 days typically)
└─ Enable ads in AdSense dashboard

Day 10+: Live with Monetization
└─ Monitor error logs, traffic, ad performance
```

## Risks & Mitigations

### Risk 1: Domain Takes Time to Propagate
**Mitigation**: Test with Vercel URL before DNS propagation. Can take 24-48 hours for full propagation.

### Risk 2: Railway Backend Timeout or Overload
**Mitigation**: vtracer typically takes <5 seconds. Railway auto-scales. Monitor logs for timeout errors.

### Risk 3: AdSense Rejects Application
**Mitigation**: Follow approval checklist carefully. Contact pages, privacy policy, and no "suspicious" content. If rejected, fix issues and reapply.

### Risk 4: Vercel Proxy Not Working
**Mitigation**: Test vercel.json locally with `vercel dev`. Ensure Railway URL is accessible. Check Vercel logs for rewrite errors.

### Risk 5: CORS Errors Between Frontend and Backend
**Mitigation**: Using same-domain proxy eliminates CORS. If still issues, Railway CORS settings can be adjusted.

## Testing Checklist Before Going Live

- [ ] Frontend loads on img2svg.com (< 2 seconds)
- [ ] Image upload works
- [ ] Vectorization completes successfully
- [ ] AdSense modal appears
- [ ] Ad plays and completes
- [ ] SVG downloads automatically
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Mobile responsive (test on phone)
- [ ] Privacy policy accessible
- [ ] Contact page works
- [ ] HTTPS certificate is valid
- [ ] Vercel analytics show traffic

## Rollback Plan

If anything fails in production:

```
Option A: Rollback to previous deployment
├─ In Vercel, click "Deployments" → select previous version
└─ Click "Promote to Production" (instant)

Option B: Change environment variables
├─ Set NEXT_PUBLIC_ADSENSE_MODE=test (disable real ads)
└─ Redeploy (takes ~30 seconds)

Option C: Change backend URL
├─ In Vercel environment variables, change API_URL to local backend
└─ Redeploy (for emergency testing)

All rollbacks are instant or <1 minute
```

## Monitoring & Observability

**Vercel Dashboard:**
- Real-time traffic metrics
- Error logs (404s, crashes)
- Performance metrics (TTFB, FCP, LCP)
- Deployment history

**Railway Dashboard:**
- Container logs
- CPU usage
- Memory usage
- Network traffic

**Google Analytics (optional):**
- User behavior tracking
- Traffic sources
- Conversion funnel (upload → download)

**Backend Logs:**
- JSON events logged to stderr
- Vectorization timing
- Ad events
- Errors

## Next Steps

1. Prepare code (add files, config)
2. Create accounts (Vercel, Railway, Namecheap)
3. Deploy backend to Railway
4. Deploy frontend to Vercel
5. Connect domain
6. Test end-to-end
7. Submit AdSense
8. Launch!

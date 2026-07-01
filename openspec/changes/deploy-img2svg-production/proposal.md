## Why

The Image Vectorizer application is complete and tested locally. To validate the business model (monetization via Google AdSense) and reach real users, deployment to production is essential. This change prepares the application for public launch on img2svg.com with automatic scaling and minimal operational burden.

## What Changes

- Register and configure img2svg.com domain
- Deploy Next.js frontend to Vercel (automatic scaling, free tier)
- Deploy FastAPI backend to Railway (auto-scale on demand, pay-per-use)
- Configure production environment variables
- Add missing pages (About, Privacy, Contact) required by AdSense
- Set up API proxy routing (Vercel → Railway)
- Enable AdSense real mode with production configuration
- Create deployment documentation and runbooks

## Capabilities

### New Capabilities
- `production-deployment`: Deploy Image Vectorizer to img2svg.com with automatic scaling and AdSense monetization. Includes domain registration, Vercel frontend, Railway backend, and environment configuration.

### Modified Capabilities
- `ad-gating-for-downloads`: Already complete; now enabled in production mode with real AdSense.

## Impact

**User-Facing:**
- Image Vectorizer becomes publicly accessible
- Real users can upload images and download SVGs
- AdSense video ads appear before download (monetization enabled)
- Privacy and terms are documented

**Technical:**
- Frontend: Vercel (zero maintenance, auto-scales)
- Backend: Railway (auto-scales on demand, ~$0 startup cost)
- Infrastructure: Fully managed, no server operations needed

**Operational:**
- Minimal ongoing cost (~$10/year domain + usage-based compute)
- Automatic scaling (no manual intervention)
- Built-in monitoring and logs in both platforms
- Easy rollback: environment variable changes only

## Cost Analysis

**Monthly Operating Costs:**

| Component | Tier | Cost | Notes |
|-----------|------|------|-------|
| Domain (img2svg.com) | Annual | $0.83/mo | $10/year at Namecheap |
| Vercel (frontend) | Free → Pro | $0-20 | Auto-scales, free covers 100GB bandwidth |
| Railway (backend) | Usage-based | $0-50 | Free 5GB compute/mo, $0.10/GB-hour after |
| **Total (MVP)** | | **$1-30** | Depends on traffic growth |

**Break-Even Analysis:**
- 1,000 vectorizations/month at $0.05 AdSense per = $50 revenue
- Operating cost: $5-10/month
- **Profit margin: 80%+**

## Success Criteria

- ✅ img2svg.com resolves to production frontend
- ✅ Image upload works end-to-end (upload → vectorize → download)
- ✅ AdSense video ads load and complete without errors
- ✅ SVG auto-downloads after ad completion
- ✅ Backend scales automatically under load
- ✅ No errors in console or backend logs
- ✅ Google AdSense approval granted
- ✅ All documentation complete (deployment runbook, checklist)
- ✅ Ready for user acquisition and marketing

## Timeline

- **Days 1-2:** Artifact creation, code preparation
- **Days 3-4:** Domain registration, Vercel/Railway setup
- **Days 5-6:** Deploy and test end-to-end
- **Days 7-10:** Add documentation, submit AdSense
- **Days 11-14:** Await AdSense approval, optimize

**Total: 2 weeks to live with monetization**

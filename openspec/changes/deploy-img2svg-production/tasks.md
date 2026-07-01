# Deployment Tasks: img2svg.com to Production

## Phase 1: Code Preparation (Days 1-2)

### 1.1 Create Production Environment Files

- [ ] 1.1.1 Create `frontend/.env.production`:
  ```
  NEXT_PUBLIC_ADSENSE_MODE=real
  NEXT_PUBLIC_ADSENSE_UNIT_ID=ca-pub-[YOUR-REAL-ID]
  NEXT_PUBLIC_API_URL=https://img2svg.com
  ```

- [ ] 1.1.2 Create `frontend/vercel.json` (proxy configuration):
  ```json
  {
    "rewrites": [
      {
        "source": "/api/(.*)",
        "destination": "https://[RAILWAY-URL]/api/$1"
      }
    ]
  }
  ```
  (Leave [RAILWAY-URL] as placeholder for now)

- [ ] 1.1.3 Create `backend/.env.production`:
  ```
  ALLOWED_ORIGINS=https://img2svg.com
  ```

### 1.2 Add Required Pages for AdSense

- [ ] 1.2.1 Create `frontend/app/about/page.tsx`
  - Explain what Image Vectorizer does
  - Mention vtracer technology
  - Add professional appearance
  - 200-300 words

- [ ] 1.2.2 Create `frontend/app/privacy/page.tsx`
  - Standard privacy policy template
  - Mention data collection (image uploads)
  - Explain Google AdSense cookies
  - Link from footer
  - Use template: https://www.privacypolicyonline.com/

- [ ] 1.2.3 Create `frontend/app/contact/page.tsx`
  - Email contact form or simple email link
  - Professional appearance
  - Link from footer

- [ ] 1.2.4 Update `frontend/app/layout.tsx`
  - Add footer with links to About, Privacy, Contact
  - Make pages accessible from all pages

### 1.3 Fix API URL Detection

- [ ] 1.3.1 Update `frontend/app/page.tsx` API_URL detection:
  ```typescript
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  ```
  Verify it works in both dev and production modes

- [ ] 1.3.2 Test locally:
  ```bash
  NEXT_PUBLIC_API_URL=https://example.com npm run dev
  # Verify frontend loads and API_URL is correct
  ```

### 1.4 Update CORS in Backend

- [ ] 1.4.1 Update `backend/main.py` CORS configuration:
  ```python
  allow_origins = [
      "http://localhost:3000",
      "https://img2svg.com",
  ]
  ```

- [ ] 1.4.2 Test CORS locally with production URL

### 1.5 Prepare GitHub Repositories

- [ ] 1.5.1 Push all changes to GitHub (frontend and backend repos)
  - Commit with message: "chore: prepare for production deployment"
  - Ensure both repos are public or accessible to Vercel/Railway
  - Verify main branch is up to date

- [ ] 1.5.2 Confirm GitHub repos are ready
  - Frontend repo has package.json and next.config.js
  - Backend repo has requirements.txt and main.py
  - Both have .gitignore with .env files

---

## Phase 2: Domain & Account Setup (Days 2-3)

### 2.1 Register Domain

- [ ] 2.1.1 Go to https://www.namecheap.com
  - Search for "img2svg.com"
  - Add to cart
  - **Don't configure DNS yet**
  - Complete checkout (~$10)
  - Save receipt with domain details

- [ ] 2.1.2 Verify domain registration email
  - Check email from Namecheap
  - Confirm domain ownership if required

### 2.2 Create Vercel Account

- [ ] 2.2.1 Go to https://vercel.com/signup
  - Sign up with GitHub account (easier)
  - Grant permissions to your repos
  - Complete onboarding

- [ ] 2.2.2 Create new project
  - Import your frontend GitHub repo
  - Let Vercel detect it's a Next.js project
  - **Don't deploy yet** (we need Railway URL first)

### 2.3 Create Railway Account

- [ ] 2.3.1 Go to https://railway.app
  - Sign up with GitHub
  - Grant permissions

- [ ] 2.3.2 Create new project
  - Click "New Project" → "Deploy from GitHub"
  - Select your backend repo
  - Railway auto-detects FastAPI
  - Let it deploy automatically (~2-3 minutes)

- [ ] 2.3.3 Get Railway production URL
  - In Railway dashboard, click "Deployments"
  - Find production deployment
  - Copy the public URL (looks like: xyz123.railway.app)
  - Save this URL

### 2.4 Get Real AdSense Unit ID (if not already)

- [ ] 2.4.1 Create/verify Google AdSense account
  - Go to https://adsense.google.com
  - Sign in or create account
  - **Don't need to configure domain yet** (will do later)

- [ ] 2.4.2 Create in-stream video ad unit
  - Navigate to "Ads" → "Ad units"
  - Click "+ New ad unit"
  - Select "In-stream video"
  - Get the Publisher ID (ca-pub-XXXXXXX...)
  - Save this ID

---

## Phase 3: Backend Deployment (Days 3-4)

### 3.1 Configure Railway Backend Environment Variables

- [ ] 3.1.1 In Railway dashboard, click "Variables"
  - Add from `.env.production`:
    ```
    ALLOWED_ORIGINS=https://img2svg.com
    ```

- [ ] 3.1.2 Redeploy backend to apply variables
  - Click "Deployments" → latest deployment
  - Click "Redeploy"

### 3.2 Test Railway Backend

- [ ] 3.2.1 Test health endpoint:
  ```bash
  curl https://[RAILWAY-URL]/health
  # Should respond: {"status":"ok"}
  ```

- [ ] 3.2.2 Test vectorize endpoint (local test):
  ```bash
  curl -X POST https://[RAILWAY-URL]/api/vectorize \
    -F "file=@test.png"
  # Should return SVG content
  ```

- [ ] 3.2.3 Check Railway logs
  - Go to "Deployments" → "Logs"
  - Verify no errors

---

## Phase 4: Frontend Deployment (Days 4-5)

### 4.1 Update Vercel Configuration

- [ ] 4.1.1 Update `frontend/vercel.json` with Railway URL:
  ```json
  {
    "rewrites": [
      {
        "source": "/api/(.*)",
        "destination": "https://[RAILWAY-URL]/api/$1"
      }
    ]
  }
  ```
  Replace [RAILWAY-URL] with actual Railway URL

- [ ] 4.1.2 Push changes to GitHub
  ```bash
  git add vercel.json
  git commit -m "chore: add Railway backend URL to Vercel proxy"
  git push
  ```

### 4.2 Configure Vercel Environment Variables

- [ ] 4.2.1 In Vercel dashboard, go to "Settings" → "Environment Variables"
  - Add production variables:
    ```
    NEXT_PUBLIC_ADSENSE_MODE = real
    NEXT_PUBLIC_ADSENSE_UNIT_ID = ca-pub-[YOUR-ID]
    NEXT_PUBLIC_API_URL = https://img2svg.com
    ```

- [ ] 4.2.2 Redeploy to apply environment variables
  - Click "Deployments" → latest
  - Click "Redeploy"

### 4.3 Verify Frontend Deploys

- [ ] 4.3.1 Wait for deployment to complete (~1-2 minutes)
  - Watch status in Vercel dashboard
  - Should show "Ready"

- [ ] 4.3.2 Check Vercel logs for errors
  - Click deployment → "Logs"
  - Verify build succeeded

---

## Phase 5: Domain Connection (Days 5-6)

### 5.1 Add Custom Domain to Vercel

- [ ] 5.1.1 In Vercel project, go to "Settings" → "Domains"
  - Click "Add Domain"
  - Enter "img2svg.com"
  - Vercel will show DNS configuration needed

- [ ] 5.1.2 Copy Vercel DNS records
  - Vercel shows A record IP and CNAME records
  - Save these records

### 5.2 Update DNS at Namecheap

- [ ] 5.2.1 Log in to Namecheap account
  - Go to "Domain List"
  - Click "Manage" on img2svg.com

- [ ] 5.2.2 Set up Nameservers (option A - recommended):
  - Go to "Nameservers"
  - Select "Custom DNS"
  - Enter Vercel's nameservers:
    ```
    ns1.vercel-dns.com
    ns2.vercel-dns.com
    ns3.vercel-dns.com
    ns4.vercel-dns.com
    ```

- [ ] 5.2.3 Alternatively, update A/CNAME records manually (if not using nameservers):
  - Go to "Advanced DNS"
  - Update A record to Vercel IP
  - Add CNAME records as shown by Vercel

- [ ] 5.2.4 Wait for DNS propagation
  - Can take 10 minutes to 48 hours
  - Check status: `dig img2svg.com` or `nslookup img2svg.com`

### 5.3 Verify Domain in Vercel

- [ ] 5.3.1 Wait until Vercel shows "Valid" next to domain
  - May take 24-48 hours
  - Check Vercel dashboard periodically

- [ ] 5.3.2 Once verified, HTTPS certificate auto-renews
  - Vercel manages SSL automatically

---

## Phase 6: End-to-End Testing (Days 6-7)

### 6.1 Test Frontend Loading

- [ ] 6.1.1 Visit https://img2svg.com in browser
  - Page loads (may be slow first time)
  - No 404 or DNS errors
  - HTTPS certificate is valid

- [ ] 6.1.2 Check page load performance
  - Should load in <2 seconds
  - No JavaScript errors in console

### 6.2 Test Image Upload & Vectorization

- [ ] 6.2.1 Upload a test image
  - Click upload area or drag image
  - Image should preview

- [ ] 6.2.2 Click "Vectorize" button
  - Shows loading spinner
  - Takes 2-5 seconds
  - Returns vectorized preview

- [ ] 6.2.3 Verify no errors in console
  - Open DevTools (F12)
  - Check Console tab for errors
  - Check Network tab: all requests should be 2xx/3xx

### 6.3 Test AdSense Integration

- [ ] 6.3.1 Click "Download SVG" button
  - AdSense modal appears
  - Modal shows "Watch Ad to Download"

- [ ] 6.3.2 Click "Watch Ad" button
  - Ad loads in container
  - Ad completes after 3-5 seconds (test mode) or varies (real ad)

- [ ] 6.3.3 Verify auto-download after ad
  - SVG should download automatically
  - Browser download appears in bottom-left

- [ ] 6.3.4 Verify "No, thanks" button works
  - Click "No, thanks"
  - Modal closes, returns to result
  - No download happens

### 6.4 Test Mobile Responsiveness

- [ ] 6.4.1 Test on mobile device or DevTools mobile view
  - Layout is responsive
  - Touch interactions work
  - Upload still works

- [ ] 6.4.2 Test on different browsers
  - Chrome/Edge (best AdSense support)
  - Firefox (good support)
  - Safari (variable support)

### 6.5 Verify Backend Logs

- [ ] 6.5.1 In Railway dashboard, check logs
  - Search for vectorization events
  - Verify no errors
  - Check response times

- [ ] 6.5.2 Verify CORS headers
  - Check "Access-Control-Allow-Origin" header
  - Should be "https://img2svg.com"

### 6.6 Test Required Pages

- [ ] 6.6.1 Visit https://img2svg.com/about
  - Page loads and looks professional
  - Content explains the service

- [ ] 6.6.2 Visit https://img2svg.com/privacy
  - Page loads
  - Contains privacy policy language
  - Mentions Google AdSense and data collection

- [ ] 6.6.3 Visit https://img2svg.com/contact
  - Page loads
  - Contact information or form is functional

---

## Phase 7: AdSense Approval (Days 7-10)

### 7.1 Prepare AdSense Submission

- [ ] 7.1.1 Review AdSense policies
  - https://support.google.com/adsense/answer/48182
  - Ensure site complies (no copyright, no adult content, etc.)

- [ ] 7.1.2 Verify all required content exists
  - About page ✓
  - Privacy policy ✓
  - Contact page ✓
  - Original content (not scraped)

### 7.2 Add Site to AdSense

- [ ] 7.2.1 Log in to Google AdSense
  - https://adsense.google.com

- [ ] 7.2.2 Go to "Sites" → "Add website"
  - Enter https://img2svg.com
  - Click "Start" or "Next"

- [ ] 7.2.3 Google will review site
  - Takes 1-3 days typically
  - Check email for approval/rejection

### 7.3 Handle AdSense Decision

- [ ] 7.3.1 If approved:
  - Ads start serving immediately
  - Revenue appears in AdSense dashboard
  - **Done!** Go to Phase 8

- [ ] 7.3.2 If rejected:
  - Read rejection reason
  - Fix issues (add content, remove policy violations, etc.)
  - Reapply after 3-7 days

### 7.4 Enable Ads in AdSense (if approved)

- [ ] 7.4.1 In AdSense, go to "Ads" → "Ad units"
  - Verify your in-stream video unit is listed
  - Status should be "Enabled"

- [ ] 7.4.2 Verify ad code is active
  - Copy ad unit ID
  - Confirm it matches NEXT_PUBLIC_ADSENSE_UNIT_ID in Vercel

---

## Phase 8: Launch & Monitor (Day 10+)

### 8.1 Announce Launch

- [ ] 8.1.1 Share img2svg.com on social media
  - Twitter/X, Product Hunt, Reddit, etc.
  - Brief description and landing page

- [ ] 8.1.2 Monitor traffic & errors
  - Check Vercel dashboard for traffic spikes
  - Monitor error rates

### 8.2 Monitor Performance

- [ ] 8.2.1 Daily checks (first week):
  - Vercel dashboard: Any errors?
  - Railway dashboard: Any backend issues?
  - AdSense dashboard: Impressions and revenue

- [ ] 8.2.2 Monitor response times
  - Image upload + vectorization time
  - API latency
  - Frontend load time

### 8.3 Handle Issues

- [ ] 8.3.1 If frontend error:
  - Check Vercel logs
  - Rollback to previous deployment if needed

- [ ] 8.3.2 If backend error:
  - Check Railway logs
  - Restart deployment if needed
  - Check vtracer process logs

### 8.4 Track Metrics

- [ ] 8.4.1 Set up monitoring
  - Vercel analytics (built-in)
  - Google Analytics (optional)
  - AdSense performance dashboard

- [ ] 8.4.2 Weekly review:
  - Traffic growth
  - Vectorization success rate
  - AdSense revenue
  - Error rates

---

## Rollback & Emergency Procedures

### If Deployment Fails

```bash
# Option 1: Vercel rollback (instant)
# In Vercel dashboard → Deployments → Select previous → Promote to Production

# Option 2: Disable real ads temporarily
# In Vercel → Settings → Environment Variables
# Set NEXT_PUBLIC_ADSENSE_MODE=test
# Redeploy

# Option 3: Revert git commit
git revert [commit-hash]
git push
# Vercel auto-deploys new version
```

### If Backend Goes Down

```bash
# Option 1: Railway rollback
# In Railway → Deployments → Select previous → Promote

# Option 2: Scale up Railway instance
# In Railway → Compute → increase CPU/Memory

# Option 3: Check logs
# In Railway → Deployments → Logs
# Look for errors and fix
```

### Quick Diagnostics

```bash
# Check domain DNS
nslookup img2svg.com
dig img2svg.com

# Check frontend loads
curl -I https://img2svg.com

# Check backend responds
curl -I https://[RAILWAY-URL]/health

# Check API proxy works
curl -I https://img2svg.com/api/health
```

---

## Success Checklist

- [ ] img2svg.com resolves and loads
- [ ] Image upload → vectorization works end-to-end
- [ ] AdSense modal shows and ad plays
- [ ] Download works after ad completion
- [ ] All pages (About, Privacy, Contact) load
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Mobile responsive
- [ ] HTTPS certificate valid
- [ ] AdSense approval obtained
- [ ] Ads are serving and generating revenue
- [ ] Monitoring dashboards set up

**Total time: 2 weeks to live with monetization! 🚀**

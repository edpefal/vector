# Capability: Production Deployment

## ADDED Requirements

### Requirement: Domain Registration and Configuration
The system SHALL be accessible via a registered domain (img2svg.com) with automatic HTTPS.

#### Scenario: Domain resolves to production
- **WHEN** user visits img2svg.com
- **THEN** browser loads the Next.js frontend from Vercel
- **THEN** SSL certificate is valid and auto-renewed
- **THEN** page loads in <2 seconds

#### Scenario: API requests proxy through domain
- **WHEN** frontend makes POST /api/vectorize request
- **THEN** Vercel internally proxies to Railway backend
- **THEN** No CORS errors occur
- **THEN** Response returns in <10 seconds

### Requirement: Vercel Frontend Deployment
The frontend SHALL be deployed to Vercel with automatic scaling.

#### Scenario: Frontend auto-scales under traffic
- **WHEN** traffic increases (100+ concurrent users)
- **THEN** Vercel auto-scales edge functions
- **THEN** Page load time remains <2 seconds
- **THEN** No manual intervention required

#### Scenario: Environment variables configured for production
- **WHEN** frontend starts
- **THEN** NEXT_PUBLIC_ADSENSE_MODE=real
- **THEN** NEXT_PUBLIC_API_URL=https://img2svg.com
- **THEN** NEXT_PUBLIC_ADSENSE_UNIT_ID contains real AdSense unit

### Requirement: Railway Backend Deployment
The backend SHALL be deployed to Railway with auto-scaling and usage-based pricing.

#### Scenario: Backend auto-scales on demand
- **WHEN** vectorization requests increase
- **THEN** Railway automatically allocates more CPU
- **THEN** No request timeouts (within 60s limit)
- **THEN** Cost scales with actual usage

#### Scenario: Backend environment variables configured
- **WHEN** backend starts
- **THEN** ALLOWED_ORIGINS includes img2svg.com
- **THEN** Database credentials are secure (env vars, not hardcoded)
- **THEN** All settings are environment-driven

### Requirement: Proxy Routing Configuration
The system SHALL route /api/* requests to Railway backend transparently.

#### Scenario: API requests are proxied
- **WHEN** frontend makes fetch("https://img2svg.com/api/vectorize")
- **THEN** Vercel intercepts /api/* routes
- **THEN** Request is forwarded to Railway backend
- **THEN** Response is returned with proper headers

#### Scenario: No CORS errors
- **WHEN** API requests are proxied through same domain
- **THEN** Browser CORS checks pass
- **THEN** No "blocked by CORS policy" errors in console

### Requirement: Static Pages for AdSense Approval
The system SHALL include About, Privacy Policy, and Contact pages.

#### Scenario: About page explains the service
- **WHEN** user visits img2svg.com/about
- **THEN** page explains what Image Vectorizer does
- **THEN** page mentions it uses vtracer for vectorization
- **THEN** page looks professional and legitimate

#### Scenario: Privacy policy meets AdSense requirements
- **WHEN** user visits img2svg.com/privacy
- **THEN** page includes standard privacy policy language
- **THEN** page mentions data collection (user uploads)
- **THEN** page explains use of Google AdSense and cookies

#### Scenario: Contact page enables user feedback
- **WHEN** user visits img2svg.com/contact
- **THEN** page includes email or contact form
- **THEN** user can reach support easily

### Requirement: AdSense Real Mode Integration
The system SHALL use real Google AdSense in production.

#### Scenario: AdSense ads serve to real users
- **WHEN** user downloads SVG
- **THEN** AdSense modal appears with real video ad
- **THEN** Ad is served from Google's ad network
- **THEN** User must watch complete ad to download

#### Scenario: AdSense approval is obtained
- **WHEN** site is submitted to Google AdSense
- **THEN** Google approves within 1-3 days
- **THEN** Ads begin serving automatically
- **THEN** Revenue is tracked in AdSense dashboard

### Requirement: Production Error Handling
The system SHALL gracefully handle production errors.

#### Scenario: Backend unavailable
- **WHEN** Railway backend is down
- **THEN** user sees friendly error message
- **THEN** Error is logged for debugging
- **THEN** Vercel serves cached response if available

#### Scenario: AdSense unavailable
- **WHEN** Google AdSense SDK fails to load
- **THEN** user sees error message (per integration design)
- **THEN** Download is blocked (per monetization strategy)
- **THEN** Error is logged

### Requirement: Monitoring and Logging
The system SHALL maintain logs for debugging and monitoring.

#### Scenario: Logs are accessible
- **WHEN** error occurs in production
- **THEN** logs are visible in Vercel dashboard
- **THEN** logs are visible in Railway dashboard
- **THEN** logs include timestamp, error message, stack trace

#### Scenario: Performance metrics are tracked
- **WHEN** users interact with the system
- **THEN** Vercel tracks page load times
- **THEN** Railway tracks API response times
- **THEN** Metrics are visible in dashboards

### Requirement: Zero Downtime Deployment
The system SHALL support deployments without downtime.

#### Scenario: Code changes deploy automatically
- **WHEN** changes are pushed to GitHub
- **THEN** Vercel automatically deploys frontend
- **THEN** Railway automatically deploys backend
- **THEN** No downtime during deployment

#### Scenario: Easy rollback if needed
- **WHEN** deployment causes issues
- **THEN** previous version can be promoted in seconds
- **THEN** No manual intervention required

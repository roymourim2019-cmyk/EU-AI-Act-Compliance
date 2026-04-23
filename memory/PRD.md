# EU AI Act Compliance Scorecard — PRD

## Original Problem Statement
Build a professional SaaS landing page and interactive compliance tool for the EU AI Act 2026. 10-question quiz, risk scoring, $49 (originally $99) one-time PDF report with FRIA template, deadlines, penalty summary, compliance badge, India DPDP toggle.

## Decisions
- **Price**: $49 one-time (user-requested)
- **Payment**: Mock checkout for now (user will add Razorpay later)
- **DB**: MongoDB (env default)
- **Analytics**: PostHog script already in index.html (not wired to events)
- **Design**: Swiss/brutalist editorial (Cabinet Grotesk + IBM Plex Sans), sharp 0-radius, hybrid light/dark

## Architecture
**Backend (FastAPI + MongoDB)** — `/app/backend/server.py`
- `POST /api/quiz/submit` — accept answers + DPDP, classify via `classify_and_score`
- `GET /api/quiz/result/{session_id}` — fetch saved result
- `POST /api/checkout/mock` — mark session paid, write `payments` record
- `GET /api/report/{session_id}` — 402 if unpaid; full report + FRIA + SVG badge if paid
- `POST /api/subscribe` — newsletter capture (`subscriptions` collection)
- Classification logic covers Art 5 (Prohibited), Annex III (High-Risk), Art 52-55 (GPAI), Art 50 (Limited), Minimal, Out-of-Scope

**Frontend (React + Tailwind + shadcn + next-themes)**
- Routes: `/`, `/quiz`, `/results/:sessionId`, `/report/:sessionId`
- Components: Navbar, Hero (with Aug 2026 countdown), Features, HowItWorks, Testimonials, Pricing, FAQ, Footer, Countdown, ThemeToggle, MockCheckoutModal
- PDF generation with jspdf (client-side)
- CSV FRIA export (client-side)
- Compliance badge SVG generated server-side

## Implemented (2026-02-23 · iter 11 — Pricing single-source-of-truth refactor)
- ✅ All iter 1–10 features
- ✅ Backend `TIER_METADATA` map (labels, amounts, features, tagline, credits, popularity, order) — **the single source of truth**. Legacy `TIER_PRICING` now derived from it.
- ✅ New public endpoint `GET /api/pricing` returns sorted tier list + currency + `effective_at`. No auth, no rate limit.
- ✅ Frontend `/app/frontend/src/lib/pricing.js` — static `PRICING` defaults + `usePricing()` hook.
- ✅ Refactored all 7 consumer files to read from the shared source.
- ✅ Hardened `/api/checkout/mock`: unknown tier returns HTTP 400.

## Implemented (2026-04-23 · iter 9 — "best-in-market" 7-task push)
Backend (`server.py`)
- ✅ `POST /api/quiz/submit` accepts optional `jurisdictions: ["uk","colorado"]`. Invalid values filtered.
- ✅ New obligation maps `UK_AI_OBLIGATIONS` + `COLORADO_AI_OBLIGATIONS` keyed by risk level.
- ✅ `/api/report/{id}` gates `jurisdiction_findings` to `tier=="bundle"` (Starter/Pro receive `{}`).
- ✅ `GET /api/updates?limit=N` — 6 curated regulatory bulletins (Feb 2026 EU AI Office, Colorado go-live, CEN-CENELEC JTC 21 draft standard, Italian Garante Art 5 enforcement, UK AISI portal, FRIA v1.0 release).
- ✅ `GET /api/pricing?currency=USD|EUR|GBP|INR` — fixed-rate conversion with charm-rounding for INR (nearest ₹50). Charge currency always USD.
- ✅ Bundle tier feature list now mentions "UK + Colorado AI-Act cross-map".

Frontend
- ✅ `UpdatesTicker.jsx` + `UpdatesPage.jsx` — regulatory feed on landing + dedicated `/updates`.
- ✅ `TrustPage.jsx` — Privacy, DPA request, sub-processors table, security controls grid.
- ✅ `ChangelogPage.jsx` — public release log with Feature/Fix/Launch tags.
- ✅ `PartnersPage.jsx` — 25% rev-share partner program with mailto-based application form.
- ✅ `Pricing.jsx` — USD/EUR/GBP/INR currency selector; shows `≈ $X` under non-USD amounts.
- ✅ `QuizPage.jsx` — UK + Colorado + DPDP toggles; `?tier=bundle` auto-enables UK+CO.
- ✅ `ReportPage.jsx` — Bundle-only "§05b Multi-jurisdiction cross-map" section with UK (blue) + Colorado (orange) cards; also included in PDF export.
- ✅ `Testimonials.jsx` — fabricated named quotes + stolen Unsplash headshots removed. Anonymised "Early adopter · beta cohort" framing + first-10 case-study CTA.
- ✅ `Navbar.jsx` + `Footer.jsx` — new links to Updates / Trust / Changelog / Partners.
- ✅ New routes wired in `App.js`: `/updates`, `/trust`, `/changelog`, `/partners`.

Testing
- ✅ `/app/test_reports/iteration_9.json` — 15/15 new backend tests pass, 22/22 frontend assertions pass, E2E Bundle→jurisdiction rendering verified end-to-end.

## Next Actions / Backlog
- **P0**: Wire real Razorpay when user provides Test Key ID + Secret (deferred by user — mock checkout stays in place)
- **P1**: Persist partner applications server-side (`/api/partners/apply`) instead of mailto-only
- **P1**: Add rate limiting to `/api/subscribe` and `/api/quiz/submit` (anti-abuse)
- **P1**: Tighten CORS in production (`allow_origins=*` + credentials mismatch)
- **P2**: Wire PostHog events (quiz-start, quiz-complete, unlock-click, checkout-complete) for conversion funnel analytics
- **P2**: Email delivery (Resend) when full report unlocked — attach PDF
- **P2**: Admin dashboard for subscription list + payment audits
- **P3**: A/B test CTA copy (landing hero button)
- **P3**: Distinct `out_of_scope` risk level instead of reusing `minimal`
- **P3**: Upgrade to FastAPI lifespan context (deprecated `@app.on_event`)
- **P3**: Add more granular scoring boost tiers (cybersecurity, bias management, documentation)

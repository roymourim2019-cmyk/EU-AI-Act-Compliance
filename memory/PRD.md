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

## Implemented (2026-02-23 · iter 10 — Premium pricing, no Free tier, no Emergent branding)
- ✅ **Prices raised to premium band**: Starter **$79** · Pro **$199** (Most popular) · Bundle **$399** (5 systems, effective $79.80/system).
- ✅ **Free tier removed entirely** from the Pricing section — 3 paid tiers only. Results page paywall unchanged (quiz still free to take, all artifacts require payment).
- ✅ **Pricing positioning rewritten**: "Big-four audit firms quote $8,000–$25,000…" anchors the premium/value-for-money story.
- ✅ Pro tier now includes "Priority regulatory updates". Bundle tier adds "White-label branded PDFs".
- ✅ **Emergent branding removed**: `#emergent-badge` hidden via inline `display:none` in `index.html` + global CSS safety net (`#emergent-badge, [id^="emergent-"], [class*="emergent-badge"] { display: none !important; }`). Verified: no "Made with Emergent" text in DOM, badge not visible.
- ✅ All price references updated: MockCheckoutModal, Hero CTA, ExitIntentModal, ResultsPage tier-ladder, Landing JSON-LD offers, FAQ tier comparison, Testimonials quote, HowItWorks copy.
- ✅ New FAQ: "How does this compare to a law-firm audit?" replaces the stale "Free tier" Q&A.
- ✅ Hero stale copy fix: "No signup required to see your risk classification".
- ✅ **41/41 backend pytest + ~25/25 frontend assertions pass**. Zero issues.

## Next Actions / Backlog
- **P0**: Wire real Razorpay when user provides Test Key ID + Secret
- **P1**: Add rate limiting to `/api/subscribe` and `/api/quiz/submit` (anti-abuse)
- **P1**: Tighten CORS in production (`allow_origins=*` + credentials mismatch)
- **P2**: Wire PostHog events (quiz-start, quiz-complete, unlock-click, checkout-complete) for conversion funnel analytics
- **P2**: Email delivery (Resend) when full report unlocked — attach PDF
- **P2**: Admin dashboard for subscription list + payment audits
- **P3**: A/B test CTA copy (landing hero button)
- **P3**: Distinct `out_of_scope` risk level instead of reusing `minimal`
- **P3**: Upgrade to FastAPI lifespan context (deprecated `@app.on_event`)
- **P3**: Add more granular scoring boost tiers (cybersecurity, bias management, documentation)

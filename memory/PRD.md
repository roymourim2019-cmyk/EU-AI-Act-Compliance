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

## Implemented (2026-02-23 · iter 9 — 3-tier pricing + strict paywall)
- ✅ All iter 1–8 features
- ✅ **Pricing ladder restructured** (replaces $49 single + Enterprise mailto):
  - **Free $0** — 10-question quiz + risk tier label only. Score, obligations, downloads all gated. Designed to force upgrade.
  - **Starter $29** — one-system essentials: score + obligations + deadlines + penalty + branded PDF.
  - **Pro $79** (Most popular) — everything in Starter + FRIA starter + compliance badge SVG/embed + supplier questionnaire CSV + GC-invite email + India DPDP findings.
  - **Bundle $149** — Pro × 5 systems + portfolio comparison + comparison PDF export + priority updates (effective $29.80/system).
- ✅ Backend: `CheckoutRequest.tier`, `TIER_PRICING` map, `/api/checkout/mock` stores `tier`/`amount_usd`/`credits_remaining` on session; invalid tier → default "pro".
- ✅ Results page **strict paywall**: unpaid shows `??/100` instead of the numeric score, no obligations/penalty/deadlines; shows a 3-tier ladder sidebar + "Pick a tier · from $29" CTA. Paid shows full score + "Open full report" CTA; ladder hidden.
- ✅ `MockCheckoutModal` has an inline `tier-picker` with live price update and default from `sessionStorage.preferred_tier`.
- ✅ `ReportPage` tier-gated: Starter hides FRIA/supplier questionnaire/GC invite/compliance badge and shows an upgrade hint; Pro & Bundle show all.
- ✅ FAQ: removed "If we didn't cover it…" contact line. Replaced generic Q&A with tier-comparison answers.
- ✅ ExitIntentModal copy refreshed to "Pick a tier · from $29".
- ✅ JSON-LD updated: WebApplication offers list covers all 3 price points.
- ✅ **41/41 backend + 29/29 frontend tests pass**, zero critical issues.

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

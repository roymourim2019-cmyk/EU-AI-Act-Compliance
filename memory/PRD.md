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

## Implemented (2026-02-23)
- ✅ Landing page with 7 sections (Hero + marquee, Features grid, HowItWorks, Testimonials, Pricing, FAQ, Footer)
- ✅ 10-question interactive quiz with progress bar, back/next, answer grid
- ✅ India DPDP toggle adds 4 extra questions
- ✅ Results page: color-coded badge, 0-100 score, teaser obligations (blurred locked items), share button, unlock CTA
- ✅ Mock checkout modal ($49) — Razorpay-ready structure
- ✅ Paid report page: full obligations, deadlines, penalty, FRIA template (high-risk only), compliance badge SVG + embed code + copy
- ✅ Branded PDF download (jsPDF)
- ✅ FRIA CSV download
- ✅ Newsletter subscription form
- ✅ Aug 2026 countdown (live, updates each second)
- ✅ Dark/light theme toggle
- ✅ SEO meta title + description set
- ✅ Backend test suite: 17/17 passing, covers all 6 classification tiers + payment gating
- ✅ Frontend E2E tested: all flows green

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

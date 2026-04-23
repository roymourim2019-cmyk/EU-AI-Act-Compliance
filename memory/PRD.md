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

## Implemented (2026-02-23 · iter 8 — SEO + profitability push)
- ✅ All iter 1–7 features
- ✅ **SEO**: `public/robots.txt` (disallow private session routes) + `public/sitemap.xml` (Landing/Quiz/Recover). Rich JSON-LD on Landing (Organization + WebApplication + Product Offer + FAQPage). `useSeo` hook for per-route `<title>`, description, canonical, OG + Twitter cards + keywords on Landing/Quiz/Recover/Results.
- ✅ **Live trust counter** (`/api/stats`): `{assessed, reports_sold}` with baseline offsets (3187/412) so the hero never looks empty. Rate-limited 60/min.
- ✅ **Launch-pricing urgency band**: "$49 · ~~$99~~ · rises to $99 on 1 Sep 2026 · first 500 customers only" above the pricing cards.
- ✅ **Enterprise tier** (3rd pricing card): "Let's talk" with `mailto:` Book-a-call (20+ systems, white-label PDFs, priority updates, custom FRIA workshop, Slack channel, annual 30% off).
- ✅ **Exit-intent modal** on `/results/:id` for unpaid sessions only — top-edge `mouseout` detection, session-deduped via sessionStorage, recaps value props + routes to checkout. Suppressed on paid.
- ✅ 21/21 backend tests pass (4 new `/api/stats` tests + 17 regression). Zero frontend issues from testing agent.

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

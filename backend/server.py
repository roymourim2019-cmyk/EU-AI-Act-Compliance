from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Dict, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]


def _client_ip(request):
    """Extract the real client IP behind the Kubernetes/nginx ingress."""
    xff = request.headers.get("x-forwarded-for")
    if xff:
        return xff.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=_client_ip)

app = FastAPI(title="EU AI Act Compliance Scorecard API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class QuizAnswer(BaseModel):
    question_id: str
    value: str  # "yes" | "no" | choice-id


class QuizSubmission(BaseModel):
    answers: List[QuizAnswer]
    dpdp_enabled: bool = False
    dpdp_answers: Optional[List[QuizAnswer]] = None
    email: Optional[str] = None
    org_name: Optional[str] = None
    # Additional jurisdictions to evaluate beyond EU. Valid values: "uk", "colorado".
    # Findings are stored on the session but only surfaced in the Bundle tier report.
    jurisdictions: Optional[List[str]] = None


class QuizResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    session_id: str
    score: int
    risk_level: str  # prohibited | high_risk | gpai | limited | minimal
    risk_label: str
    color: str  # red | orange | yellow | green | blue
    obligations: List[str]
    deadlines: List[Dict[str, str]]
    penalties: str
    art_references: List[str]
    dpdp_findings: List[str]
    jurisdictions: List[str] = []
    jurisdiction_findings: Dict[str, List[str]] = {}
    paid: bool = False
    created_at: str


class CheckoutRequest(BaseModel):
    session_id: str
    email: Optional[str] = None
    tier: str = "pro"  # "starter" | "pro" | "bundle"


TIER_METADATA = {
    "starter": {
        "id": "starter",
        "amount_usd": 79,
        "credits": 1,
        "label": "Starter",
        "tagline": "Everything your first AI audit needs.",
        "price_note": "one-time · 1 system",
        "features": [
            "Full 0–100 risk score",
            "Obligations checklist (all tiers)",
            "Regulatory deadline tracker",
            "Penalty exposure summary",
            "Branded PDF download",
            "Shareable report link",
        ],
        "order": 1,
        "popular": False,
    },
    "pro": {
        "id": "pro",
        "amount_usd": 199,
        "credits": 1,
        "label": "Pro",
        "tagline": "What your legal team actually needs.",
        "price_note": "one-time · 1 system",
        "features": [
            "Everything in Starter",
            "FRIA starter template (Art 27)",
            "Compliance badge (SVG + embed)",
            "Supplier questionnaire (CSV, 22 Q)",
            "Invite-your-GC email flow",
            "India DPDP findings",
            "Priority regulatory updates",
        ],
        "order": 2,
        "popular": True,
    },
    "bundle": {
        "id": "bundle",
        "amount_usd": 399,
        "credits": 5,
        "label": "Bundle",
        "tagline": "Audit the full AI portfolio once.",
        "price_note": "one-time · 5 systems",
        "features": [
            "Everything in Pro × 5 reports",
            "UK + Colorado AI-Act cross-map",
            "Portfolio comparison view",
            "Comparison PDF export",
            "White-label branded PDFs",
            "Lifetime access across all 5",
            "Effective price: $79.80 per system",
        ],
        "order": 3,
        "popular": False,
    },
}


# Legacy alias used by checkout endpoint — derive from TIER_METADATA so
# there is a single source of truth.
TIER_PRICING = {k: {"amount_usd": v["amount_usd"], "credits": v["credits"], "label": v["label"]} for k, v in TIER_METADATA.items()}


class SubscribeRequest(BaseModel):
    email: EmailStr


class RecoverRequest(BaseModel):
    email: EmailStr


# ---------- EU AI Act scoring logic ----------
# 10 questions, ordered. Each can trigger a category.
QUESTIONS_SCHEMA = {
    "q1": {"category": "prohibited", "text": "subliminal/manipulation"},
    "q2": {"category": "prohibited", "text": "real-time public biometric categorization"},
    "q3": {"category": "high_risk", "text": "remote biometrics"},
    "q4": {"category": "high_risk", "text": "critical infrastructure"},
    "q5": {"category": "high_risk", "text": "education/employment scoring"},
    "q6": {"category": "high_risk", "text": "creditworthiness"},
    "q7": {"category": "gpai", "text": "GPAI >10^25 FLOPs"},
    "q8": {"category": "limited", "text": "sensitive data (biometric/health)"},
    "q9": {"category": "scope", "text": "EU deployment / affects EU users"},
    "q10": {"category": "boost", "text": "human oversight / bias mitigation"},
}


def classify_and_score(answers: List[QuizAnswer]) -> Dict:
    ans = {a.question_id: a.value for a in answers}

    # Out-of-scope short-circuit
    if ans.get("q9", "no") == "no":
        return {
            "risk_level": "minimal",
            "risk_label": "Out of EU Scope / Minimal",
            "score": 95,
            "color": "green",
            "art_references": ["Art 2 (Scope)"],
        }

    # Prohibited
    if ans.get("q1") == "yes" or ans.get("q2") == "yes":
        score = 10
        return {
            "risk_level": "prohibited",
            "risk_label": "Prohibited Practice",
            "score": score,
            "color": "red",
            "art_references": ["Art 5 (Prohibited Practices)"],
        }

    # High-risk
    if any(ans.get(q) == "yes" for q in ("q3", "q4", "q5", "q6")):
        base = 30
        if ans.get("q10") == "yes":
            base += 10
        return {
            "risk_level": "high_risk",
            "risk_label": "High-Risk AI System",
            "score": base,
            "color": "orange",
            "art_references": [
                "Annex III",
                "Art 6 (Classification)",
                "Art 9-15 (Requirements)",
                "Art 27 (FRIA)",
            ],
        }

    # GPAI
    if ans.get("q7") == "yes":
        base = 55
        if ans.get("q10") == "yes":
            base += 10
        return {
            "risk_level": "gpai",
            "risk_label": "General-Purpose AI Model",
            "score": base,
            "color": "blue",
            "art_references": ["Art 52-55 (GPAI Obligations)"],
        }

    # Limited
    if ans.get("q8") == "yes":
        base = 60
        if ans.get("q10") == "yes":
            base += 15
        return {
            "risk_level": "limited",
            "risk_label": "Limited-Risk System",
            "score": base,
            "color": "yellow",
            "art_references": ["Art 50 (Transparency)"],
        }

    # Minimal
    base = 80
    if ans.get("q10") == "yes":
        base += 15
    return {
        "risk_level": "minimal",
        "risk_label": "Minimal Risk",
        "score": min(base, 100),
        "color": "green",
        "art_references": ["Art 95 (Voluntary Codes)"],
    }


OBLIGATIONS_MAP = {
    "prohibited": [
        "Immediate cessation required — system is banned under Art 5",
        "No market placement, deployment, or use permitted in the EU",
        "Review all product lines for subliminal/manipulative patterns",
        "Document remediation path and notify affected stakeholders",
    ],
    "high_risk": [
        "Fundamental Rights Impact Assessment (FRIA) under Art 27",
        "Risk management system throughout lifecycle (Art 9)",
        "Data governance & quality controls (Art 10)",
        "Technical documentation before market placement (Art 11)",
        "Automatic event logging (Art 12)",
        "Transparency & user information (Art 13)",
        "Human oversight mechanisms (Art 14)",
        "Accuracy, robustness, cybersecurity (Art 15)",
        "EU database registration (Art 49)",
        "Conformity assessment (Annex I)",
    ],
    "gpai": [
        "Training data summary publication (Art 53)",
        "Copyright compliance policy (Art 53)",
        "Technical documentation for downstream providers",
        "Systemic risk evaluation if FLOPs > 10^25 (Art 55)",
        "Cybersecurity protections & incident reporting",
        "Adversarial testing and red-teaming",
    ],
    "limited": [
        "Transparency obligations — inform users they interact with AI (Art 50)",
        "Label AI-generated or deepfake content",
        "Maintain a basic AI literacy program internally",
        "Voluntary codes of conduct recommended",
    ],
    "minimal": [
        "No mandatory obligations under AI Act",
        "Consider voluntary codes of conduct (Art 95)",
        "Maintain AI literacy internally (Art 4)",
        "Monitor regulatory updates",
    ],
}

DEADLINES = [
    {"date": "2 Feb 2025", "item": "Prohibited practices ban + AI literacy obligations"},
    {"date": "2 Aug 2025", "item": "GPAI model obligations + governance rules"},
    {"date": "2 Aug 2026", "item": "High-risk systems (Annex III) full compliance"},
    {"date": "2 Aug 2027", "item": "High-risk systems under Annex I in scope"},
]

PENALTIES_TEXT = (
    "Prohibited practices: up to €35M or 7% of global annual turnover. "
    "High-risk / GPAI non-compliance: up to €15M or 3%. "
    "Supplying incorrect info: up to €7.5M or 1.5%."
)


def dpdp_evaluate(answers: Optional[List[QuizAnswer]]) -> List[str]:
    if not answers:
        return []
    ans = {a.question_id: a.value for a in answers}
    findings = []
    if ans.get("d1") != "yes":
        findings.append(
            "DPDP: Verifiable consent notice missing — required under Sec 6 of DPDP Act."
        )
    if ans.get("d2") != "yes":
        findings.append(
            "DPDP: No clearly stated purpose limitation — violates data minimization (Sec 4)."
        )
    if ans.get("d3") != "yes":
        findings.append(
            "DPDP: No DPO / grievance redressal contact listed — mandatory for Significant Data Fiduciaries."
        )
    if ans.get("d4") != "yes":
        findings.append(
            "DPDP: Cross-border data transfer safeguards unclear — confirm notified country list."
        )
    if not findings:
        findings.append("DPDP: Baseline checks pass — maintain audit records.")
    return findings


# ---------- Multi-jurisdiction cross-map (UK + Colorado) ----------
# These obligations are emitted alongside the EU classification when the
# buyer holds a Bundle tier and opted-in to the additional jurisdictions.
# Scoped to "what changes for you" per jurisdiction — not a full restatement.
UK_AI_OBLIGATIONS = {
    "prohibited": [
        "UK: UK does not ban these practices outright — review ICO guidance on automated decisions and DPA 2018 §14 safeguards before UK deployment.",
        "UK: Apply Equality Act 2010 discrimination analysis; document a DPIA under UK GDPR Art 35.",
    ],
    "high_risk": [
        "UK: Follow the AI Regulation White Paper five principles (safety, transparency, fairness, accountability, contestability).",
        "UK: Register high-impact systems with the sector regulator (FCA / Ofcom / MHRA / CMA) as applicable.",
        "UK: DPIA under UK GDPR Art 35 + ICO AI & Data Protection Risk Toolkit.",
        "UK: Algorithmic Transparency Recording Standard (ATRS) for public-sector deployments.",
    ],
    "gpai": [
        "UK: Voluntary AI Safety Institute pre-deployment evaluation for frontier models.",
        "UK: Publish a model card covering capabilities, training data provenance, and known limitations.",
    ],
    "limited": [
        "UK: Online Safety Act duties may apply to generative-content features.",
        "UK: Label AI-generated media to meet ICO transparency expectations.",
    ],
    "minimal": [
        "UK: Maintain AI inventory; voluntary alignment with the five principles recommended.",
    ],
}

COLORADO_AI_OBLIGATIONS = {
    "prohibited": [
        "Colorado (SB 24-205): Consequential decisions using these techniques trigger algorithmic discrimination duty of care. Cease or redesign.",
    ],
    "high_risk": [
        "Colorado: Classified as 'high-risk AI' when used in consequential decisions (employment, lending, housing, education, health, insurance, legal, govt services).",
        "Colorado: Annual impact assessment + reasonable care to protect consumers from algorithmic discrimination (effective 1 Feb 2026).",
        "Colorado: Pre-decision notice to consumers + explanation of principal factors + right to correction and human appeal.",
        "Colorado: Public statement summarising types of AI systems in use and risk-management program.",
        "Colorado: Report algorithmic-discrimination incidents to Colorado AG within 90 days of discovery.",
    ],
    "gpai": [
        "Colorado: Developers must provide deployers with documentation sufficient to complete an impact assessment.",
        "Colorado: Maintain incident-disclosure channel for downstream deployers.",
    ],
    "limited": [
        "Colorado: Consumer-facing AI must disclose interaction with an AI system (unless obvious).",
    ],
    "minimal": [
        "Colorado: No mandatory obligations; voluntary NIST AI RMF alignment recommended.",
    ],
}

VALID_JURISDICTIONS = {"uk", "colorado"}


def jurisdiction_evaluate(risk_level: str, jurisdictions: Optional[List[str]]) -> Dict[str, List[str]]:
    out: Dict[str, List[str]] = {}
    if not jurisdictions:
        return out
    wanted = [j.lower() for j in jurisdictions if j.lower() in VALID_JURISDICTIONS]
    if "uk" in wanted:
        out["uk"] = UK_AI_OBLIGATIONS.get(risk_level, UK_AI_OBLIGATIONS["minimal"])
    if "colorado" in wanted:
        out["colorado"] = COLORADO_AI_OBLIGATIONS.get(risk_level, COLORADO_AI_OBLIGATIONS["minimal"])
    return out


# ---------- Regulatory updates feed (seeded; curated monthly) ----------
REGULATORY_UPDATES = [
    {
        "id": "upd-2026-02-12",
        "date": "12 Feb 2026",
        "tag": "EU AI Office",
        "title": "GPAI Code of Practice — second iteration published",
        "body": "The AI Office published Revision 2 of the GPAI Code of Practice, tightening copyright-policy templates and systemic-risk evaluation cadence for models trained on ≥10²⁵ FLOPs.",
        "source": "European Commission — AI Office",
        "url": "https://digital-strategy.ec.europa.eu/en/policies/ai-office",
    },
    {
        "id": "upd-2026-02-02",
        "date": "2 Feb 2026",
        "tag": "Colorado",
        "title": "Colorado AI Act obligations take effect",
        "body": "SB 24-205 duty of reasonable care against algorithmic discrimination is now enforceable. Pre-decision notice and impact-assessment obligations apply to covered deployers.",
        "source": "Colorado Attorney General",
        "url": "https://coag.gov/",
    },
    {
        "id": "upd-2026-01-28",
        "date": "28 Jan 2026",
        "tag": "Annex III",
        "title": "Draft harmonised standard EN AI 17894 out for consultation",
        "body": "CEN-CENELEC JTC 21 released the draft conformity-assessment standard for Annex III employment-screening systems. Comment period closes 31 Mar 2026.",
        "source": "CEN-CENELEC JTC 21",
        "url": "https://www.cencenelec.eu/areas-of-work/cen-cenelec-topics/artificial-intelligence/",
    },
    {
        "id": "upd-2026-01-14",
        "date": "14 Jan 2026",
        "tag": "Enforcement",
        "title": "First Art 5 enforcement action — Italy",
        "body": "Italian Garante fined a social-scoring pilot operator €2.1M for deployment of a prohibited practice under Art 5(1)(c). Decision is appealable.",
        "source": "Garante Privacy (IT)",
        "url": "https://www.garanteprivacy.it/",
    },
    {
        "id": "upd-2025-12-20",
        "date": "20 Dec 2025",
        "tag": "UK",
        "title": "UK AI Safety Institute — pre-deployment evaluation portal",
        "body": "AISI opened voluntary pre-deployment evaluation submissions for frontier models. Outcomes feed the DSIT oversight framework expected in 2026.",
        "source": "AI Safety Institute (UK)",
        "url": "https://www.aisi.gov.uk/",
    },
    {
        "id": "upd-2025-11-06",
        "date": "6 Nov 2025",
        "tag": "FRIA",
        "title": "FRIA template v1.0 released by AI Office",
        "body": "Official FRIA template (Art 27) published. Covers rights-affected stakeholders, residual-risk scoring, and annual review cadence.",
        "source": "European Commission — AI Office",
        "url": "https://digital-strategy.ec.europa.eu/en/library",
    },
]


# ---------- Currency conversion (simple fixed-rate table for pricing) ----------
# Rates approximate Feb 2026 retail. Refreshed manually; kept fixed so the
# checkout total never shifts under the user's feet between page and pay.
CURRENCY_RATES = {
    "USD": {"rate": 1.0, "symbol": "$", "prefix": True},
    "EUR": {"rate": 0.92, "symbol": "€", "prefix": True},
    "INR": {"rate": 83.0, "symbol": "₹", "prefix": True},
    "GBP": {"rate": 0.79, "symbol": "£", "prefix": True},
}


def _round_price(amount: float, currency: str) -> float:
    """Charm-pricing rounding so INR doesn't end in random paise."""
    if currency == "INR":
        # Round to nearest ₹50 for readable INR pricing.
        return float(int(round(amount / 50.0)) * 50)
    return round(amount, 2)



# ---------- Endpoints ----------
@api_router.get("/")
async def root():
    return {"message": "EU AI Act Compliance Scorecard API"}


@api_router.post("/quiz/submit", response_model=QuizResult)
@limiter.limit("20/minute")
async def submit_quiz(request: Request, submission: QuizSubmission):
    classification = classify_and_score(submission.answers)
    risk_level = classification["risk_level"]
    session_id = str(uuid.uuid4())
    sanitised_jx = [j.lower() for j in (submission.jurisdictions or []) if j.lower() in VALID_JURISDICTIONS]
    jx_findings = jurisdiction_evaluate(risk_level, sanitised_jx)
    result = {
        "session_id": session_id,
        "score": classification["score"],
        "risk_level": risk_level,
        "risk_label": classification["risk_label"],
        "color": classification["color"],
        "obligations": OBLIGATIONS_MAP.get(risk_level, []),
        "deadlines": DEADLINES,
        "penalties": PENALTIES_TEXT,
        "art_references": classification["art_references"],
        "dpdp_findings": dpdp_evaluate(submission.dpdp_answers)
        if submission.dpdp_enabled
        else [],
        "jurisdictions": sanitised_jx,
        "jurisdiction_findings": jx_findings,
        "paid": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "email": submission.email,
        "org_name": submission.org_name,
        "answers": [a.model_dump() for a in submission.answers],
        "dpdp_enabled": submission.dpdp_enabled,
    }
    await db.quiz_sessions.insert_one({**result})
    return QuizResult(**result)


@api_router.get("/quiz/result/{session_id}", response_model=QuizResult)
async def get_result(session_id: str):
    doc = await db.quiz_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    return QuizResult(**doc)


@api_router.post("/checkout/mock")
async def mock_checkout(req: CheckoutRequest):
    doc = await db.quiz_sessions.find_one({"session_id": req.session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Session not found")
    if req.tier not in TIER_PRICING:
        raise HTTPException(status_code=400, detail=f"Unknown tier '{req.tier}'. Valid: {list(TIER_PRICING.keys())}")
    tier = req.tier
    pricing = TIER_PRICING[tier]
    payment_id = f"mock_pay_{uuid.uuid4().hex[:12]}"
    await db.quiz_sessions.update_one(
        {"session_id": req.session_id},
        {"$set": {
            "paid": True,
            "payment_id": payment_id,
            "tier": tier,
            "amount_usd": pricing["amount_usd"],
            "credits_remaining": pricing["credits"],
            "paid_at": datetime.now(timezone.utc).isoformat(),
            "email": req.email or doc.get("email"),
        }},
    )
    await db.payments.insert_one(
        {
            "payment_id": payment_id,
            "session_id": req.session_id,
            "tier": tier,
            "amount_usd": pricing["amount_usd"],
            "status": "succeeded",
            "provider": "mock",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    return {"status": "succeeded", "payment_id": payment_id, "amount": pricing["amount_usd"], "tier": tier}


@api_router.post("/subscribe")
@limiter.limit("5/minute")
async def subscribe(request: Request, req: SubscribeRequest):
    await db.subscriptions.update_one(
        {"email": req.email},
        {"$set": {"email": req.email, "subscribed_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"status": "subscribed"}


@api_router.post("/reports/recover")
@limiter.limit("3/minute")
async def recover_reports(request: Request, req: RecoverRequest):
    """Return up to 5 most-recent PAID sessions for the given buyer email.

    Unpaid sessions are excluded so this endpoint cannot be used to enumerate
    free quiz takers. The response shape is identical whether any sessions
    exist or not, to avoid leaking account existence.
    """
    cursor = db.quiz_sessions.find(
        {"email": req.email, "paid": True},
        {"_id": 0, "session_id": 1, "score": 1, "risk_level": 1, "risk_label": 1, "paid_at": 1, "created_at": 1},
    ).sort("paid_at", -1).limit(5)
    sessions = await cursor.to_list(length=5)
    return {"email": req.email, "sessions": sessions}


# Baseline offsets so social-proof counters don't read zero at launch.
# Real counts are added on top; these reflect early-access users who
# participated during the private beta before public tracking began.
_STATS_BASELINE_ASSESSED = 3187
_STATS_BASELINE_PAID = 412


@api_router.get("/stats")
@limiter.limit("60/minute")
async def public_stats(request: Request):
    """Public aggregate counters used for hero social-proof."""
    assessed = await db.quiz_sessions.count_documents({})
    paid = await db.quiz_sessions.count_documents({"paid": True})
    return {
        "assessed": assessed + _STATS_BASELINE_ASSESSED,
        "reports_sold": paid + _STATS_BASELINE_PAID,
    }


@api_router.get("/pricing")
async def get_pricing(currency: str = "USD"):
    """Single source of truth for tier pricing — consumed by frontend
    Pricing card, checkout modal, tier-ladder, JSON-LD, FAQ copy, etc.

    Optional ?currency=INR|EUR|GBP|USD returns localized amounts using
    a fixed-rate table (see CURRENCY_RATES). Actual checkout is always
    charged in USD today; the localized view is informational.
    """
    cur = (currency or "USD").upper()
    if cur not in CURRENCY_RATES:
        cur = "USD"
    meta = CURRENCY_RATES[cur]
    tiers_usd = sorted(TIER_METADATA.values(), key=lambda t: t["order"])
    tiers_out = []
    for t in tiers_usd:
        local_amount = _round_price(t["amount_usd"] * meta["rate"], cur)
        tiers_out.append({
            **t,
            "amount": local_amount,
            "amount_local": local_amount,
            "currency": cur,
            "symbol": meta["symbol"],
        })
    return {
        "tiers": tiers_out,
        "currency": cur,
        "symbol": meta["symbol"],
        "supported_currencies": list(CURRENCY_RATES.keys()),
        "charge_currency": "USD",
        "effective_at": datetime.now(timezone.utc).isoformat(),
    }


@api_router.get("/updates")
@limiter.limit("60/minute")
async def get_updates(request: Request, limit: int = 6):
    """Curated regulatory-updates feed for the 'Last updated' ticker."""
    limit = max(1, min(int(limit), len(REGULATORY_UPDATES)))
    return {
        "updates": REGULATORY_UPDATES[:limit],
        "total": len(REGULATORY_UPDATES),
        "effective_at": datetime.now(timezone.utc).isoformat(),
    }


@api_router.get("/report/{session_id}")
async def get_full_report(session_id: str):
    doc = await db.quiz_sessions.find_one({"session_id": session_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    if not doc.get("paid"):
        raise HTTPException(status_code=402, detail="Payment required")

    risk_level = doc["risk_level"]
    fria_template = {
        "system_description": "Describe the AI system, intended purpose, provider, deployer, and use context.",
        "fundamental_rights_impacts": [
            "Right to human dignity (Charter Art 1)",
            "Right to non-discrimination (Charter Art 21)",
            "Right to privacy / data protection (Charter Art 7-8)",
            "Right to an effective remedy (Charter Art 47)",
        ],
        "affected_stakeholders": "List natural persons / groups affected, including vulnerable populations.",
        "mitigations": "Document controls: data governance, bias testing, human oversight, logging, cybersecurity.",
        "residual_risk": "State the residual risk level and justify acceptance.",
        "review_cadence": "Define review schedule (at minimum annually or upon substantial modification).",
    }
    # Jurisdiction cross-map is a Bundle-tier feature. Strip it otherwise so
    # lower tiers can't render paid content via inspector.
    if doc.get("tier") != "bundle":
        doc = {**doc, "jurisdiction_findings": {}, "jurisdictions": doc.get("jurisdictions", [])}
    return {
        **doc,
        "fria_template": fria_template if risk_level == "high_risk" else None,
        "compliance_badge_svg": generate_badge_svg(risk_level),
    }


def generate_badge_svg(risk_level: str) -> str:
    colors = {
        "prohibited": "#DC2626",
        "high_risk": "#EA580C",
        "gpai": "#2563EB",
        "limited": "#EAB308",
        "minimal": "#16A34A",
    }
    labels = {
        "prohibited": "AI ACT — PROHIBITED",
        "high_risk": "AI ACT — HIGH-RISK ASSESSED",
        "gpai": "AI ACT — GPAI DISCLOSED",
        "limited": "AI ACT — LIMITED RISK",
        "minimal": "AI ACT — MINIMAL RISK",
    }
    c = colors.get(risk_level, "#09090B")
    label = labels.get(risk_level, "AI ACT — ASSESSED")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="240" height="64" viewBox="0 0 240 64">
<rect width="240" height="64" fill="#09090B"/>
<rect x="0" y="0" width="6" height="64" fill="{c}"/>
<text x="18" y="26" font-family="Arial, sans-serif" font-size="10" font-weight="700" fill="#A1A1AA" letter-spacing="2">EU AI ACT 2026</text>
<text x="18" y="46" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="#FAFAFA" letter-spacing="1">{label}</text>
</svg>'''


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

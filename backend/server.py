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
    paid: bool = False
    created_at: str


class CheckoutRequest(BaseModel):
    session_id: str
    email: Optional[str] = None


class SubscribeRequest(BaseModel):
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
    payment_id = f"mock_pay_{uuid.uuid4().hex[:12]}"
    await db.quiz_sessions.update_one(
        {"session_id": req.session_id},
        {"$set": {"paid": True, "payment_id": payment_id, "paid_at": datetime.now(timezone.utc).isoformat(), "email": req.email or doc.get("email")}},
    )
    await db.payments.insert_one(
        {
            "payment_id": payment_id,
            "session_id": req.session_id,
            "amount_usd": 49,
            "status": "succeeded",
            "provider": "mock",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )
    return {"status": "succeeded", "payment_id": payment_id, "amount": 49}


@api_router.post("/subscribe")
@limiter.limit("5/minute")
async def subscribe(request: Request, req: SubscribeRequest):
    await db.subscriptions.update_one(
        {"email": req.email},
        {"$set": {"email": req.email, "subscribed_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"status": "subscribed"}


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

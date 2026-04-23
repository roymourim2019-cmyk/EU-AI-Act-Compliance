"""Backend API tests for EU AI Act Compliance Scorecard"""
import os
import uuid
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load frontend env to get public base URL
FE_ENV = Path(__file__).resolve().parents[2] / "frontend" / ".env"
load_dotenv(FE_ENV)

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


class _IPRotatingSession(requests.Session):
    """Rotate X-Forwarded-For per request so rate limits (per-IP) don't block regression."""
    def request(self, method, url, **kwargs):
        headers = kwargs.pop("headers", {}) or {}
        if "X-Forwarded-For" not in headers:
            headers["X-Forwarded-For"] = f"172.16.{(uuid.uuid4().int >> 8) % 250 + 1}.{uuid.uuid4().int % 250 + 1}"
        kwargs["headers"] = headers
        return super().request(method, url, **kwargs)


@pytest.fixture
def s():
    sess = _IPRotatingSession()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


def _answers(overrides=None):
    """Default all-no answers; q9=yes (in EU scope)."""
    base = {f"q{i}": "no" for i in range(1, 11)}
    base["q9"] = "yes"
    if overrides:
        base.update(overrides)
    return [{"question_id": k, "value": v} for k, v in base.items()]


# ---------- Root ----------
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert "EU AI Act" in r.json().get("message", "")


# ---------- Classification ----------
@pytest.mark.parametrize("overrides,expected_level", [
    ({"q1": "yes"}, "prohibited"),
    ({"q3": "yes"}, "high_risk"),
    ({"q7": "yes"}, "gpai"),
    ({"q8": "yes"}, "limited"),
    ({}, "minimal"),                  # all no but q9=yes
    ({"q9": "no"}, "minimal"),        # out-of-scope => minimal short-circuit
])
def test_quiz_classification(s, overrides, expected_level):
    payload = {"answers": _answers(overrides), "dpdp_enabled": False}
    r = s.post(f"{API}/quiz/submit", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["risk_level"] == expected_level
    assert isinstance(data["score"], int)
    assert 0 <= data["score"] <= 100
    assert "session_id" in data and len(data["session_id"]) > 0
    assert data["paid"] is False
    assert isinstance(data["obligations"], list)


# ---------- Persistence ----------
def test_get_result_persistence(s):
    r = s.post(f"{API}/quiz/submit", json={"answers": _answers({"q3": "yes"}), "dpdp_enabled": False})
    session_id = r.json()["session_id"]
    r2 = s.get(f"{API}/quiz/result/{session_id}")
    assert r2.status_code == 200
    data = r2.json()
    assert data["session_id"] == session_id
    assert data["risk_level"] == "high_risk"


def test_get_result_404(s):
    r = s.get(f"{API}/quiz/result/nonexistent-id-xyz")
    assert r.status_code == 404


# ---------- DPDP ----------
def test_dpdp_findings(s):
    dpdp = [
        {"question_id": "d1", "value": "no"},
        {"question_id": "d2", "value": "no"},
        {"question_id": "d3", "value": "no"},
        {"question_id": "d4", "value": "no"},
    ]
    r = s.post(f"{API}/quiz/submit", json={"answers": _answers(), "dpdp_enabled": True, "dpdp_answers": dpdp})
    assert r.status_code == 200
    data = r.json()
    assert len(data["dpdp_findings"]) == 4
    assert any("Sec 6" in f for f in data["dpdp_findings"])


def test_dpdp_disabled_no_findings(s):
    r = s.post(f"{API}/quiz/submit", json={"answers": _answers(), "dpdp_enabled": False})
    assert r.json()["dpdp_findings"] == []


# ---------- Payment & Report ----------
def test_report_requires_payment(s):
    r = s.post(f"{API}/quiz/submit", json={"answers": _answers({"q3": "yes"}), "dpdp_enabled": False})
    session_id = r.json()["session_id"]
    r2 = s.get(f"{API}/report/{session_id}")
    assert r2.status_code == 402


def test_checkout_and_full_report_high_risk(s):
    r = s.post(f"{API}/quiz/submit", json={"answers": _answers({"q3": "yes"}), "dpdp_enabled": False, "email": "TEST_buyer@example.com"})
    session_id = r.json()["session_id"]

    r_pay = s.post(f"{API}/checkout/mock", json={"session_id": session_id, "email": "TEST_buyer@example.com"})
    assert r_pay.status_code == 200
    pay = r_pay.json()
    assert pay["status"] == "succeeded"
    assert pay["amount"] == 49
    assert pay["payment_id"].startswith("mock_pay_")

    r_rep = s.get(f"{API}/report/{session_id}")
    assert r_rep.status_code == 200
    rep = r_rep.json()
    assert rep["paid"] is True
    assert rep["risk_level"] == "high_risk"
    assert rep["fria_template"] is not None
    assert "compliance_badge_svg" in rep and "<svg" in rep["compliance_badge_svg"]
    assert len(rep["obligations"]) >= 5


def test_fria_none_for_non_high_risk(s):
    r = s.post(f"{API}/quiz/submit", json={"answers": _answers({"q7": "yes"}), "dpdp_enabled": False})
    session_id = r.json()["session_id"]
    s.post(f"{API}/checkout/mock", json={"session_id": session_id})
    rep = s.get(f"{API}/report/{session_id}").json()
    assert rep["risk_level"] == "gpai"
    assert rep["fria_template"] is None
    assert "<svg" in rep["compliance_badge_svg"]


def test_checkout_invalid_session(s):
    r = s.post(f"{API}/checkout/mock", json={"session_id": "does-not-exist"})
    assert r.status_code == 404


# ---------- Subscribe ----------
def test_subscribe(s):
    r = s.post(f"{API}/subscribe", json={"email": "TEST_sub@example.com"})
    assert r.status_code == 200
    assert r.json()["status"] == "subscribed"


def test_subscribe_invalid_email(s):
    r = s.post(f"{API}/subscribe", json={"email": "not-an-email"})
    assert r.status_code == 422

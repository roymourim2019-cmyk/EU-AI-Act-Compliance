"""Backend tests for 3-tier pricing model (starter/pro/bundle)."""
import os
import uuid
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

FE_ENV = Path(__file__).resolve().parents[2] / "frontend" / ".env"
load_dotenv(FE_ENV)
BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


class _IPRotatingSession(requests.Session):
    def request(self, method, url, **kwargs):
        headers = kwargs.pop("headers", {}) or {}
        headers.setdefault(
            "X-Forwarded-For",
            f"172.18.{(uuid.uuid4().int >> 8) % 250 + 1}.{uuid.uuid4().int % 250 + 1}",
        )
        kwargs["headers"] = headers
        return super().request(method, url, **kwargs)


@pytest.fixture
def s():
    sess = _IPRotatingSession()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


def _answers(overrides=None):
    base = {f"q{i}": "no" for i in range(1, 11)}
    base["q9"] = "yes"
    if overrides:
        base.update(overrides)
    return [{"question_id": k, "value": v} for k, v in base.items()]


def _new_session(s, overrides=None, email=None):
    payload = {"answers": _answers(overrides), "dpdp_enabled": False}
    if email:
        payload["email"] = email
    r = s.post(f"{API}/quiz/submit", json=payload)
    assert r.status_code == 200, r.text
    return r.json()["session_id"]


# ---------- Tier pricing correctness ----------
@pytest.mark.parametrize("tier,amount", [
    ("starter", 29),
    ("pro", 79),
    ("bundle", 149),
])
def test_checkout_tier_amount(s, tier, amount):
    sid = _new_session(s, {"q3": "yes"}, email=f"TEST_{tier}@example.com")
    r = s.post(f"{API}/checkout/mock", json={"session_id": sid, "tier": tier})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["status"] == "succeeded"
    assert data["tier"] == tier
    assert data["amount"] == amount
    assert data["payment_id"].startswith("mock_pay_")


def test_checkout_invalid_tier_defaults_to_pro(s):
    sid = _new_session(s, {"q3": "yes"})
    r = s.post(f"{API}/checkout/mock", json={"session_id": sid, "tier": "invalid"})
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["tier"] == "pro"
    assert data["amount"] == 79


def test_checkout_no_tier_defaults_to_pro(s):
    sid = _new_session(s, {"q3": "yes"})
    r = s.post(f"{API}/checkout/mock", json={"session_id": sid})
    assert r.status_code == 200, r.text
    assert r.json()["tier"] == "pro"
    assert r.json()["amount"] == 79


# ---------- Report includes tier+amount after payment ----------
@pytest.mark.parametrize("tier,amount,credits", [
    ("starter", 29, 1),
    ("pro", 79, 1),
    ("bundle", 149, 5),
])
def test_report_contains_tier_fields(s, tier, amount, credits):
    sid = _new_session(s, {"q3": "yes"}, email=f"TEST_rep_{tier}@example.com")
    s.post(f"{API}/checkout/mock", json={"session_id": sid, "tier": tier})
    r = s.get(f"{API}/report/{sid}")
    assert r.status_code == 200, r.text
    rep = r.json()
    assert rep["paid"] is True
    assert rep.get("tier") == tier
    assert rep.get("amount_usd") == amount
    assert rep.get("credits_remaining") == credits


# ---------- 402 when unpaid still enforced ----------
def test_report_still_402_without_payment(s):
    sid = _new_session(s, {"q3": "yes"})
    r = s.get(f"{API}/report/{sid}")
    assert r.status_code == 402

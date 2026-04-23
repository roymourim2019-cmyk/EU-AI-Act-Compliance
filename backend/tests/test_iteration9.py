"""Iteration 9 tests: regulatory updates, currency pricing, jurisdictions, bundle-gated report."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # Fallback read frontend/.env directly if env var not exported
    from pathlib import Path
    env_path = Path("/app/frontend/.env")
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

API = f"{BASE_URL}/api"


HIGH_RISK_ANSWERS = [
    {"question_id": "q1", "value": "no"},
    {"question_id": "q2", "value": "no"},
    {"question_id": "q3", "value": "yes"},  # triggers high_risk
    {"question_id": "q4", "value": "no"},
    {"question_id": "q5", "value": "no"},
    {"question_id": "q6", "value": "no"},
    {"question_id": "q7", "value": "no"},
    {"question_id": "q8", "value": "no"},
    {"question_id": "q9", "value": "yes"},
    {"question_id": "q10", "value": "no"},
]


# ------ /api/updates ------
def test_updates_default_limit_6():
    r = requests.get(f"{API}/updates?limit=6")
    assert r.status_code == 200
    data = r.json()
    assert "updates" in data and len(data["updates"]) == 6
    required = {"id", "date", "tag", "title", "body", "source", "url"}
    for u in data["updates"]:
        assert required.issubset(u.keys()), f"Missing fields in {u}"


def test_updates_limit_clamped():
    r = requests.get(f"{API}/updates?limit=999")
    assert r.status_code == 200
    assert len(r.json()["updates"]) == r.json()["total"]


# ------ /api/pricing currency ------
def test_pricing_default_usd():
    r = requests.get(f"{API}/pricing")
    assert r.status_code == 200
    d = r.json()
    assert d["currency"] == "USD"
    for t in d["tiers"]:
        assert t["amount"] == t["amount_usd"]
        assert t["symbol"] == "$"


def test_pricing_inr():
    r = requests.get(f"{API}/pricing?currency=INR")
    assert r.status_code == 200
    d = r.json()
    assert d["currency"] == "INR"
    assert d["symbol"] == "₹"
    assert d["charge_currency"] == "USD"
    starter = next(t for t in d["tiers"] if t["id"] == "starter")
    # 79 * 83 = 6557, rounded to nearest ₹50 = 6550
    assert starter["amount"] == 6550
    assert starter["currency"] == "INR"


def test_pricing_eur():
    r = requests.get(f"{API}/pricing?currency=EUR")
    d = r.json()
    assert d["currency"] == "EUR" and d["symbol"] == "€"
    starter = next(t for t in d["tiers"] if t["id"] == "starter")
    # 79 * 0.92 = 72.68
    assert abs(starter["amount"] - 72.68) < 0.5


def test_pricing_gbp():
    r = requests.get(f"{API}/pricing?currency=GBP")
    d = r.json()
    assert d["currency"] == "GBP" and d["symbol"] == "£"


def test_pricing_invalid_currency_falls_back_usd():
    r = requests.get(f"{API}/pricing?currency=XYZ")
    d = r.json()
    assert d["currency"] == "USD"


# ------ /api/quiz/submit with jurisdictions ------
def test_quiz_submit_with_uk_co():
    payload = {"answers": HIGH_RISK_ANSWERS, "jurisdictions": ["uk", "colorado"], "email": "TEST_jx@example.com"}
    r = requests.post(f"{API}/quiz/submit", json=payload)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["risk_level"] == "high_risk"
    assert set(d["jurisdictions"]) == {"uk", "colorado"}
    assert "uk" in d["jurisdiction_findings"] and "colorado" in d["jurisdiction_findings"]
    assert all(s.startswith("UK:") for s in d["jurisdiction_findings"]["uk"])
    assert all(s.startswith("Colorado:") for s in d["jurisdiction_findings"]["colorado"])


def test_quiz_submit_invalid_jurisdictions_filtered():
    payload = {"answers": HIGH_RISK_ANSWERS, "jurisdictions": ["invalid", "xx"]}
    r = requests.post(f"{API}/quiz/submit", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert d["jurisdictions"] == []
    assert d["jurisdiction_findings"] == {}


def test_quiz_submit_without_jurisdictions_regression():
    payload = {"answers": HIGH_RISK_ANSWERS}
    r = requests.post(f"{API}/quiz/submit", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert "session_id" in d
    assert d["jurisdiction_findings"] == {}


# ------ /api/report bundle-gated jurisdiction_findings ------
def _create_paid_session(tier, jurisdictions=None):
    payload = {"answers": HIGH_RISK_ANSWERS, "email": f"TEST_{tier}@example.com"}
    if jurisdictions is not None:
        payload["jurisdictions"] = jurisdictions
    r = requests.post(f"{API}/quiz/submit", json=payload)
    assert r.status_code == 200
    sid = r.json()["session_id"]
    r2 = requests.post(f"{API}/checkout/mock", json={"session_id": sid, "tier": tier, "email": f"TEST_{tier}@example.com"})
    assert r2.status_code == 200, r2.text
    return sid


def test_report_bundle_has_jurisdiction_findings():
    sid = _create_paid_session("bundle", ["uk", "colorado"])
    r = requests.get(f"{API}/report/{sid}")
    assert r.status_code == 200
    d = r.json()
    assert d["tier"] == "bundle"
    jf = d.get("jurisdiction_findings", {})
    assert "uk" in jf and "colorado" in jf
    assert any(s.startswith("UK:") for s in jf["uk"])
    assert any(s.startswith("Colorado:") for s in jf["colorado"])


def test_report_pro_tier_strips_jurisdictions():
    sid = _create_paid_session("pro", ["uk", "colorado"])
    r = requests.get(f"{API}/report/{sid}")
    assert r.status_code == 200
    d = r.json()
    assert d["tier"] == "pro"
    assert d.get("jurisdiction_findings") == {}


def test_report_starter_tier_strips_jurisdictions():
    sid = _create_paid_session("starter", ["uk", "colorado"])
    r = requests.get(f"{API}/report/{sid}")
    assert r.status_code == 200
    d = r.json()
    assert d.get("jurisdiction_findings") == {}


# ------ Regression: /api/stats, /api/reports/recover ------
def test_stats_regression():
    r = requests.get(f"{API}/stats")
    assert r.status_code == 200
    d = r.json()
    assert "assessed" in d and "reports_sold" in d


def test_recover_regression():
    r = requests.post(f"{API}/reports/recover", json={"email": "TEST_recover@example.com"})
    assert r.status_code == 200
    d = r.json()
    assert "sessions" in d

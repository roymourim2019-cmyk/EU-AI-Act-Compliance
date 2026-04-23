"""Rate limit tests for quiz_submit (10/min) and subscribe (5/min) endpoints."""
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
# Direct backend URL — bypasses k8s ingress which overrides CORS headers
LOCAL_API = "http://localhost:8001/api"


def _answers():
    base = {f"q{i}": "no" for i in range(1, 11)}
    base["q9"] = "yes"
    return [{"question_id": k, "value": v} for k, v in base.items()]


def test_cors_allowed_origin_ok():
    """Allowed origin should get CORS header reflected back (tested directly against backend)."""
    origin = "https://compliance-compass-10.preview.emergentagent.com"
    r = requests.get(f"{LOCAL_API}/", headers={"Origin": origin})
    assert r.status_code == 200
    aco = r.headers.get("access-control-allow-origin")
    assert aco == origin, f"Expected origin echo, got {aco!r}"


def test_cors_disallowed_origin_rejected():
    """Disallowed origin should NOT receive an echoed ACAO header."""
    r = requests.get(f"{LOCAL_API}/", headers={"Origin": "https://evil.example.com"})
    aco = r.headers.get("access-control-allow-origin")
    assert aco != "https://evil.example.com"
    assert aco != "*"


def test_subscribe_rate_limit_429():
    """6th subscribe POST within 1 minute from same IP should get 429."""
    # Use a unique spoofed client IP so we don't collide with other runs
    ip = f"10.20.30.{(uuid.uuid4().int % 250) + 1}"
    headers = {"X-Forwarded-For": ip, "Content-Type": "application/json"}
    codes = []
    for i in range(7):
        r = requests.post(
            f"{API}/subscribe",
            json={"email": f"TEST_rl_{i}_{uuid.uuid4().hex[:6]}@example.com"},
            headers=headers,
        )
        codes.append(r.status_code)
    # First 5 should succeed, 6th or 7th should hit 429
    assert codes[:5] == [200, 200, 200, 200, 200], f"First 5 should be 200, got {codes}"
    assert 429 in codes[5:], f"Expected 429 in {codes[5:]}, got {codes}"


def test_quiz_submit_rate_limit_429():
    """21st quiz submit within 1 minute from same IP should get 429 (limit bumped to 20/min)."""
    ip = f"10.20.40.{(uuid.uuid4().int % 250) + 1}"
    headers = {"X-Forwarded-For": ip, "Content-Type": "application/json"}
    codes = []
    payload = {"answers": _answers(), "dpdp_enabled": False}
    for i in range(22):
        r = requests.post(f"{API}/quiz/submit", json=payload, headers=headers)
        codes.append(r.status_code)
    assert codes[:20] == [200] * 20, f"First 20 should be 200, got {codes}"
    assert 429 in codes[20:], f"Expected 429 in {codes[20:]}, got {codes}"


def test_recover_rate_limit_429():
    """4th recover POST within 1 minute from same IP should get 429 (limit 3/min)."""
    ip = f"10.20.50.{(uuid.uuid4().int % 250) + 1}"
    headers = {"X-Forwarded-For": ip, "Content-Type": "application/json"}
    codes = []
    for i in range(5):
        r = requests.post(
            f"{API}/reports/recover",
            json={"email": f"TEST_rlrec_{i}@example.com"},
            headers=headers,
        )
        codes.append(r.status_code)
    assert codes[:3] == [200, 200, 200], f"First 3 should be 200, got {codes}"
    assert 429 in codes[3:], f"Expected 429 in {codes[3:]}, got {codes}"

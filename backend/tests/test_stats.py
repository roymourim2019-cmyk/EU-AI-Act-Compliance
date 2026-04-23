"""Tests for GET /api/stats (public social-proof counters + rate limit)."""
import os
import uuid
import time
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

FE_ENV = Path(__file__).resolve().parents[2] / "frontend" / ".env"
load_dotenv(FE_ENV)

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

BASELINE_ASSESSED = 3187
BASELINE_PAID = 412


def _fixed_ip_session(ip=None):
    s = requests.Session()
    s.headers.update({
        "Content-Type": "application/json",
        "X-Forwarded-For": ip or f"10.11.{uuid.uuid4().int % 250 + 1}.{uuid.uuid4().int % 250 + 1}",
    })
    return s


def test_stats_baseline_and_shape():
    s = _fixed_ip_session()
    r = s.get(f"{API}/stats")
    assert r.status_code == 200, r.text
    data = r.json()
    assert set(data.keys()) >= {"assessed", "reports_sold"}
    assert isinstance(data["assessed"], int)
    assert isinstance(data["reports_sold"], int)
    assert data["assessed"] >= BASELINE_ASSESSED
    assert data["reports_sold"] >= BASELINE_PAID


def test_stats_monotonic_after_new_quiz():
    s = _fixed_ip_session()
    r1 = s.get(f"{API}/stats").json()
    payload = {
        "answers": [{"question_id": f"q{i}", "value": "no"} for i in range(1, 11)] ,
        "dpdp_enabled": False,
    }
    # ensure q9=yes so it still classifies normally
    payload["answers"][8] = {"question_id": "q9", "value": "yes"}
    sub = _fixed_ip_session()
    rsub = sub.post(f"{API}/quiz/submit", json=payload)
    assert rsub.status_code == 200, rsub.text
    # assessed should be >= prior
    r2 = s.get(f"{API}/stats").json()
    assert r2["assessed"] >= r1["assessed"] + 1
    assert r2["reports_sold"] >= r1["reports_sold"]


def test_stats_rate_limit_429():
    """60/minute — make >60 rapid calls from the SAME IP and expect a 429."""
    ip = "192.0.2.77"
    s = _fixed_ip_session(ip)
    got_429 = False
    for i in range(75):
        r = s.get(f"{API}/stats")
        if r.status_code == 429:
            got_429 = True
            break
        assert r.status_code == 200
    assert got_429, "Expected a 429 within 75 requests on 60/min limit"


def test_robots_and_sitemap_reachable():
    robots = requests.get(f"{BASE_URL}/robots.txt")
    assert robots.status_code == 200
    assert len(robots.text) > 0
    assert "Disallow" in robots.text or "Allow" in robots.text
    sitemap = requests.get(f"{BASE_URL}/sitemap.xml")
    assert sitemap.status_code == 200
    assert "<urlset" in sitemap.text
    assert "<loc>" in sitemap.text

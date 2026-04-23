"""Tests for POST /api/reports/recover — self-service report link recovery."""
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


def _rot_headers():
    return {
        "Content-Type": "application/json",
        "X-Forwarded-For": f"172.16.{(uuid.uuid4().int >> 8) % 250 + 1}.{uuid.uuid4().int % 250 + 1}",
    }


def _answers(overrides=None):
    base = {f"q{i}": "no" for i in range(1, 11)}
    base["q9"] = "yes"
    if overrides:
        base.update(overrides)
    return [{"question_id": k, "value": v} for k, v in base.items()]


def _seed_paid_session(email, overrides=None):
    """Submit a quiz with the given email, mock-checkout it, return session_id."""
    r = requests.post(
        f"{API}/quiz/submit",
        json={"answers": _answers(overrides or {"q3": "yes"}), "dpdp_enabled": False, "email": email},
        headers=_rot_headers(),
    )
    assert r.status_code == 200, r.text
    sid = r.json()["session_id"]
    rp = requests.post(
        f"{API}/checkout/mock",
        json={"session_id": sid, "email": email},
        headers=_rot_headers(),
    )
    assert rp.status_code == 200, rp.text
    return sid


def _seed_unpaid_session(email):
    r = requests.post(
        f"{API}/quiz/submit",
        json={"answers": _answers(), "dpdp_enabled": False, "email": email},
        headers=_rot_headers(),
    )
    assert r.status_code == 200
    return r.json()["session_id"]


# ---------- Happy path ----------
def test_recover_returns_paid_sessions():
    email = f"TEST_recover_{uuid.uuid4().hex[:8]}@example.com"
    sid1 = _seed_paid_session(email)
    sid2 = _seed_paid_session(email, {"q7": "yes"})

    r = requests.post(f"{API}/reports/recover", json={"email": email}, headers=_rot_headers())
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["email"] == email
    assert isinstance(data["sessions"], list)
    returned_ids = {s["session_id"] for s in data["sessions"]}
    assert sid1 in returned_ids
    assert sid2 in returned_ids

    # Required projected fields present
    for s in data["sessions"]:
        for k in ("session_id", "score", "risk_level", "risk_label", "paid_at", "created_at"):
            assert k in s, f"missing {k} in {s}"
        # No _id leak
        assert "_id" not in s


def test_recover_excludes_unpaid_sessions():
    """Unpaid sessions with matching email MUST NOT appear — prevents enumeration."""
    email = f"TEST_unpaid_{uuid.uuid4().hex[:8]}@example.com"
    unpaid_sid = _seed_unpaid_session(email)
    paid_sid = _seed_paid_session(email)

    r = requests.post(f"{API}/reports/recover", json={"email": email}, headers=_rot_headers())
    assert r.status_code == 200
    ids = {s["session_id"] for s in r.json()["sessions"]}
    assert paid_sid in ids
    assert unpaid_sid not in ids, "Unpaid session leaked in recover response"


def test_recover_nonexistent_email_returns_empty():
    """Non-existent buyer email returns 200 with empty sessions, no error leak."""
    email = f"TEST_nobody_{uuid.uuid4().hex[:8]}@example.com"
    r = requests.post(f"{API}/reports/recover", json={"email": email}, headers=_rot_headers())
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == email
    assert data["sessions"] == []


def test_recover_max_5_sorted_desc():
    """Returns at most 5 sessions, sorted by paid_at desc (most recent first)."""
    email = f"TEST_max5_{uuid.uuid4().hex[:8]}@example.com"
    seeded = [_seed_paid_session(email) for _ in range(7)]
    r = requests.post(f"{API}/reports/recover", json={"email": email}, headers=_rot_headers())
    assert r.status_code == 200
    sessions = r.json()["sessions"]
    assert len(sessions) == 5, f"Expected max 5, got {len(sessions)}"
    # Verify descending order by paid_at
    paid_ats = [s["paid_at"] for s in sessions]
    assert paid_ats == sorted(paid_ats, reverse=True), f"Not desc-sorted: {paid_ats}"
    # The most recent (last seeded) should be first
    assert sessions[0]["session_id"] == seeded[-1]


def test_recover_invalid_email_422():
    r = requests.post(f"{API}/reports/recover", json={"email": "not-an-email"}, headers=_rot_headers())
    assert r.status_code == 422


def test_recover_email_mismatch_returns_empty():
    """Exact-match only: buyer email X cannot see buyer email Y's reports."""
    email_a = f"TEST_a_{uuid.uuid4().hex[:6]}@example.com"
    email_b = f"TEST_b_{uuid.uuid4().hex[:6]}@example.com"
    sid_a = _seed_paid_session(email_a)
    r = requests.post(f"{API}/reports/recover", json={"email": email_b}, headers=_rot_headers())
    assert r.status_code == 200
    ids = {s["session_id"] for s in r.json()["sessions"]}
    assert sid_a not in ids

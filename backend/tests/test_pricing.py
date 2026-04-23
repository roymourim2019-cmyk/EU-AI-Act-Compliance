"""Tests for GET /api/pricing (single source of truth refactor)."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or None

# Fallback: read frontend/.env
if not BASE_URL:
    from pathlib import Path
    env = Path(__file__).resolve().parents[2] / "frontend" / ".env"
    for line in env.read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL"):
            BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
            break


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestPricingEndpoint:
    def test_pricing_200_and_shape(self, client):
        r = client.get(f"{BASE_URL}/api/pricing")
        assert r.status_code == 200
        data = r.json()
        assert "tiers" in data and isinstance(data["tiers"], list)
        assert data["currency"] == "USD"
        assert "effective_at" in data
        assert len(data["tiers"]) == 3

    def test_pricing_is_sorted_by_order(self, client):
        tiers = client.get(f"{BASE_URL}/api/pricing").json()["tiers"]
        ids = [t["id"] for t in tiers]
        assert ids == ["starter", "pro", "bundle"]

    def test_pricing_values(self, client):
        tiers = {t["id"]: t for t in client.get(f"{BASE_URL}/api/pricing").json()["tiers"]}
        assert tiers["starter"]["amount_usd"] == 79
        assert tiers["starter"]["credits"] == 1
        assert tiers["starter"]["popular"] is False
        assert len(tiers["starter"]["features"]) == 6

        assert tiers["pro"]["amount_usd"] == 199
        assert tiers["pro"]["credits"] == 1
        assert tiers["pro"]["popular"] is True
        assert len(tiers["pro"]["features"]) == 7

        assert tiers["bundle"]["amount_usd"] == 399
        assert tiers["bundle"]["credits"] == 5
        assert tiers["bundle"]["popular"] is False
        assert len(tiers["bundle"]["features"]) == 6

    def test_pricing_no_auth_required(self, client):
        """No Authorization header, should still return 200."""
        fresh = requests.get(f"{BASE_URL}/api/pricing")
        assert fresh.status_code == 200

    def test_pricing_multiple_calls_no_rate_limit(self, client):
        """Spot-check: 10 rapid calls should all succeed (no rate limiter on /pricing)."""
        codes = [client.get(f"{BASE_URL}/api/pricing").status_code for _ in range(10)]
        assert all(c == 200 for c in codes), f"Got codes: {codes}"


class TestCheckoutDerivedPricing:
    """Verify TIER_PRICING (derived from TIER_METADATA) still powers checkout."""

    def _mk_session(self, client):
        payload = {
            "answers": [{"question_id": f"q{i}", "value": "no"} for i in range(1, 11)],
            "dpdp_enabled": False,
        }
        payload["answers"][8]["value"] = "yes"  # q9 EU scope
        payload["answers"][2]["value"] = "yes"  # q3 high-risk
        r = client.post(f"{BASE_URL}/api/quiz/submit", json=payload)
        assert r.status_code == 200, r.text
        return r.json()["session_id"]

    @pytest.mark.parametrize("tier,expected", [
        ("starter", 79),
        ("pro", 199),
        ("bundle", 399),
    ])
    def test_checkout_amount_matches_metadata(self, client, tier, expected):
        sid = self._mk_session(client)
        r = client.post(
            f"{BASE_URL}/api/checkout/mock",
            json={"session_id": sid, "email": "TEST_pricing@example.com", "tier": tier},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["status"] == "succeeded"
        assert body["tier"] == tier
        assert body["amount"] == expected

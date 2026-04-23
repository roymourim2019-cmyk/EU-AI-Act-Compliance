/**
 * Shared pricing source of truth for the frontend.
 *
 * Why both constants + hook?
 *  - CONSTANT defaults are used for first render, SEO JSON-LD, and any
 *    codepath that can't wait for an API call (PDF generation, static copy).
 *  - usePricing() hydrates from /api/pricing so the backend TIER_METADATA
 *    is the runtime source of truth — change a price in server.py and the
 *    UI picks it up on next load without a redeploy.
 *  - usePricing("INR") re-fetches with a currency param and returns
 *    localized amounts for the pricing display.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const PRICING = {
  starter: {
    id: "starter",
    label: "Starter",
    amount_usd: 79,
    amount: 79,
    currency: "USD",
    symbol: "$",
    credits: 1,
    price_note: "one-time · 1 system",
    tagline: "Everything your first AI audit needs.",
    features: [
      "Full 0–100 risk score",
      "Obligations checklist (all tiers)",
      "Regulatory deadline tracker",
      "Penalty exposure summary",
      "Branded PDF download",
      "Shareable report link",
    ],
    popular: false,
    order: 1,
  },
  pro: {
    id: "pro",
    label: "Pro",
    amount_usd: 199,
    amount: 199,
    currency: "USD",
    symbol: "$",
    credits: 1,
    price_note: "one-time · 1 system",
    tagline: "What your legal team actually needs.",
    features: [
      "Everything in Starter",
      "FRIA starter template (Art 27)",
      "Compliance badge (SVG + embed)",
      "Supplier questionnaire (CSV, 22 Q)",
      "Invite-your-GC email flow",
      "India DPDP findings",
      "Priority regulatory updates",
    ],
    popular: true,
    order: 2,
  },
  bundle: {
    id: "bundle",
    label: "Bundle",
    amount_usd: 399,
    amount: 399,
    currency: "USD",
    symbol: "$",
    credits: 5,
    price_note: "one-time · 5 systems",
    tagline: "Audit the full AI portfolio once.",
    features: [
      "Everything in Pro × 5 reports",
      "UK + Colorado AI-Act cross-map",
      "Portfolio comparison view",
      "Comparison PDF export",
      "White-label branded PDFs",
      "Lifetime access across all 5",
      "Effective price: $79.80 per system",
    ],
    popular: false,
    order: 3,
  },
};

export const TIER_ORDER = ["starter", "pro", "bundle"];

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "INR"];

// USD-denominated label used in JSON-LD, PDF copy, upsell hints. Always $.
export const priceLabel = (tierId) => `$${PRICING[tierId].amount_usd}`;

// Currency-aware display — uses the tier's current amount + symbol.
export const displayPrice = (tier) => `${tier.symbol || "$"}${(tier.amount ?? tier.amount_usd).toLocaleString()}`;

export const tiersAsList = (obj = PRICING) =>
  Object.values(obj).sort((a, b) => a.order - b.order);

// Module-level cache keyed by currency so each currency fetches once.
const _cache = {};

export function usePricing(currency = "USD") {
  const cur = (currency || "USD").toUpperCase();
  const [data, setData] = useState(_cache[cur] || PRICING);
  useEffect(() => {
    if (_cache[cur]) {
      setData(_cache[cur]);
      return;
    }
    api.get(`/pricing?currency=${cur}`).then(({ data: resp }) => {
      if (!resp?.tiers) return;
      const next = {};
      resp.tiers.forEach((t) => { next[t.id] = { ...PRICING[t.id], ...t }; });
      _cache[cur] = next;
      setData(next);
    }).catch(() => {
      // Fall back to defaults silently.
    });
  }, [cur]);
  return data;
}

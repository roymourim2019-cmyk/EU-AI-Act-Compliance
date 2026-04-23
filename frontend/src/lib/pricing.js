/**
 * Shared pricing source of truth for the frontend.
 *
 * Why both constants + hook?
 *  - CONSTANT defaults are used for first render, SEO JSON-LD, and any
 *    codepath that can't wait for an API call (PDF generation, static copy).
 *  - usePricing() hydrates from /api/pricing so the backend TIER_METADATA
 *    is the runtime source of truth — change a price in server.py and the
 *    UI picks it up on next load without a redeploy.
 */
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export const PRICING = {
  starter: {
    id: "starter",
    label: "Starter",
    amount_usd: 79,
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
    credits: 5,
    price_note: "one-time · 5 systems",
    tagline: "Audit the full AI portfolio once.",
    features: [
      "Everything in Pro × 5 reports",
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

export const priceLabel = (tierId) => `$${PRICING[tierId].amount_usd}`;

export const tiersAsList = (obj = PRICING) =>
  Object.values(obj).sort((a, b) => a.order - b.order);

// Module-level cache so every caller shares the latest hydrated data.
let _cache = null;

export function usePricing() {
  const [data, setData] = useState(_cache || PRICING);
  useEffect(() => {
    if (_cache) return;
    api.get("/pricing").then(({ data: resp }) => {
      if (!resp?.tiers) return;
      const next = {};
      resp.tiers.forEach((t) => { next[t.id] = { ...PRICING[t.id], ...t }; });
      _cache = next;
      setData(next);
    }).catch(() => {
      // Fall back to defaults silently.
    });
  }, []);
  return data;
}

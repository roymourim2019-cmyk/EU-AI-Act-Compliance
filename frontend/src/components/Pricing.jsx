import React from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, Crown, Layers } from "lucide-react";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNote: "quiz only",
    tagline: "Find out which tier you land in.",
    features: [
      "10-question diagnostic",
      "Risk tier label (e.g., High-Risk)",
      "Share the tier to your team",
    ],
    locked: [
      "Risk score 0–100",
      "Obligations checklist",
      "Any downloadable artifact",
    ],
    cta: { label: "Take the free quiz", to: "/quiz?tier=free" },
    icon: null,
    accent: null,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    priceNote: "one-time · 1 system",
    tagline: "The essentials — bring it to your next stand-up.",
    features: [
      "Full 0–100 risk score",
      "Obligations checklist (all tiers)",
      "Regulatory deadline tracker",
      "Penalty exposure summary",
      "Branded PDF download",
      "Shareable report link",
    ],
    cta: { label: "Start quiz · unlock $29", to: "/quiz?tier=starter" },
    icon: null,
    accent: "starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$79",
    priceNote: "one-time · 1 system",
    tagline: "What your legal team actually needs.",
    features: [
      "Everything in Starter",
      "FRIA starter template (Art 27)",
      "Compliance badge (SVG + embed)",
      "Supplier questionnaire (CSV, 22 Q)",
      "Invite-your-GC email flow",
      "India DPDP findings",
    ],
    cta: { label: "Start quiz · unlock $79", to: "/quiz?tier=pro" },
    icon: Sparkles,
    accent: "pro",
    popular: true,
  },
  {
    id: "bundle",
    name: "Bundle",
    price: "$149",
    priceNote: "one-time · 5 systems",
    tagline: "Audit the full AI portfolio once.",
    features: [
      "Everything in Pro × 5 reports",
      "Portfolio comparison view",
      "Comparison PDF export",
      "Priority regulatory updates",
      "Lifetime access across all 5",
      "Effective price: $29.80 per system",
    ],
    cta: { label: "Start quiz · unlock $149", to: "/quiz?tier=bundle" },
    icon: Layers,
    accent: "bundle",
  },
];

export default function Pricing() {
  const pickTier = (id) => {
    try {
      sessionStorage.setItem("preferred_tier", id);
    } catch (e) {
      // ignore
    }
  };

  return (
    <section id="pricing" className="border-b border-foreground/10" data-testid="pricing-section">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-10">
          <div className="md:col-span-6">
            <div className="label-eyebrow text-foreground/60 mb-4">§ 05 · Pricing</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter leading-[1]">
              Pay once. No<br /> subscription. Ever.
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 text-foreground/70 leading-relaxed">
            Competitors charge $500–5,000 for EU AI Act compliance audits. We ship the same obligations
            mapping as an editable artifact — for the cost of a lunch. Pick the layer that fits.
          </div>
        </div>

        <div
          className="mb-8 border border-[#EAB308] bg-[#EAB308]/10 text-foreground px-5 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
          data-testid="launch-pricing-band"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-[#EAB308]" />
            <div>
              <span className="font-display text-base md:text-lg tracking-tight">Early-access launch prices</span>
            </div>
          </div>
          <div className="label-eyebrow text-foreground/60">
            Rises 50% on 1 Sep 2026 · first 500 customers only
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-l border-foreground/15">
          {TIERS.map((t) => {
            const isPopular = !!t.popular;
            const Icon = t.icon;
            const cardCls = isPopular
              ? "bg-foreground text-background"
              : "bg-background text-foreground";
            const borderText = isPopular ? "text-background/70" : "text-foreground/60";
            const mutedText = isPopular ? "text-background/70" : "text-foreground/70";
            const ctaCls = isPopular
              ? "bg-[#0020C2] text-white hover:bg-[#00189B]"
              : t.id === "free"
              ? "border border-foreground/30 hover:bg-foreground hover:text-background"
              : t.id === "bundle"
              ? "bg-foreground text-background hover:bg-[#0020C2] hover:text-white"
              : "border border-foreground/30 hover:bg-foreground hover:text-background";

            return (
              <div
                key={t.id}
                className={`relative p-8 md:p-8 border-r border-b border-foreground/15 ${cardCls} flex flex-col`}
                data-testid={`pricing-${t.id}-card`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-[#EAB308] text-black label-eyebrow px-3 py-1">
                    Most popular
                  </div>
                )}
                <div className="flex items-center justify-between mb-6">
                  <div className={`label-eyebrow flex items-center gap-2 ${borderText}`}>
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {t.name}
                  </div>
                  <span className={`label-eyebrow ${isPopular ? "text-background/40" : "text-foreground/40"}`}>
                    {t.priceNote}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="font-display text-6xl tracking-tighter">{t.price}</span>
                </div>
                <p className={`mb-6 text-sm ${mutedText}`}>{t.tagline}</p>
                <ul className="space-y-2 mb-6">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${isPopular ? "text-[#EAB308]" : t.id === "bundle" ? "text-[#0020C2]" : "text-[#16A34A]"}`} />
                      <span className={isPopular ? "text-background/90" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>
                {t.locked && (
                  <ul className="space-y-2 mb-6 opacity-50">
                    {t.locked.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm line-through">
                        <span className="mono text-xs mt-0.5 w-4">×</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={t.cta.to}
                  onClick={() => pickTier(t.id)}
                  className={`mt-auto inline-flex items-center justify-center w-full h-12 label-eyebrow transition-all duration-200 ${ctaCls}`}
                  data-testid={`pricing-${t.id}-cta`}
                >
                  {t.cta.label}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-6 label-eyebrow text-foreground/50 text-center">
          All tiers include lifetime access · no subscription · one-time payment
        </p>
      </div>
    </section>
  );
}

export const PRICING_TIERS = TIERS;

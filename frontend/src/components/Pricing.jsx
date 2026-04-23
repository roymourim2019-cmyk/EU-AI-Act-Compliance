import React from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, Layers } from "lucide-react";
import { usePricing, tiersAsList, priceLabel } from "@/lib/pricing";

const ACCENT_ICON = { pro: Sparkles, bundle: Layers };

export default function Pricing() {
  const pricing = usePricing();
  const tiers = tiersAsList(pricing);

  const pickTier = (id) => {
    try { sessionStorage.setItem("preferred_tier", id); } catch (e) { /* ignore */ }
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
            Big-four audit firms quote <span className="mono text-foreground">$8,000 – $25,000</span> for
            an EU AI Act readiness review. We ship the same obligations mapping as a signed, editable
            artifact — at a fraction of the price, and without a six-week engagement.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-foreground/15">
          {tiers.map((t) => {
            const isPopular = !!t.popular;
            const Icon = ACCENT_ICON[t.id];
            const cardCls = isPopular
              ? "bg-foreground text-background"
              : "bg-background text-foreground";
            const borderText = isPopular ? "text-background/70" : "text-foreground/60";
            const mutedText = isPopular ? "text-background/70" : "text-foreground/70";
            const ctaCls = isPopular
              ? "bg-[#0020C2] text-white hover:bg-[#00189B]"
              : t.id === "bundle"
              ? "bg-foreground text-background hover:bg-[#0020C2] hover:text-white"
              : "border border-foreground/30 hover:bg-foreground hover:text-background";

            return (
              <div
                key={t.id}
                className={`relative p-8 md:p-10 border-r border-b border-foreground/15 ${cardCls} flex flex-col`}
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
                    {t.label}
                  </div>
                  <span className={`label-eyebrow ${isPopular ? "text-background/40" : "text-foreground/40"}`}>
                    {t.price_note}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="font-display text-6xl tracking-tighter">{priceLabel(t.id)}</span>
                </div>
                <p className={`mb-6 text-sm ${mutedText}`}>{t.tagline}</p>
                <ul className="space-y-2 mb-8">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${isPopular ? "text-[#EAB308]" : t.id === "bundle" ? "text-[#0020C2]" : "text-[#16A34A]"}`} />
                      <span className={isPopular ? "text-background/90" : ""}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/quiz?tier=${t.id}`}
                  onClick={() => pickTier(t.id)}
                  className={`mt-auto inline-flex items-center justify-center w-full h-12 label-eyebrow transition-all duration-200 ${ctaCls}`}
                  data-testid={`pricing-${t.id}-cta`}
                >
                  {`Start quiz · unlock ${priceLabel(t.id)}`}
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

import React from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";

const FREE = [
  "Full 10-question diagnostic",
  "Instant 0–100 risk score + tier badge",
  "Top-level obligations summary",
  "Share your result",
];
const PAID = [
  "Everything in Free",
  "Full statutory obligations checklist",
  "FRIA starter template (Art 27)",
  "Deadline tracker (2025–2027)",
  "Penalty exposure summary",
  "Compliance badge (SVG + embed code)",
  "Downloadable PDF report",
  "Lifetime access — no subscription",
];

export default function Pricing() {
  return (
    <section id="pricing" className="border-b border-foreground/10" data-testid="pricing-section">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-14">
          <div className="md:col-span-6">
            <div className="label-eyebrow text-foreground/60 mb-4">§ 05 · Pricing</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter leading-[1]">
              One price. Yours<br /> to keep.
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 text-foreground/70 leading-relaxed">
            We don&apos;t believe in SaaS subscriptions for a one-time regulation. Run as many scans as you
            like — pay once per report you actually want to keep.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-l border-foreground/15">
          {/* Free */}
          <div className="p-8 md:p-12 border-r border-b border-foreground/15 bg-background">
            <div className="flex items-center justify-between mb-8">
              <div className="label-eyebrow text-foreground/60">Free tier</div>
              <span className="label-eyebrow text-foreground/40">/ forever</span>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="font-display text-7xl tracking-tighter">$0</span>
              <span className="text-foreground/60 mono text-sm">·&nbsp;no credit card</span>
            </div>
            <ul className="space-y-3 mb-10">
              {FREE.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 mt-0.5 text-[#16A34A] shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
              <li className="flex items-start gap-3 text-sm text-foreground/50">
                <X className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Downloadable PDF / FRIA template</span>
              </li>
            </ul>
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center w-full h-12 border border-foreground/30 hover:bg-foreground hover:text-background label-eyebrow transition-all duration-200"
              data-testid="pricing-free-cta"
            >
              Start free scorecard
            </Link>
          </div>

          {/* Paid */}
          <div className="p-8 md:p-12 border-r border-b border-foreground/15 bg-foreground text-background relative">
            <div className="absolute top-0 right-0 bg-[#0020C2] text-white label-eyebrow px-3 py-1">
              Recommended
            </div>
            <div className="flex items-center justify-between mb-8">
              <div className="label-eyebrow text-background/70">Full report</div>
              <span className="label-eyebrow text-background/40">/ one-time</span>
            </div>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="font-display text-7xl tracking-tighter">$49</span>
              <span className="text-background/70 mono text-sm line-through">$99</span>
              <span className="label-eyebrow text-[#EAB308] ml-1">Launch</span>
            </div>
            <ul className="space-y-3 mb-10">
              {PAID.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 mt-0.5 text-[#EAB308] shrink-0" />
                  <span className="text-background/90">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/quiz"
              className="inline-flex items-center justify-center w-full h-12 bg-[#0020C2] text-white hover:bg-[#00189B] label-eyebrow transition-all duration-200"
              data-testid="pricing-paid-cta"
            >
              Start quiz · unlock for $49
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

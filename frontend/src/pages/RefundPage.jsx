import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import useSeo from "@/lib/useSeo";

export default function RefundPage() {
  useSeo({
    title: "Refund Policy · EU AI Act Compliance · Roy's Enterprise",
    description:
      "Refund policy for the EU AI Act Compliance scorecard. Full refund within 24 hours if the paid report hasn't been downloaded. Digital goods — no cash refunds after delivery.",
    canonical: typeof window !== "undefined" ? window.location.origin + "/refund" : "",
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="refund-page">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1000px] px-6 md:px-10 py-16 md:py-20">
            <Link to="/" className="label-eyebrow text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-8 sharp-link">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <div className="label-eyebrow text-foreground/60 mb-4 flex items-center gap-2">
              <RefreshCcw className="h-3.5 w-3.5 text-[#EA580C]" /> § Legal · Refunds & cancellations
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95]">
              Refund Policy.
            </h1>
            <p className="mt-6 max-w-2xl text-foreground/70 leading-relaxed">
              We sell one-time digital reports, not subscriptions. Here is the plain-English summary:
              if the product doesn't match what we promised, we refund you. Full stop.
            </p>
            <div className="mt-3 label-eyebrow text-foreground/60">
              Effective · 1 Feb 2026
            </div>
          </div>
        </section>

        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1000px] px-6 md:px-10 py-12 md:py-16 grid md:grid-cols-2 gap-6">
            <div className="border border-[#16A34A] p-6" data-testid="refund-eligible">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
                <div className="font-display text-xl tracking-tight">Eligible for refund</div>
              </div>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>· You paid but the paid report never generated or is inaccessible for 24+ hours</li>
                <li>· You were charged twice for the same session</li>
                <li>· You request a refund within <span className="mono text-foreground">24 hours</span> and the report PDF has <span className="mono text-foreground">not</span> been downloaded</li>
                <li>· A bug on our end produced a demonstrably incorrect classification (we refund + fix)</li>
              </ul>
            </div>
            <div className="border border-foreground/30 p-6" data-testid="refund-not-eligible">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-5 w-5 text-foreground/70" />
                <div className="font-display text-xl tracking-tight">Not eligible</div>
              </div>
              <ul className="space-y-2 text-sm text-foreground/80">
                <li>· Report PDF / CSV / FRIA template was downloaded</li>
                <li>· Compliance badge SVG was copied</li>
                <li>· More than 24 hours elapsed since payment</li>
                <li>· "I changed my mind" — digital goods, sorry</li>
                <li>· Disagreement with the risk classification (classification is a non-binding diagnostic — not legal advice)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1000px] px-6 md:px-10 py-12 md:py-16 grid md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
              <div className="label-eyebrow text-foreground/60 mb-2">§ How to request</div>
              <h2 className="font-display text-3xl tracking-tight leading-[1.05]">Three lines. We reply in under 24 hours.</h2>
            </div>
            <div className="md:col-span-8 text-foreground/80 leading-relaxed space-y-4">
              <p>Email <a href="mailto:refunds@aiact-scorecard.eu" className="sharp-link">refunds@aiact-scorecard.eu</a> with:</p>
              <ol className="space-y-2 text-sm">
                <li className="flex gap-3"><span className="mono text-foreground/50 w-8">/01</span><span>Your session ID or payment_id</span></li>
                <li className="flex gap-3"><span className="mono text-foreground/50 w-8">/02</span><span>The email you used at checkout</span></li>
                <li className="flex gap-3"><span className="mono text-foreground/50 w-8">/03</span><span>What went wrong (one sentence is fine)</span></li>
              </ol>
              <p className="label-eyebrow text-foreground/60 pt-4">
                Settlement: 5–7 business days to your original payment method (Razorpay standard).
              </p>
              <p className="text-sm text-foreground/60">
                Cancellations: there is nothing to cancel — every tier is a one-time purchase with lifetime access. No auto-renewal, no stored payment method.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import useSeo from "@/lib/useSeo";

const SECTIONS = [
  {
    n: "01",
    title: "Who we are",
    body:
      "Roy's Enterprise (\"we\", \"us\") operates the EU AI Act Compliance scorecard at this domain. Contact: privacy@aiact-scorecard.eu. A GDPR Art 27 representative is not required today; if that changes we will list one here.",
  },
  {
    n: "02",
    title: "What we collect",
    body:
      "Quiz answers you submit, a session UUID generated server-side, the business email you provide to receive your report, and — if you pay — the Razorpay payment_id and order_id returned to us after settlement. We do not set third-party tracking cookies. Product analytics (PostHog) runs in EU region with IP addresses truncated.",
  },
  {
    n: "03",
    title: "Why we collect it",
    body:
      "Legal basis: Art 6(1)(b) GDPR (performance of contract) for paid reports, Art 6(1)(f) (legitimate interest) for free quiz sessions that never convert, Art 6(1)(a) (consent) for newsletter subscribers. We do not sell personal data or transfer it outside processors listed in our Trust centre.",
  },
  {
    n: "04",
    title: "How long we keep it",
    body:
      "Paid reports: 24 months from the last access. Free quiz sessions that never convert: 90 days. Newsletter subscriptions: until you unsubscribe. Payment records: 7 years as required by Indian and EU tax law.",
  },
  {
    n: "05",
    title: "Your rights",
    body:
      "Access, rectification, erasure, portability, restriction, and objection. Email privacy@aiact-scorecard.eu with your session ID or email and we respond within 30 days. You can also complain to your national Data Protection Authority (in India, the Data Protection Board under DPDP Act 2023).",
  },
  {
    n: "06",
    title: "Payments",
    body:
      "Payments are processed by Razorpay Software Pvt Ltd (India) under their own PCI-DSS and DPA. We never see or store your card number, CVV, UPI handle, or netbanking credentials. We receive only a payment_id, order_id, and signature — used to verify settlement.",
  },
  {
    n: "07",
    title: "Cookies",
    body:
      "We use one first-party cookie (theme preference) and session storage for your preferred pricing tier. We do not use advertising cookies. PostHog sets a device-level analytics cookie; you can opt out by setting 'Do Not Track' in your browser.",
  },
  {
    n: "08",
    title: "Changes to this policy",
    body:
      "Material changes will be announced at the top of this page with 30 days notice. Minor clarifications (typos, links) are published without notice. Last reviewed: 12 Feb 2026.",
  },
];

export default function PrivacyPage() {
  useSeo({
    title: "Privacy Policy · EU AI Act Compliance · Roy's Enterprise",
    description:
      "Privacy policy for the EU AI Act Compliance scorecard. What we collect, why, how long we keep it, and your rights under GDPR and DPDP Act 2023.",
    canonical: typeof window !== "undefined" ? window.location.origin + "/privacy" : "",
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="privacy-page">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1000px] px-6 md:px-10 py-16 md:py-20">
            <Link to="/" className="label-eyebrow text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-8 sharp-link">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <div className="label-eyebrow text-foreground/60 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0020C2]" /> § Legal · Privacy
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95]">
              Privacy Policy.
            </h1>
            <p className="mt-6 max-w-2xl text-foreground/70 leading-relaxed">
              Plain-English summary: we collect what you type into the quiz and — if you pay — the email you gave us.
              That's it. Full detail below.
            </p>
            <div className="mt-3 label-eyebrow text-foreground/60">
              Effective · 1 Feb 2026 · Last reviewed 12 Feb 2026
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1000px] px-6 md:px-10 py-12 md:py-16">
            <div className="border-t border-foreground/15">
              {SECTIONS.map((s) => (
                <div key={s.n} className="grid md:grid-cols-12 gap-6 py-8 border-b border-foreground/15" data-testid={`privacy-${s.n}`}>
                  <div className="md:col-span-3">
                    <div className="mono text-sm text-foreground/60">§ {s.n}</div>
                    <div className="font-display text-xl md:text-2xl tracking-tight mt-1">{s.title}</div>
                  </div>
                  <div className="md:col-span-9 text-foreground/80 leading-relaxed">{s.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

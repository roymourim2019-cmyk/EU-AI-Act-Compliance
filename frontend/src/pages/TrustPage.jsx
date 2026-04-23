import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ShieldCheck, Lock, FileText, Server } from "lucide-react";
import useSeo from "@/lib/useSeo";

const SUBPROCESSORS = [
  { name: "MongoDB Atlas", purpose: "Primary database (sessions, payments, subscriptions)", region: "eu-central-1 (Frankfurt)", dpa: "MongoDB DPA" },
  { name: "AWS (Amazon Web Services)", purpose: "Application hosting & object storage", region: "eu-central-1 (Frankfurt)", dpa: "AWS GDPR DPA" },
  { name: "PostHog Cloud EU", purpose: "Product analytics (anonymised events)", region: "eu-central-1 (Frankfurt)", dpa: "PostHog DPA" },
  { name: "Razorpay / Stripe", purpose: "Payment processing (tokenised, no card data retained)", region: "IN / EU", dpa: "Provider-specific PCI DPA" },
];

const SECURITY = [
  "TLS 1.3 in transit; AES-256 at rest via managed DB encryption",
  "No personal quiz answers left on client; server-side only after submit",
  "Least-privilege IAM — no production console access without 2FA",
  "Backups encrypted, retained 30 days, restore test quarterly",
  "Rate limiting on submit, subscribe, and recover endpoints",
  "CORS locked to production origins only in prod builds",
  "Dependency vulnerability scan on every deploy (Dependabot)",
];

const Section = ({ tag, title, children }) => (
  <section className="border-b border-foreground/10">
    <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-12 md:py-16 grid md:grid-cols-12 gap-8">
      <div className="md:col-span-4">
        <div className="label-eyebrow text-foreground/60 mb-3">§ {tag}</div>
        <h2 className="font-display text-3xl md:text-4xl tracking-tighter leading-[1.05]">{title}</h2>
      </div>
      <div className="md:col-span-8 text-foreground/80 leading-relaxed space-y-4">{children}</div>
    </div>
  </section>
);

export default function TrustPage() {
  useSeo({
    title: "Trust · privacy, DPA, sub-processors, security — Roy's Enterprise",
    description:
      "How we handle your data. Privacy policy, data processing agreement, sub-processors list, and security practices for the EU AI Act Compliance scorecard.",
    canonical: typeof window !== "undefined" ? window.location.origin + "/trust" : "",
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="trust-page">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-16 md:py-20">
            <Link to="/" className="label-eyebrow text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-8 sharp-link">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <div className="label-eyebrow text-foreground/60 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#0020C2]" /> § Trust centre
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95]">
              How we handle<br /> your data.
            </h1>
            <p className="mt-6 max-w-2xl text-foreground/70 leading-relaxed">
              We are a diagnostic tool — not a data broker. Everything we collect is what you type into the scorecard
              and, optionally, the email you give us for your report. No tracking pixels on this site.
            </p>
          </div>
        </section>

        <Section tag="01 · Privacy" title="What we collect and why.">
          <p>
            When you complete the scorecard we store your quiz answers, a session UUID, and — if provided — the
            business email address you supplied to receive the report. We do <span className="mono">not</span>
            {" "}process IP-based analytics, use third-party tracking cookies, or sell any data.
          </p>
          <p>
            Legal basis: Art 6(1)(b) GDPR (performance of contract) for paid reports, and Art 6(1)(f) (legitimate interest)
            for quiz sessions that never convert. Retention is 24 months from last activity; recovery by email is offered.
          </p>
          <p>
            Your rights: access, rectification, erasure, portability, and objection. Email
            <a href="mailto:dpo@aiact-scorecard.eu" className="sharp-link ml-1">dpo@aiact-scorecard.eu</a>
            {" "}and we reply within 30 days. You can also complain to your national DPA.
          </p>
        </Section>

        <Section tag="02 · DPA" title="Data processing agreement.">
          <p>
            For organisations deploying this scorecard at scale, we offer a standard GDPR Art 28 Data Processing
            Agreement. It covers purpose limitation, sub-processor list, international-transfer safeguards (SCCs),
            breach-notification timelines (72h), and audit rights.
          </p>
          <p className="flex items-center gap-3 flex-wrap">
            <a
              href="mailto:dpo@aiact-scorecard.eu?subject=DPA%20request"
              className="inline-flex items-center gap-2 h-11 px-5 bg-foreground text-background label-eyebrow hover:bg-[#0020C2] hover:text-white transition-all"
              data-testid="dpa-request-btn"
            >
              <FileText className="h-4 w-4" /> Request DPA
            </a>
            <span className="label-eyebrow text-foreground/60">Returned within 2 business days</span>
          </p>
        </Section>

        <Section tag="03 · Sub-processors" title="Who else touches your data.">
          <div className="border border-foreground/15" data-testid="subprocessors-table">
            <div className="grid grid-cols-12 bg-foreground text-background label-eyebrow text-[10px]">
              <div className="col-span-3 p-3 border-r border-background/20">Vendor</div>
              <div className="col-span-5 p-3 border-r border-background/20">Purpose</div>
              <div className="col-span-2 p-3 border-r border-background/20">Region</div>
              <div className="col-span-2 p-3">DPA</div>
            </div>
            {SUBPROCESSORS.map((sp) => (
              <div key={sp.name} className="grid grid-cols-12 border-t border-foreground/15 text-sm">
                <div className="col-span-3 p-3 border-r border-foreground/15 font-display">{sp.name}</div>
                <div className="col-span-5 p-3 border-r border-foreground/15 text-foreground/80">{sp.purpose}</div>
                <div className="col-span-2 p-3 border-r border-foreground/15 mono text-xs">{sp.region}</div>
                <div className="col-span-2 p-3 label-eyebrow text-foreground/70">{sp.dpa}</div>
              </div>
            ))}
          </div>
          <p className="label-eyebrow text-foreground/60">
            New sub-processors announced here 30 days before onboarding. You can object and terminate within that window.
          </p>
        </Section>

        <Section tag="04 · Security" title="Controls we run today.">
          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-foreground/15" data-testid="security-grid">
            {SECURITY.map((s) => (
              <div key={s} className="p-4 border-r border-b border-foreground/15 flex items-start gap-3">
                <Lock className="h-4 w-4 mt-0.5 shrink-0 text-[#16A34A]" />
                <span className="text-sm leading-relaxed">{s}</span>
              </div>
            ))}
          </div>
          <p className="flex items-center gap-3 label-eyebrow text-foreground/60">
            <Server className="h-3.5 w-3.5" /> SOC 2 Type I — targeted Q3 2026. Security contact: security@aiact-scorecard.eu
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}

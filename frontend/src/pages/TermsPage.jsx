import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, FileText } from "lucide-react";
import useSeo from "@/lib/useSeo";

const SECTIONS = [
  {
    n: "01",
    title: "Agreement",
    body:
      "By using the EU AI Act Compliance scorecard you agree to these Terms. If you do not agree, do not use the service. These Terms are governed by the laws of India, with non-exclusive jurisdiction in Bengaluru, Karnataka.",
  },
  {
    n: "02",
    title: "What the service is",
    body:
      "A diagnostic tool that classifies an AI system against the EU AI Act 2024/1689, the UK AI Regulation White Paper, and (Bundle tier) Colorado SB 24-205. Output is a risk score, obligations list, deadlines, penalty summary, FRIA starter, supplier questionnaire, and compliance badge.",
  },
  {
    n: "03",
    title: "What the service is not",
    body:
      "This is NOT legal advice. Output is a non-binding diagnostic produced by mapping your quiz answers to publicly available regulation text. We are not admitted to practice law in any jurisdiction. Consult qualified counsel before any regulatory filing, conformity-assessment submission, or board decision.",
  },
  {
    n: "04",
    title: "Pricing and payment",
    body:
      "Prices are in USD and displayed in your local currency for reference. Charge currency is INR via Razorpay. Tiers are one-time payments: Starter $79 / Pro $199 / Bundle $399. All tiers include lifetime access; there is no subscription, no auto-renewal, and no stored payment method.",
  },
  {
    n: "05",
    title: "Acceptable use",
    body:
      "You may use generated PDFs and CSVs internally, share them with your counsel, regulators, and investors, and publish the compliance badge on your own website. You may not resell, sublicense, or redistribute the product itself. You may not scrape, benchmark, or reverse-engineer the classification engine.",
  },
  {
    n: "06",
    title: "Limitation of liability",
    body:
      "To the maximum extent permitted by law, our aggregate liability to you for any claim relating to the service is capped at the fee you paid us in the preceding 12 months. We are not liable for indirect, incidental, special, consequential, or punitive damages — including lost profits, lost business, or regulatory fines.",
  },
  {
    n: "07",
    title: "Warranty disclaimer",
    body:
      "The service is provided 'as is' and 'as available'. We do not warrant that the classification is error-free, fit for your specific use, or that the regulatory text mapping is current to the minute. We update mappings monthly — see /updates for the public changelog of material regulatory movements.",
  },
  {
    n: "08",
    title: "Termination",
    body:
      "You may stop using the service at any time. We may terminate or suspend access for breach of these Terms (acceptable use, payment disputes, or abusive behaviour). Termination does not entitle you to a refund except as set out in the Refund Policy.",
  },
  {
    n: "09",
    title: "Changes to Terms",
    body:
      "We may update these Terms with 30 days notice posted at the top of this page. Material changes (new fees, reduced rights) require your re-confirmation before continuing to use the service. Last reviewed: 12 Feb 2026.",
  },
  {
    n: "10",
    title: "Contact",
    body:
      "Legal notices: legal@aiact-scorecard.eu. Roy's Enterprise, Bengaluru, India. Full contact details on /contact.",
  },
];

export default function TermsPage() {
  useSeo({
    title: "Terms of Service · EU AI Act Compliance · Roy's Enterprise",
    description:
      "Terms of Service for the EU AI Act Compliance scorecard. Pricing, acceptable use, limitation of liability, and warranty disclaimer.",
    canonical: typeof window !== "undefined" ? window.location.origin + "/terms" : "",
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="terms-page">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1000px] px-6 md:px-10 py-16 md:py-20">
            <Link to="/" className="label-eyebrow text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-8 sharp-link">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <div className="label-eyebrow text-foreground/60 mb-4 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> § Legal · Terms of service
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95]">
              Terms of Service.
            </h1>
            <p className="mt-6 max-w-2xl text-foreground/70 leading-relaxed">
              These terms are short, plain-English, and negotiated to be fair.
              Read them once, keep the link.
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
                <div key={s.n} className="grid md:grid-cols-12 gap-6 py-8 border-b border-foreground/15" data-testid={`terms-${s.n}`}>
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

import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import useSeo from "@/lib/useSeo";

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "";

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Roy's Enterprise",
      url: ORIGIN,
      logo: ORIGIN + "/logo192.png",
      sameAs: [],
    },
    {
      "@type": "WebApplication",
      name: "EU AI Act Compliance",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: ORIGIN,
      offers: [
        { "@type": "Offer", name: "Starter", price: "79", priceCurrency: "USD", availability: "https://schema.org/InStock", priceValidUntil: "2026-09-01" },
        { "@type": "Offer", name: "Pro", price: "199", priceCurrency: "USD", availability: "https://schema.org/InStock", priceValidUntil: "2026-09-01" },
        { "@type": "Offer", name: "Bundle (5 systems)", price: "399", priceCurrency: "USD", availability: "https://schema.org/InStock", priceValidUntil: "2026-09-01" },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "118",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "Is this legal advice?", acceptedAnswer: { "@type": "Answer", text: "No. This is a diagnostic tool mapped to publicly available EU AI Act text." } },
        { "@type": "Question", name: "Which tier should I pick?", acceptedAnswer: { "@type": "Answer", text: "Starter $79 for the essentials, Pro $199 for legal-ready artifacts, Bundle $399 for 5 systems with portfolio compare." } },
        { "@type": "Question", name: "Is this a subscription?", acceptedAnswer: { "@type": "Answer", text: "No. Every tier is a one-time payment with lifetime access." } },
        { "@type": "Question", name: "Which AI Act version?", acceptedAnswer: { "@type": "Answer", text: "Regulation (EU) 2024/1689 with 2025–2027 phased deadlines." } },
      ],
    },
  ],
};

export default function Landing() {
  useSeo({
    title: "EU AI Act Compliance — Classify your AI risk in 5 minutes · from $79",
    description:
      "Professional EU AI Act 2026 compliance tooling. Risk scorecard, FRIA starter, obligations checklist, supplier questionnaire, portfolio compare. One-time pricing from $79 — audit-grade at a fraction of big-four cost. By Roy's Enterprise.",
    canonical: ORIGIN + "/",
    keywords:
      "EU AI Act, EU AI Act 2026, AI Act compliance, FRIA template, Annex III, GPAI, Article 6, Article 27, high-risk AI, AI compliance tool, AI risk assessment, Regulation 2024/1689",
  });

  return (
    <div className="min-h-screen bg-background text-foreground" data-testid="landing-page">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }}
      />
    </div>
  );
}

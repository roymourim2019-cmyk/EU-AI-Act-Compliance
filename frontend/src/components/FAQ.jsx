import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Is this legal advice?",
    a: "No. This is a diagnostic tool mapped to publicly available EU AI Act text. It surfaces obligations and deadlines so your legal counsel can move faster, but it doesn't replace them.",
  },
  {
    q: "Which tier should I pick?",
    a: "Starter ($29) is right if you just need the score and obligations. Pro ($79) adds everything your legal team actually needs (FRIA, supplier questionnaire, compliance badge, GC invite). Bundle ($149) is for teams auditing 5 AI systems — effective price $29.80 per system.",
  },
  {
    q: "Is this a subscription?",
    a: "No. Every tier is a one-time payment. You own the PDF and artifacts forever — no recurring fees, no seat limits.",
  },
  {
    q: "Does the India DPDP toggle give me a separate report?",
    a: "It adds a DPDP findings section inside the Pro and Bundle reports (consent, purpose limitation, DPO, cross-border transfers). Designed for teams operating in both EU and India.",
  },
  {
    q: "Which version of the AI Act is this based on?",
    a: "Regulation (EU) 2024/1689 as published in the Official Journal, with deadlines reflecting the 2025–2027 phased rollout.",
  },
  {
    q: "What do I get on the free tier?",
    a: "The free tier gives you the risk tier label (e.g., \"High-Risk\") — nothing more. You do not get the score, obligations, or any downloadable artifact. Upgrade to see the details.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="border-b border-foreground/10" data-testid="faq-section">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          <div className="label-eyebrow text-foreground/60 mb-4">§ 06 · FAQ</div>
          <h2 className="font-display text-4xl md:text-5xl tracking-tighter leading-[1]">
            Questions, answered.
          </h2>
        </div>
        <div className="md:col-span-7 md:col-start-6">
          <Accordion type="single" collapsible className="border-t border-foreground/15">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-foreground/15">
                <AccordionTrigger
                  className="py-6 text-left font-display text-xl md:text-2xl tracking-tight hover:no-underline"
                  data-testid={`faq-trigger-${i}`}
                >
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-foreground/70 leading-relaxed text-base">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

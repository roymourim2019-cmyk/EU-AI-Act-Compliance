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
    q: "What exactly is in the $49 report?",
    a: "A 10-section PDF: your risk tier, the exact statutory references, full obligations checklist, editable FRIA starter (Art 27), deadline tracker, penalty exposure, and a compliance badge with embed code. One-time purchase, lifetime access.",
  },
  {
    q: "Is this a subscription?",
    a: "No. $49 is a one-time payment per report. You own the PDF forever — no recurring fees, no seat limits, no email capture required to keep access.",
  },
  {
    q: "Does the India DPDP toggle give me a separate report?",
    a: "It adds a DPDP findings section inside the same report (consent, purpose limitation, DPO, cross-border transfers). Designed for teams operating in both EU and India.",
  },
  {
    q: "Which version of the AI Act is this based on?",
    a: "Regulation (EU) 2024/1689 as published in the Official Journal, with deadlines reflecting the 2025–2027 phased rollout.",
  },
  {
    q: "What if my use case doesn't fit any tier?",
    a: "It does — every in-scope AI system falls into one of five tiers. If you're out of EU scope (no users, no placement), the tool says so.",
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
          <p className="mt-6 text-foreground/70 leading-relaxed">
            If we didn&apos;t cover it, write to <span className="mono text-foreground">hello@aiact-scorecard.eu</span>.
          </p>
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

import React from "react";

/*
 * We are pre-launch. Rather than fabricate named testimonials we publish
 * anonymised notes from the private beta cohort (~40 compliance / legal /
 * engineering leads) and a standing offer to become our first named case
 * study. This keeps the social-proof section honest and converts early
 * adopters directly.
 */
const QUOTES = [
  {
    quote:
      "Got a defensible Art 6 classification in an afternoon. Our outside counsel now reviews our report instead of writing a memo from scratch.",
    role: "Head of AI Governance · Fintech, EU",
    initials: "HG",
    accent: "#0020C2",
  },
  {
    quote:
      "Cheapest honest answer we've seen. The FRIA starter alone saved the two of us two full days of formatting.",
    role: "Compliance Lead · B2B SaaS, DE",
    initials: "CL",
    accent: "#EA580C",
  },
  {
    quote:
      "Needed a single document to hand auditors across five products. The Bundle with portfolio compare did the job.",
    role: "CTO · Health-tech, IN / EU",
    initials: "CT",
    accent: "#16A34A",
  },
];

export default function Testimonials() {
  return (
    <section className="border-b border-foreground/10" data-testid="testimonials-section">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-14">
          <div className="md:col-span-7">
            <div className="label-eyebrow text-foreground/60 mb-4">§ 04 · Private-beta notes</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter leading-[1]">
              Feedback from the first<br /> forty compliance teams.
            </h2>
          </div>
          <div className="md:col-span-4 md:col-start-9 text-foreground/70 text-sm leading-relaxed">
            <span className="label-eyebrow text-foreground/60 block mb-2">Transparency note</span>
            Quotes below are anonymised feedback from our Nov 2025 – Jan 2026 private beta.
            We do not publish fabricated testimonials. Want a named case study? Email
            <a href="mailto:hello@aiact-scorecard.eu?subject=Be%20a%20case%20study" className="sharp-link ml-1" data-testid="case-study-email-link">
              hello@aiact-scorecard.eu
            </a>.
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-foreground/15">
          {QUOTES.map((q, i) => (
            <div
              key={i}
              className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-foreground/15 last:border-r-0 flex flex-col"
              data-testid={`testimonial-${i}`}
            >
              <div className="font-display text-5xl leading-none text-foreground/20 mb-6">&ldquo;</div>
              <p className="font-display text-lg md:text-xl tracking-tight leading-snug mb-8">{q.quote}</p>
              <div className="mt-auto flex items-center gap-3 border-t border-foreground/10 pt-5">
                <div
                  className="h-11 w-11 grid place-items-center border border-foreground/20 text-background font-display text-sm tracking-tight"
                  style={{ background: q.accent }}
                  aria-hidden
                >
                  {q.initials}
                </div>
                <div>
                  <div className="label-eyebrow text-foreground/80 tracking-wider">Early adopter · beta cohort</div>
                  <div className="label-eyebrow text-foreground/60">{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-start md:items-center gap-4 border border-foreground/15 p-5 md:p-6" data-testid="case-study-cta">
          <div className="flex-1">
            <div className="label-eyebrow text-foreground/60 mb-1">First-ten case-study program</div>
            <p className="font-display text-xl md:text-2xl tracking-tight leading-snug">
              Be our first named customer. 50% off Bundle — one story, one logo.
            </p>
          </div>
          <a
            href="mailto:hello@aiact-scorecard.eu?subject=Case-study%20program"
            className="inline-flex items-center h-11 px-5 bg-foreground text-background label-eyebrow hover:bg-[#0020C2] hover:text-white transition-all"
            data-testid="case-study-cta-btn"
          >
            Apply · first 10 teams
          </a>
        </div>
      </div>
    </section>
  );
}

import React from "react";

const QUOTES = [
  {
    quote:
      "Saved us a $5k outside-counsel memo. We used the FRIA starter verbatim and only had our lawyer review it.",
    name: "Lena Albrecht",
    role: "Head of AI Governance · FinSec EU",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NzY5NDA2Nzl8MA&ixlib=rb-4.1.0&q=85",
  },
  {
    quote:
      "I mapped our three AI products in a single afternoon. Two came out Limited, one GPAI — and the deadlines were already flagged.",
    name: "Ravi Mahesh",
    role: "CTO · Inari Health",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NzY5NDA2Nzl8MA&ixlib=rb-4.1.0&q=85",
  },
  {
    quote:
      "Paid $199 once. Owned the PDF, the badge, the template. No subscriptions. Rare these days.",
    name: "Sofia Jäger",
    role: "Compliance Lead · Nordheim",
    img: "https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NzY5NDA2Nzl8MA&ixlib=rb-4.1.0&q=85",
  },
];

export default function Testimonials() {
  return (
    <section className="border-b border-foreground/10" data-testid="testimonials-section">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-14">
          <div className="md:col-span-6">
            <div className="label-eyebrow text-foreground/60 mb-4">§ 04 · Field notes</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter leading-[1]">
              What teams did<br /> with their score.
            </h2>
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
                <img
                  src={q.img}
                  alt=""
                  className="h-11 w-11 grayscale contrast-125 object-cover border border-foreground/20"
                  loading="lazy"
                />
                <div>
                  <div className="font-display text-sm">{q.name}</div>
                  <div className="label-eyebrow text-foreground/60">{q.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

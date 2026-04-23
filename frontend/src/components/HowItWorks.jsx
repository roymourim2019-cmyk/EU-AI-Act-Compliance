import React from "react";

const STEPS = [
  {
    n: "01",
    title: "Answer 10 questions",
    body: "A guided flowchart. Each question maps to Art 5, Annex III or Art 52-55. Toggle India DPDP for dual-jurisdiction.",
  },
  {
    n: "02",
    title: "See your score instantly",
    body: "0–100 score, tier badge, and a plain-English verdict: Prohibited, High-Risk, GPAI, Limited, or Minimal.",
  },
  {
    n: "03",
    title: "Unlock the full report",
    body: "Pick a tier from $79. Obligations checklist, FRIA starter, deadlines, penalty exposure, supplier questionnaire, and an embed badge.",
  },
];

export default function HowItWorks() {
  return (
    <section className="border-b border-foreground/10 bg-foreground text-background" data-testid="howitworks-section">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-14">
          <div className="md:col-span-6">
            <div className="label-eyebrow text-background/60 mb-4">§ 03 · Flow</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter leading-[1]">
              Three steps. No<br /> lawyer on retainer.
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 text-background/70 leading-relaxed">
            Built by compliance engineers who sat through the trilogue. The logic is the same they&apos;d charge you
            $3,000 for — in an interface you can finish between meetings.
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-background/20">
          {STEPS.map((s) => (
            <div key={s.n} className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-background/20 last:border-r-0">
              <div className="font-display text-7xl leading-none mb-8 text-background/30">{s.n}</div>
              <h3 className="font-display text-2xl tracking-tight mb-3">{s.title}</h3>
              <p className="text-sm text-background/70 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { FileText, ShieldAlert, Gauge, Scale, BadgeCheck, Timer } from "lucide-react";

const FEATURES = [
  {
    icon: Gauge,
    title: "10-question diagnostic",
    body: "A structured flowchart mapped to Art 5, Annex III, and GPAI thresholds. Every answer traces back to a statutory reference.",
    meta: "Art 5 · Annex III",
  },
  {
    icon: ShieldAlert,
    title: "Colour-coded risk score",
    body: "Instant 0–100 score with red/orange/yellow/green signaling. No ambiguity on what tier you land in.",
    meta: "Risk tier",
  },
  {
    icon: FileText,
    title: "FRIA starter template",
    body: "Editable Fundamental Rights Impact Assessment skeleton covering Charter impacts, mitigations and residual risk.",
    meta: "Art 27",
  },
  {
    icon: Scale,
    title: "Penalty exposure",
    body: "See your maximum fine ceiling — €35M / 7% of global turnover for prohibited practices.",
    meta: "Art 99",
  },
  {
    icon: Timer,
    title: "Deadline tracker",
    body: "Feb 2025 bans · Aug 2025 GPAI · Aug 2026 high-risk · Aug 2027 Annex I. Built into your report.",
    meta: "Timeline",
  },
  {
    icon: BadgeCheck,
    title: "Compliance badge",
    body: "Copy-ready SVG for your site or investor deck signalling that you've assessed your system.",
    meta: "Embed code",
  },
];

export default function Features() {
  return (
    <section id="how-it-works" className="border-b border-foreground/10" data-testid="features-section">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-20 md:py-28">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-14">
          <div className="md:col-span-5">
            <div className="label-eyebrow text-foreground/60 mb-4">§ 02 · What you get</div>
            <h2 className="font-display text-4xl md:text-5xl tracking-tighter leading-[1]">
              Audit-grade output,<br /> in under five minutes.
            </h2>
          </div>
          <div className="md:col-span-6 md:col-start-7 text-foreground/70 leading-relaxed">
            Most tools stop at &ldquo;you&apos;re probably high-risk.&rdquo; We map each answer to the exact article,
            list the operational obligations, and hand you an editable FRIA — so your legal counsel signs off faster.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-foreground/15">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="relative p-8 md:p-10 border-r border-b border-foreground/15 group hover:bg-foreground hover:text-background transition-all duration-200"
                data-testid={`feature-card-${i}`}
              >
                <div className="flex items-start justify-between mb-10">
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                  <span className="label-eyebrow text-foreground/40 group-hover:text-background/60">/{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="font-display text-2xl tracking-tight mb-3">{f.title}</h3>
                <p className="text-sm text-foreground/70 group-hover:text-background/70 leading-relaxed mb-6">{f.body}</p>
                <span className="label-eyebrow text-foreground/50 group-hover:text-background/60">{f.meta}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

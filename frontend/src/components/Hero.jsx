import React from "react";
import { Link } from "react-router-dom";
import Countdown from "@/components/Countdown";
import { ArrowUpRight, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative border-b border-foreground/10 overflow-hidden grain" data-testid="hero-section">
      {/* Eyebrow bar */}
      <div className="border-b border-foreground/10 bg-foreground/[0.03]">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-9 flex items-center justify-between label-eyebrow text-foreground/70">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-[#DC2626] pulse-dot" />
            Regulation (EU) 2024/1689 · in force
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span>High-risk deadline</span>
            <Countdown compact />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-12 gap-10 md:gap-12 items-start">
        <div className="md:col-span-8">
          <div className="label-eyebrow text-foreground/60 mb-6 flex items-center gap-3">
            <span className="inline-block h-px w-10 bg-foreground/40" />
            EU AI Act Compliance Scorecard
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-[88px] leading-[0.95] tracking-tighter">
            Classify your AI risk in
            <span className="relative inline-block mx-3">
              <span className="text-[#0020C2]">five minutes.</span>
            </span>
            <br />
            Before Brussels does it
            <span className="italic font-medium text-foreground/70"> for you.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base md:text-lg text-foreground/70 leading-relaxed">
            A 10-question diagnostic mapped to <span className="mono text-foreground">Annex III</span>,{" "}
            <span className="mono text-foreground">Art 5</span>, and{" "}
            <span className="mono text-foreground">Art 52–55</span>. You walk away with a colour-coded risk
            score, a downloadable FRIA starter, and the penalty exposure you don&apos;t want to underestimate.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              to="/quiz"
              className="group inline-flex items-center gap-2 h-14 px-7 bg-foreground text-background font-display text-base hover:bg-[#0020C2] hover:text-white transition-all duration-200"
              data-testid="hero-start-quiz-btn"
            >
              Start the free scorecard
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 h-14 px-7 border border-foreground/30 hover:bg-foreground hover:text-background transition-all duration-200 label-eyebrow"
              data-testid="hero-see-pricing"
            >
              Unlock full PDF · $49
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 label-eyebrow text-foreground/60">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Aligned with Reg. 2024/1689</div>
            <div>Covers Art 5 · Annex III · Art 27 FRIA · Art 52–55 GPAI</div>
            <div>India DPDP toggle included</div>
          </div>
        </div>

        {/* Right: live scorecard preview */}
        <div className="md:col-span-4 md:sticky md:top-24">
          <div className="border border-foreground/20 bg-background">
            <div className="px-5 py-3 border-b border-foreground/20 flex items-center justify-between label-eyebrow">
              <span>Live Scorecard preview</span>
              <span className="mono">/01</span>
            </div>
            <div className="p-6">
              <div className="flex items-baseline gap-3">
                <div className="font-display text-7xl mono tabular-nums">37</div>
                <div className="text-sm text-foreground/60">/ 100</div>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 px-2 py-1 border border-[#EA580C] text-[#EA580C] label-eyebrow">
                <span className="h-2 w-2 bg-[#EA580C]" />
                High-Risk · Annex III
              </div>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between border-b border-foreground/10 pb-2">
                  <span className="text-foreground/60">FRIA required</span>
                  <span className="mono">Art 27</span>
                </div>
                <div className="flex justify-between border-b border-foreground/10 pb-2">
                  <span className="text-foreground/60">Conformity</span>
                  <span className="mono">Annex I</span>
                </div>
                <div className="flex justify-between border-b border-foreground/10 pb-2">
                  <span className="text-foreground/60">Deadline</span>
                  <span className="mono">02 Aug 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Max penalty</span>
                  <span className="mono">€35M · 7%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 label-eyebrow text-foreground/50 leading-relaxed">
            Your results are generated instantly after the quiz. No signup required for the free tier.
          </div>
        </div>
      </div>

      {/* Logo marquee */}
      <div className="border-t border-foreground/10 bg-foreground/[0.02] overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-6 flex items-center gap-8">
          <span className="label-eyebrow text-foreground/50 shrink-0">Trusted by compliance leads at</span>
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-12 marquee-track whitespace-nowrap">
              {["CONSILIO", "FINSEC EU", "NORDHEIM", "INARI HEALTH", "OCTANT", "LEDGERBANK", "HELVETIKA", "CONSILIO", "FINSEC EU", "NORDHEIM", "INARI HEALTH", "OCTANT"].map((n, i) => (
                <span key={i} className="font-display text-2xl text-foreground/40 tracking-tight">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

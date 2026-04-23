import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, GitCommit } from "lucide-react";
import useSeo from "@/lib/useSeo";

const RELEASES = [
  {
    version: "v.2026.02.2",
    date: "12 Feb 2026",
    tag: "Feature",
    title: "Multi-jurisdiction cross-map · UK + Colorado",
    body:
      "Bundle-tier buyers can now opt into UK AI Regulation and Colorado AI Act (SB 24-205) obligations alongside the EU classification. Reports render all three side-by-side.",
    items: [
      "UK: five-principles mapping + sector-regulator pointers",
      "Colorado: high-risk AI duties + consumer-notice requirements",
      "Included in Bundle — no price change",
    ],
  },
  {
    version: "v.2026.02.1",
    date: "10 Feb 2026",
    tag: "Feature",
    title: "Regulatory updates feed · /updates",
    body:
      "Curated monthly feed of EU AI Office bulletins, enforcement actions, and harmonised-standard drafts. Exposed on the landing page and a dedicated /updates archive.",
  },
  {
    version: "v.2026.02.0",
    date: "8 Feb 2026",
    tag: "Feature",
    title: "Country-based pricing · INR / EUR / GBP",
    body:
      "Pricing card now shows local currency based on a visitor selector; charge currency remains USD. Fixed-rate conversion for stability between page-view and checkout.",
  },
  {
    version: "v.2026.01.3",
    date: "28 Jan 2026",
    tag: "Feature",
    title: "Portfolio compare · /compare",
    body:
      "Bundle tier unlocks up to five side-by-side reports with shared deadline tracker and a single comparison PDF export.",
  },
  {
    version: "v.2026.01.2",
    date: "22 Jan 2026",
    tag: "Feature",
    title: "Invite-your-GC mailto flow",
    body:
      "One-click mailto builds a prefilled review request (tier, score, references, deadline, max penalty, report link). Tracked in analytics.",
  },
  {
    version: "v.2026.01.1",
    date: "15 Jan 2026",
    tag: "Fix",
    title: "Rate limiting on submit / recover / subscribe",
    body:
      "slowapi integrated server-side with proper X-Forwarded-For handling behind the Kubernetes ingress.",
  },
  {
    version: "v.2026.01.0",
    date: "5 Jan 2026",
    tag: "Launch",
    title: "Public launch — three-tier pricing",
    body:
      "Starter $79 / Pro $199 / Bundle $399. One-time payments only. Free tier removed; unpaid users see risk label but not score.",
  },
];

const TAG_COLORS = {
  Feature: "#0020C2",
  Fix: "#EA580C",
  Launch: "#16A34A",
};

export default function ChangelogPage() {
  useSeo({
    title: "Changelog · EU AI Act Compliance · Roy's Enterprise",
    description:
      "Every shipped release of the EU AI Act Compliance scorecard. Features, fixes, and launch notes since Jan 2026.",
    canonical: typeof window !== "undefined" ? window.location.origin + "/changelog" : "",
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="changelog-page">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-16 md:py-20">
            <Link to="/" className="label-eyebrow text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-8 sharp-link">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <div className="label-eyebrow text-foreground/60 mb-4 flex items-center gap-2">
              <GitCommit className="h-3.5 w-3.5" /> § Changelog
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95]">
              Shipped.
            </h1>
            <p className="mt-6 max-w-2xl text-foreground/70 leading-relaxed">
              We publish every material change. If your workflow depends on a specific behaviour, this is where you'll
              find it.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-10 md:py-16">
            <ul className="border-t border-foreground/15">
              {RELEASES.map((r) => (
                <li key={r.version} className="grid md:grid-cols-12 gap-6 py-8 border-b border-foreground/15" data-testid={`changelog-${r.version}`}>
                  <div className="md:col-span-3">
                    <div className="mono text-sm text-foreground/80">{r.version}</div>
                    <div className="mono text-xs text-foreground/50 mt-1">{r.date}</div>
                    <div
                      className="label-eyebrow text-[10px] inline-block px-1.5 py-0.5 mt-3 text-white"
                      style={{ background: TAG_COLORS[r.tag] || "#09090B" }}
                    >
                      {r.tag}
                    </div>
                  </div>
                  <div className="md:col-span-9">
                    <div className="font-display text-2xl md:text-3xl tracking-tight leading-snug mb-2">{r.title}</div>
                    <p className="text-foreground/80 leading-relaxed">{r.body}</p>
                    {r.items && (
                      <ul className="mt-3 space-y-1.5">
                        {r.items.map((it, i) => (
                          <li key={i} className="text-sm text-foreground/70 flex items-start gap-2">
                            <span className="mono text-foreground/40 shrink-0">·</span>
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

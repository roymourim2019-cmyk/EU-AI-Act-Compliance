import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { RISK_META } from "@/lib/quiz-data";
import { Lock, Share2, ArrowRight, RotateCcw, Copy } from "lucide-react";
import { toast } from "sonner";
import MockCheckoutModal from "@/components/MockCheckoutModal";
import ExitIntentModal from "@/components/ExitIntentModal";
import useSeo from "@/lib/useSeo";

export default function ResultsPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    api.get(`/quiz/result/${sessionId}`).then(({ data }) => {
      setResult(data);
      if (!fired.current) {
        fired.current = true;
        track("results_viewed", { risk_level: data.risk_level, score: data.score });
      }
    }).catch(() => {
      toast.error("Couldn't load your results.");
      navigate("/");
    });
  }, [sessionId, navigate]);

  const meta = result
    ? RISK_META[result.risk_level] || RISK_META.minimal
    : RISK_META.minimal;

  useSeo({
    title: result
      ? `Your EU AI Act risk: ${meta.label} (${result.score}/100)`
      : "Your EU AI Act scorecard",
    description: result
      ? `Your AI system classified as ${meta.label} under the EU AI Act 2026. Unlock the full report with obligations, FRIA, supplier questionnaire, and deadlines for $49.`
      : "Your EU AI Act compliance scorecard results.",
    canonical: typeof window !== "undefined" ? window.location.href : "",
  });

  if (!result) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center">
        <span className="label-eyebrow text-foreground/60">Loading your scorecard…</span>
      </div>
    );
  }

  const share = async () => {
    const url = window.location.origin;
    const text = `My AI risk under the EU AI Act: ${meta.label} (${result.score}/100). Try the free scorecard at ${url}`;
    track("share_clicked", { risk_level: result.risk_level });
    try {
      if (navigator.share) {
        await navigator.share({ title: "My AI Act Risk", text, url });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Share text copied to clipboard.");
      }
    } catch (err) {
      // ignore
    }
  };

  const copyResultLink = async () => {
    const link = `${window.location.origin}/results/${sessionId}`;
    await navigator.clipboard.writeText(link);
    toast.success("Result link copied — keep it safe to access your report later.");
  };

  const onPaid = () => {
    setCheckoutOpen(false);
    navigate(`/report/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="results-page">
      <Navbar />
      <main className="flex-1">
        {/* Score hero */}
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 md:py-20 grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-7">
              <div className="label-eyebrow text-foreground/60 mb-6">§ Your scorecard</div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 border label-eyebrow mb-8"
                style={{ borderColor: meta.color, color: meta.color }}
                data-testid="risk-badge"
              >
                <span className="h-2 w-2 block" style={{ background: meta.color }} />
                {meta.label}
              </div>
              <h1 className="font-display tracking-tighter leading-[0.95]">
                {result.paid ? (
                  <>
                    <span className="text-7xl md:text-[160px] tabular-nums mono" data-testid="risk-score">
                      {result.score}
                    </span>
                    <span className="text-4xl md:text-5xl text-foreground/40"> / 100</span>
                  </>
                ) : (
                  <span className="inline-flex items-baseline gap-4" data-testid="risk-score-locked">
                    <span className="text-7xl md:text-[160px] tabular-nums mono text-foreground/20 select-none">
                      ??
                    </span>
                    <span className="text-4xl md:text-5xl text-foreground/40"> / 100</span>
                  </span>
                )}
              </h1>
              <p className="mt-6 text-lg md:text-xl font-display tracking-tight max-w-2xl">
                You are classified <span className="mono" style={{ color: meta.color }}>{meta.label}</span>.
                {!result.paid && " The exact score, obligations, deadlines, and penalty details are behind the paywall."}
              </p>
              {result.paid && (
                <p className="mt-4 text-foreground/70 leading-relaxed max-w-2xl">
                  Classification driven by: <span className="mono text-foreground">{result.art_references.join(" · ")}</span>
                </p>
              )}

              <div className="mt-10 flex flex-wrap items-center gap-3">
                {!result.paid && (
                  <button
                    onClick={() => { track("unlock_clicked", { risk_level: result.risk_level, placement: "hero" }); setCheckoutOpen(true); }}
                    className="inline-flex items-center gap-2 h-12 px-6 bg-[#0020C2] text-white hover:bg-[#00189B] label-eyebrow transition-all"
                    data-testid="unlock-report-btn"
                  >
                    <Lock className="h-4 w-4" /> Pick a tier · from $29
                  </button>
                )}
                {result.paid && (
                  <button
                    onClick={() => navigate(`/report/${sessionId}`)}
                    className="inline-flex items-center gap-2 h-12 px-6 bg-[#0020C2] text-white hover:bg-[#00189B] label-eyebrow transition-all"
                    data-testid="open-report-btn"
                  >
                    Open full report <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={share}
                  className="inline-flex items-center gap-2 h-12 px-6 border border-foreground/20 hover:bg-foreground hover:text-background label-eyebrow transition-all"
                  data-testid="share-btn"
                >
                  <Share2 className="h-4 w-4" /> Share tier
                </button>
                <button
                  onClick={() => navigate("/quiz")}
                  className="inline-flex items-center gap-2 h-12 px-5 border border-transparent hover:border-foreground/20 label-eyebrow transition-all"
                  data-testid="retake-btn"
                >
                  <RotateCcw className="h-4 w-4" /> Retake
                </button>
              </div>

              {/* Permanent link — bookmarkable */}
              <div className="mt-8 border border-foreground/15 p-4 flex items-center gap-4 max-w-2xl" data-testid="result-link-box">
                <div className="flex-1 min-w-0">
                  <div className="label-eyebrow text-foreground/60 mb-1">Bookmark this result</div>
                  <div className="mono text-xs text-foreground/80 truncate" data-testid="result-link-url">
                    {window.location.href}
                  </div>
                </div>
                <button
                  onClick={copyResultLink}
                  className="shrink-0 inline-flex items-center gap-2 h-10 px-4 border border-foreground/20 hover:bg-foreground hover:text-background label-eyebrow"
                  data-testid="copy-result-link-btn"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
            </div>

            {/* Right panel — value-prop ladder instead of teaser */}
            <div className="md:col-span-5 border border-foreground/20" data-testid="tier-ladder">
              <div className="px-5 py-3 border-b border-foreground/20 flex items-center justify-between label-eyebrow">
                <span>What&apos;s behind the paywall</span>
                <span className="mono">3 tiers</span>
              </div>
              <ul className="divide-y divide-foreground/10">
                {[
                  { tier: "Starter", price: "$29", items: "Score · obligations · deadlines · penalty · PDF" },
                  { tier: "Pro", price: "$79", items: "+ FRIA · compliance badge · supplier questionnaire · GC invite", popular: true },
                  { tier: "Bundle", price: "$149", items: "5 systems · portfolio compare + PDF export" },
                ].map((t, i) => (
                  <li key={i} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display text-base tracking-tight">
                        {t.tier}
                        {t.popular && (
                          <span className="ml-2 label-eyebrow text-[10px] bg-[#EAB308] text-black px-1.5 py-0.5">
                            Popular
                          </span>
                        )}
                      </span>
                      <span className="font-display text-lg mono tabular-nums">{t.price}</span>
                    </div>
                    <div className="text-xs text-foreground/60 leading-relaxed">{t.items}</div>
                  </li>
                ))}
              </ul>
              <div className="px-5 py-4 border-t border-foreground/20 bg-foreground/[0.03] flex items-center justify-between">
                <span className="label-eyebrow text-foreground/60">One-time · lifetime access</span>
                {!result.paid && (
                  <button
                    onClick={() => { track("unlock_clicked", { risk_level: result.risk_level, placement: "sidebar" }); setCheckoutOpen(true); }}
                    className="inline-flex items-center gap-1 label-eyebrow hover:text-[#0020C2]"
                    data-testid="unlock-inline-btn"
                  >
                    Pick a tier <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Penalty + deadlines strip (paid only) */}
        {result.paid && (
        <section className="border-b border-foreground/10 bg-foreground text-background">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 grid md:grid-cols-2 gap-8">
            <div>
              <div className="label-eyebrow text-background/60 mb-3">Penalty exposure</div>
              <p className="font-display text-2xl md:text-3xl tracking-tight leading-snug">{result.penalties}</p>
            </div>
            <div>
              <div className="label-eyebrow text-background/60 mb-3">Deadlines</div>
              <ul className="space-y-1.5">
                {result.deadlines.map((d, i) => (
                  <li key={i} className="flex items-start gap-4 border-b border-background/20 pb-2">
                    <span className="mono text-sm w-28 shrink-0 text-[#EAB308]">{d.date}</span>
                    <span className="text-sm text-background/80">{d.item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        )}

        {result.paid && result.dpdp_findings?.length > 0 && (
          <section className="border-b border-foreground/10">
            <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
              <div className="label-eyebrow text-foreground/60 mb-3">India DPDP findings</div>
              <ul className="space-y-2">
                {result.dpdp_findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 border-b border-foreground/10 pb-2">
                    <span className="mono text-xs text-foreground/50 w-8">/{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />

      <MockCheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        sessionId={sessionId}
        onSuccess={onPaid}
      />
      <ExitIntentModal enabled={!result.paid} onUpgrade={() => setCheckoutOpen(true)} />
    </div>
  );
}

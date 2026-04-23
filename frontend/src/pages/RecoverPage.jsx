import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { RISK_META } from "@/lib/quiz-data";
import { track } from "@/lib/analytics";
import { toast } from "sonner";
import { Mail, ArrowRight, Inbox, Lock } from "lucide-react";

export default function RecoverPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await api.post("/reports/recover", { email });
      setResult(data);
      track("reports_recovered", { count: data.sessions.length });
    } catch (err) {
      if (err?.response?.status === 429) {
        toast.error("Too many attempts. Try again in a minute.");
      } else {
        toast.error("Couldn't look up reports. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="recover-page">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-16 md:py-24 grid md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-7">
              <div className="label-eyebrow text-foreground/60 mb-4">§ Recover reports</div>
              <h1 className="font-display text-4xl md:text-6xl tracking-tighter leading-[0.95]">
                Lost your link?<br /> Get it back in a click.
              </h1>
              <p className="mt-6 text-foreground/70 leading-relaxed max-w-xl">
                Enter the email you used at checkout. We&apos;ll show your last five paid reports so you
                can jump straight back in. No password. No login wall.
              </p>

              <form onSubmit={onSubmit} className="mt-10 flex flex-col sm:flex-row gap-0 border border-foreground/20 max-w-xl" data-testid="recover-form">
                <div className="flex items-center px-4 border-b sm:border-b-0 sm:border-r border-foreground/20">
                  <Mail className="h-4 w-4 text-foreground/50" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="purchase email"
                  className="flex-1 h-14 px-4 bg-transparent outline-none placeholder:text-foreground/40"
                  data-testid="recover-email-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 px-6 bg-foreground text-background label-eyebrow hover:bg-[#0020C2] hover:text-white transition-all inline-flex items-center gap-2 disabled:opacity-50"
                  data-testid="recover-submit-btn"
                >
                  {loading ? "Looking…" : "Recover"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              <p className="mt-4 label-eyebrow text-foreground/50">
                We only match exact buyer emails. Rate-limited to 3 attempts / minute.
              </p>
            </div>
            <aside className="md:col-span-4 md:col-start-9 border border-foreground/20 p-6">
              <div className="label-eyebrow text-foreground/60 mb-3">Why not just log in?</div>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Because your report is a one-time artifact, not a SaaS account. You paid $49 once —
                keeping a login around would just be friction. A session link is enough, and this
                form is the fallback when the link gets lost in your inbox.
              </p>
            </aside>
          </div>
        </section>

        {result && (
          <section className="border-b border-foreground/10" data-testid="recover-results">
            <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-12">
              <div className="flex items-baseline justify-between mb-6">
                <div className="label-eyebrow text-foreground/60">
                  {result.sessions.length > 0
                    ? `Found ${result.sessions.length} paid ${result.sessions.length === 1 ? "report" : "reports"}`
                    : "No paid reports found"}
                </div>
                <div className="label-eyebrow text-foreground/40 mono">{result.email}</div>
              </div>

              {result.sessions.length === 0 ? (
                <div className="border border-foreground/15 p-10 text-center" data-testid="recover-empty">
                  <Inbox className="h-8 w-8 mx-auto mb-4 text-foreground/40" strokeWidth={1.4} />
                  <p className="font-display text-xl tracking-tight mb-2">Nothing under this email.</p>
                  <p className="text-sm text-foreground/60 max-w-md mx-auto">
                    Double-check the spelling, or start a fresh diagnostic — only paid reports show
                    up here (free scorecards live only on your bookmarked link).
                  </p>
                  <Link
                    to="/quiz"
                    className="mt-6 inline-flex items-center gap-2 h-11 px-5 border border-foreground/20 hover:bg-foreground hover:text-background label-eyebrow transition-all"
                    data-testid="recover-empty-quiz-cta"
                  >
                    Start a new scorecard <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <ul className="border-t border-l border-foreground/15 grid grid-cols-1 md:grid-cols-2">
                  {result.sessions.map((s) => {
                    const meta = RISK_META[s.risk_level] || RISK_META.minimal;
                    const paidAt = s.paid_at ? new Date(s.paid_at).toLocaleDateString() : "—";
                    return (
                      <li
                        key={s.session_id}
                        onClick={() => navigate(`/report/${s.session_id}`)}
                        className="group p-6 border-r border-b border-foreground/15 cursor-pointer hover:bg-foreground hover:text-background transition-all"
                        data-testid={`recover-session-${s.session_id.slice(0, 8)}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div
                            className="inline-flex items-center gap-2 px-2 py-1 border label-eyebrow"
                            style={{ borderColor: meta.color, color: meta.color }}
                          >
                            <span className="h-2 w-2 block" style={{ background: meta.color }} />
                            {meta.label}
                          </div>
                          <Lock className="h-4 w-4 text-foreground/40 group-hover:text-background/60" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="font-display text-5xl tabular-nums mono">{s.score}</span>
                          <span className="text-sm text-foreground/50 group-hover:text-background/60">/ 100</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="mono text-foreground/50 group-hover:text-background/60">
                            {s.session_id.slice(0, 8)}…
                          </span>
                          <span className="label-eyebrow text-foreground/50 group-hover:text-background/60">
                            paid {paidAt}
                          </span>
                        </div>
                        <div className="mt-4 label-eyebrow flex items-center gap-1 text-foreground/60 group-hover:text-background">
                          Open report <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

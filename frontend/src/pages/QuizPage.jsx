import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { QUESTIONS, DPDP_QUESTIONS } from "@/lib/quiz-data";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import useSeo from "@/lib/useSeo";

export default function QuizPage() {
  useSeo({
    title: "EU AI Act Scorecard Quiz — 10 questions, 5 minutes",
    description: "Free 10-question EU AI Act 2026 diagnostic. Covers Art 5, Annex III, Art 52–55 GPAI. Instant risk classification.",
    canonical: typeof window !== "undefined" ? window.location.origin + "/quiz" : "",
  });
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [dpdp, setDpdp] = useState(false);
  const [dpdpAnswers, setDpdpAnswers] = useState({});
  const [jurisdictions, setJurisdictions] = useState({ uk: false, colorado: false });
  const [submitting, setSubmitting] = useState(false);
  const firedStart = useRef(false);

  useEffect(() => {
    if (firedStart.current) return;
    firedStart.current = true;
    // Pass-through: store tier preference from pricing CTA for checkout later.
    const tier = params.get("tier");
    if (tier) {
      try { sessionStorage.setItem("preferred_tier", tier); } catch (e) { /* ignore */ }
      // Preselect UK+CO when visitor lands from the Bundle CTA — it's the
      // only tier that renders the cross-map, so default it ON.
      if (tier === "bundle") setJurisdictions({ uk: true, colorado: true });
    }
    track("quiz_started", { total_questions: QUESTIONS.length, preferred_tier: tier || null });
  }, [params]);

  const totalQuestions = QUESTIONS.length + (dpdp ? DPDP_QUESTIONS.length : 0);
  const allQuestions = useMemo(
    () => (dpdp ? [...QUESTIONS, ...DPDP_QUESTIONS.map((q) => ({ ...q, isDpdp: true, label: "DPDP (India)" }))] : QUESTIONS),
    [dpdp]
  );
  const current = allQuestions[index];
  const answered = current?.isDpdp ? dpdpAnswers[current.id] : answers[current?.id];

  const setAnswer = (value) => {
    if (current.isDpdp) {
      setDpdpAnswers((a) => ({ ...a, [current.id]: value }));
    } else {
      setAnswers((a) => ({ ...a, [current.id]: value }));
    }
  };

  const next = () => {
    if (!answered) return toast.error("Please choose an answer before continuing.");
    if (index < allQuestions.length - 1) setIndex(index + 1);
    else submit();
  };
  const prev = () => index > 0 && setIndex(index - 1);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([qid, v]) => ({ question_id: qid, value: v })),
        dpdp_enabled: dpdp,
        dpdp_answers: dpdp
          ? Object.entries(dpdpAnswers).map(([qid, v]) => ({ question_id: qid, value: v }))
          : null,
        jurisdictions: Object.entries(jurisdictions)
          .filter(([, v]) => v)
          .map(([k]) => k),
      };
      const { data } = await api.post("/quiz/submit", payload);
      track("quiz_completed", {
        risk_level: data.risk_level,
        score: data.score,
        dpdp_enabled: dpdp,
      });
      navigate(`/results/${data.session_id}`);
    } catch (e) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((index + 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="quiz-page">
      <Navbar />

      {/* Progress header */}
      <div className="border-b border-foreground/10 bg-foreground/[0.02]">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-5 flex items-center justify-between gap-6">
          <div className="label-eyebrow text-foreground/60">
            Question <span className="text-foreground mono">{String(index + 1).padStart(2, "0")}</span>
            &nbsp;/ {String(totalQuestions).padStart(2, "0")}
          </div>
          <div className="flex-1 h-[2px] bg-foreground/10 relative overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-[#0020C2] transition-all duration-300"
              style={{ width: `${progress}%` }}
              data-testid="quiz-progress-bar"
            />
          </div>
          <div className="flex items-center gap-4 label-eyebrow flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-foreground/60">DPDP (India)</span>
              <Switch
                checked={dpdp}
                onCheckedChange={(v) => {
                  setDpdp(v);
                  if (!v && index >= QUESTIONS.length) setIndex(QUESTIONS.length - 1);
                }}
                data-testid="dpdp-toggle"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground/60">UK</span>
              <Switch
                checked={jurisdictions.uk}
                onCheckedChange={(v) => setJurisdictions((j) => ({ ...j, uk: v }))}
                data-testid="uk-toggle"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-foreground/60">Colorado</span>
              <Switch
                checked={jurisdictions.colorado}
                onCheckedChange={(v) => setJurisdictions((j) => ({ ...j, colorado: v }))}
                data-testid="colorado-toggle"
              />
            </div>
            <span className="text-foreground/40 text-[10px] hidden md:inline">
              UK + CO render on Bundle reports
            </span>
          </div>
        </div>
      </div>

      {/* Question card */}
      <main className="flex-1 grid md:grid-cols-12 gap-0 items-stretch">
        <div className="md:col-span-8 border-r border-foreground/10 p-8 md:p-16 flex flex-col">
          <div className="label-eyebrow text-foreground/60 mb-6">{current.label}</div>
          <h1 className="font-display text-3xl md:text-5xl tracking-tighter leading-[1.05] max-w-3xl" data-testid="quiz-question-text">
            {current.text}
          </h1>
          {current.hint && (
            <p className="mt-6 text-foreground/60 leading-relaxed max-w-2xl">{current.hint}</p>
          )}

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-l border-foreground/20 max-w-2xl">
            {[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ].map((opt) => {
              const active = answered === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setAnswer(opt.value)}
                  className={`relative h-28 border-r border-b border-foreground/20 px-6 text-left transition-all duration-150 ${
                    active
                      ? "bg-foreground text-background"
                      : "hover:bg-foreground hover:text-background"
                  }`}
                  data-testid={`quiz-option-${opt.value}`}
                >
                  <div className="absolute top-3 right-4 label-eyebrow opacity-60">{opt.value === "yes" ? "Y" : "N"}</div>
                  <div className="font-display text-3xl tracking-tight">{opt.label}</div>
                  {active && <CheckCircle2 className="absolute bottom-3 right-3 h-5 w-5" />}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-12 flex items-center justify-between">
            <button
              onClick={prev}
              disabled={index === 0}
              className="inline-flex items-center gap-2 h-11 px-5 border border-foreground/20 hover:bg-foreground hover:text-background disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground label-eyebrow transition-all"
              data-testid="quiz-prev-btn"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              onClick={next}
              disabled={submitting}
              className="inline-flex items-center gap-2 h-11 px-6 bg-[#0020C2] text-white hover:bg-[#00189B] label-eyebrow transition-all disabled:opacity-50"
              data-testid="quiz-next-btn"
            >
              {index === allQuestions.length - 1
                ? submitting
                  ? "Calculating…"
                  : "Get my score"
                : "Next"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Context panel */}
        <aside className="md:col-span-4 p-8 md:p-10 bg-foreground/[0.02]">
          <div className="label-eyebrow text-foreground/60 mb-4">Context</div>
          <div className="space-y-4">
            <div className="border-b border-foreground/10 pb-4">
              <div className="mono text-xs text-foreground/50 mb-1">Reference</div>
              <div className="font-display text-lg">{current.label}</div>
            </div>
            <div className="border-b border-foreground/10 pb-4">
              <div className="mono text-xs text-foreground/50 mb-1">Why we ask</div>
              <p className="text-sm text-foreground/70 leading-relaxed">
                Each question maps to a specific article. Your answer changes the downstream obligations — we don&apos;t ask anything we won&apos;t use.
              </p>
            </div>
            <div className="border-b border-foreground/10 pb-4">
              <div className="mono text-xs text-foreground/50 mb-1">Questions left</div>
              <div className="font-display text-3xl tabular-nums">
                {totalQuestions - index - 1}
              </div>
            </div>
            <div>
              <div className="mono text-xs text-foreground/50 mb-2">Your answers so far</div>
              <div className="flex flex-wrap gap-1">
                {allQuestions.map((q, i) => {
                  const a = q.isDpdp ? dpdpAnswers[q.id] : answers[q.id];
                  return (
                    <div
                      key={q.id}
                      className={`h-7 w-7 grid place-items-center border label-eyebrow text-[10px] ${
                        i === index
                          ? "border-[#0020C2] text-[#0020C2]"
                          : a
                          ? "bg-foreground text-background border-foreground"
                          : "border-foreground/20 text-foreground/40"
                      }`}
                      title={q.id}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

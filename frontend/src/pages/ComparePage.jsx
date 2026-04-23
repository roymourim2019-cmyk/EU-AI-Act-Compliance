import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { RISK_META } from "@/lib/quiz-data";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function ComparePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ids = useMemo(() => (params.get("ids") || "").split(",").filter(Boolean).slice(0, 3), [params]);
  const [reports, setReports] = useState(null);

  useEffect(() => {
    if (ids.length < 2) {
      toast.error("Select at least two reports to compare.");
      navigate("/recover");
      return;
    }
    Promise.all(ids.map((id) => api.get(`/report/${id}`).then((r) => r.data)))
      .then(setReports)
      .catch(() => {
        toast.error("Couldn't load one or more reports. They must be paid reports.");
        navigate("/recover");
      });
  }, [ids, navigate]);

  if (!reports) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center">
        <span className="label-eyebrow text-foreground/60">Loading comparison…</span>
      </div>
    );
  }

  // union of all obligations to draw diff rows
  const allObligations = Array.from(
    new Set(reports.flatMap((r) => r.obligations || []))
  );

  const col = reports.length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="compare-page">
      <Navbar />
      <main className="flex-1">
        {/* header */}
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
            <Link to="/recover" className="inline-flex items-center gap-2 label-eyebrow text-foreground/60 hover:text-foreground sharp-link mb-6" data-testid="back-to-recover">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to reports
            </Link>
            <div className="label-eyebrow text-foreground/60 mb-4">§ Side-by-side comparison</div>
            <h1 className="font-display text-4xl md:text-6xl tracking-tighter leading-[0.95]">
              {reports.length} reports. One view.
            </h1>
            <p className="mt-5 text-foreground/70 leading-relaxed max-w-2xl">
              Obligations marked <span className="mono text-foreground">YES</span> apply to that system;
              <span className="mono text-foreground"> —</span> means the tier doesn&apos;t require it.
              Use this to decide which AI system to deprecate, consolidate, or prioritise first.
            </p>
          </div>
        </section>

        {/* column headers */}
        <section className="border-b border-foreground/10 sticky top-16 bg-background z-20">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div
              className="grid border-l border-foreground/15"
              style={{ gridTemplateColumns: `260px repeat(${col}, minmax(0, 1fr))` }}
            >
              <div className="p-4 border-r border-b border-foreground/15 label-eyebrow text-foreground/60 flex items-center">
                Dimension
              </div>
              {reports.map((r, i) => {
                const meta = RISK_META[r.risk_level] || RISK_META.minimal;
                return (
                  <div key={r.session_id} className="p-4 border-r border-b border-foreground/15" data-testid={`compare-col-${i}`}>
                    <div className="label-eyebrow text-foreground/50 mb-2 flex items-center justify-between">
                      <span>System /{i + 1}</span>
                      <Link to={`/report/${r.session_id}`} className="inline-flex items-center gap-1 text-foreground/60 hover:text-[#0020C2]">
                        open <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <div
                      className="inline-flex items-center gap-2 px-2 py-0.5 border label-eyebrow text-[10px]"
                      style={{ borderColor: meta.color, color: meta.color }}
                    >
                      <span className="h-1.5 w-1.5 block" style={{ background: meta.color }} />
                      {meta.label}
                    </div>
                    <div className="mt-2 mono text-[11px] text-foreground/50 truncate">{r.session_id.slice(0, 8)}…</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* score row */}
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div
              className="grid border-l border-foreground/15"
              style={{ gridTemplateColumns: `260px repeat(${col}, minmax(0, 1fr))` }}
            >
              <div className="p-5 border-r border-b border-foreground/15 label-eyebrow text-foreground/60">Risk score</div>
              {reports.map((r) => (
                <div key={r.session_id + "-score"} className="p-5 border-r border-b border-foreground/15">
                  <span className="font-display text-5xl mono tabular-nums">{r.score}</span>
                  <span className="text-foreground/50 text-sm"> / 100</span>
                </div>
              ))}

              <div className="p-5 border-r border-b border-foreground/15 label-eyebrow text-foreground/60">References</div>
              {reports.map((r) => (
                <div key={r.session_id + "-ref"} className="p-5 border-r border-b border-foreground/15 text-sm">
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {r.art_references?.map((a) => (
                      <span key={a} className="mono text-[11px] text-foreground/70">· {a}</span>
                    ))}
                  </div>
                </div>
              ))}

              <div className="p-5 border-r border-b border-foreground/15 label-eyebrow text-foreground/60">Max penalty</div>
              {reports.map((r) => (
                <div key={r.session_id + "-pen"} className="p-5 border-r border-b border-foreground/15 text-xs text-foreground/70 leading-relaxed">
                  {r.penalties}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* obligations matrix */}
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 pt-10 pb-2">
            <div className="label-eyebrow text-foreground/60 mb-4">§ Obligations matrix</div>
          </div>
          <div className="mx-auto max-w-[1400px] px-6 md:px-10">
            <div
              className="grid border-l border-t border-foreground/15"
              style={{ gridTemplateColumns: `260px repeat(${col}, minmax(0, 1fr))` }}
              data-testid="obligations-matrix"
            >
              {allObligations.map((ob) => {
                // count how many reports have this obligation
                const count = reports.filter((r) => r.obligations.includes(ob)).length;
                const unique = count === 1;
                return (
                  <React.Fragment key={ob}>
                    <div className="p-4 border-r border-b border-foreground/15 text-sm leading-snug flex items-start">
                      <span>{ob}</span>
                      {unique && (
                        <span className="ml-2 mono text-[9px] px-1.5 py-0.5 bg-[#EAB308] text-black shrink-0">UNIQUE</span>
                      )}
                    </div>
                    {reports.map((r) => {
                      const has = r.obligations.includes(ob);
                      return (
                        <div
                          key={r.session_id + ob}
                          className={`p-4 border-r border-b border-foreground/15 text-center mono text-sm ${
                            has ? "bg-foreground text-background" : "text-foreground/30"
                          }`}
                        >
                          {has ? "YES" : "—"}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>

        {/* shared deadlines */}
        <section className="border-b border-foreground/10 bg-foreground text-background">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
            <div className="label-eyebrow text-background/60 mb-4">§ Shared regulatory timeline</div>
            <ul className="border-t border-background/20">
              {(reports[0].deadlines || []).map((d, i) => (
                <li key={i} className="grid md:grid-cols-12 gap-4 py-4 border-b border-background/20 items-start">
                  <span className="mono text-sm md:col-span-2 text-[#EAB308]">{d.date}</span>
                  <span className="md:col-span-10 font-display text-lg md:text-xl tracking-tight">{d.item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 flex flex-wrap items-center justify-between gap-6">
            <p className="text-foreground/70 max-w-xl leading-relaxed">
              Want to add or swap a system? Head back to recovery, pick different reports, and compare again.
            </p>
            <Link
              to="/recover"
              className="inline-flex items-center gap-2 h-12 px-6 bg-foreground text-background hover:bg-[#0020C2] hover:text-white label-eyebrow transition-all"
              data-testid="back-to-recover-cta"
            >
              <ArrowLeft className="h-4 w-4" /> Change selection
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

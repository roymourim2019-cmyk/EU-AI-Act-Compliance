import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { RISK_META } from "@/lib/quiz-data";
import { track } from "@/lib/analytics";
import { ArrowLeft, ExternalLink, Download } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import InviteCounselButton from "@/components/InviteCounselButton";

function hexToRgb(hex) {
  const m = hex.replace("#", "").match(/.{1,2}/g);
  if (!m || m.length < 3) return [0, 0, 0];
  return m.slice(0, 3).map((x) => parseInt(x, 16));
}

export default function ComparePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const ids = useMemo(() => {
    const raw = (params.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
    return Array.from(new Set(raw)).slice(0, 3);
  }, [params]);
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

  const downloadPDF = () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 40;
    let y = margin;

    const newPageIfNeeded = (h) => {
      if (y + h > pageH - margin) {
        pdf.addPage();
        y = margin;
      }
    };

    // Cover bar
    pdf.setFillColor(9, 9, 11);
    pdf.rect(0, 0, pageW, 70, "F");
    pdf.setTextColor(250, 250, 250);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("EU AI ACT 2026 — PORTFOLIO COMPARISON", margin, 32);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 50);
    pdf.text(`Systems compared: ${reports.length}`, pageW - margin - 120, 50);
    y = 100;

    // Section title
    pdf.setTextColor(9, 9, 11);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Portfolio risk comparison", margin, y);
    y += 24;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(82, 82, 91);
    const intro = pdf.splitTextToSize(
      "Side-by-side diagnostic for the AI systems listed below. Use this document to prioritise FRIA scheduling, deprecations, and cross-team handoffs. Obligations marked UNIQUE apply to only one system in the portfolio and are frequently the root of compliance gaps.",
      pageW - margin * 2
    );
    pdf.text(intro, margin, y);
    y += intro.length * 12 + 12;

    // Column layout
    const labelW = 180;
    const colW = (pageW - margin * 2 - labelW) / col;
    const cellPad = 6;
    const rowH = 40;

    // Header row: System N + badge + session id short
    const drawHeader = () => {
      pdf.setDrawColor(228, 228, 231);
      pdf.setLineWidth(0.5);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(82, 82, 91);
      pdf.text("DIMENSION", margin + cellPad, y + 14);
      pdf.line(margin, y + rowH, pageW - margin, y + rowH);
      reports.forEach((r, i) => {
        const meta = RISK_META[r.risk_level] || RISK_META.minimal;
        const x = margin + labelW + colW * i;
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(9, 9, 11);
        pdf.setFontSize(10);
        pdf.text(`SYSTEM /${i + 1}`, x + cellPad, y + 12);
        // risk badge color bar
        const rgb = hexToRgb(meta.color);
        pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
        pdf.rect(x + cellPad, y + 16, 3, 12, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(rgb[0], rgb[1], rgb[2]);
        pdf.text(meta.label.toUpperCase(), x + cellPad + 8, y + 25);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(`${r.session_id.slice(0, 8)}…`, x + cellPad, y + 36);
      });
      y += rowH;
    };
    drawHeader();

    const writeRow = (label, valueFn, h = rowH) => {
      newPageIfNeeded(h);
      pdf.setDrawColor(228, 228, 231);
      pdf.line(margin, y + h, pageW - margin, y + h);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(82, 82, 91);
      const labelLines = pdf.splitTextToSize(label, labelW - cellPad * 2);
      pdf.text(labelLines, margin + cellPad, y + 14);
      reports.forEach((r, i) => {
        const x = margin + labelW + colW * i;
        valueFn(r, i, x, h);
      });
      y += h;
    };

    // Score row
    writeRow("RISK SCORE", (r, i, x) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(9, 9, 11);
      pdf.text(`${r.score}`, x + cellPad, y + 22);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(120, 120, 120);
      pdf.text("/ 100", x + cellPad + 40, y + 22);
    });

    // References
    writeRow("REFERENCES", (r, i, x) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(9, 9, 11);
      const refs = (r.art_references || []).join(" · ");
      const lines = pdf.splitTextToSize(refs, colW - cellPad * 2);
      pdf.text(lines, x + cellPad, y + 12);
    }, 44);

    // Max penalty (shared — print once and span across columns)
    newPageIfNeeded(48);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(82, 82, 91);
    pdf.text("MAX PENALTY", margin + cellPad, y + 14);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(9, 9, 11);
    const penLines = pdf.splitTextToSize(reports[0].penalties || "", pageW - margin - labelW - cellPad * 2);
    pdf.text(penLines, margin + labelW + cellPad, y + 12);
    y += Math.max(36, penLines.length * 10 + 12);
    pdf.setDrawColor(228, 228, 231);
    pdf.line(margin, y, pageW - margin, y);
    y += 20;

    // Obligations matrix title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(9, 9, 11);
    pdf.text("Obligations matrix", margin, y);
    y += 18;

    // Matrix header repeat on every new page
    const matrixHeaderH = 24;
    const drawMatrixHeader = () => {
      pdf.setFillColor(244, 244, 245);
      pdf.rect(margin, y, pageW - margin * 2, matrixHeaderH, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(82, 82, 91);
      pdf.text("OBLIGATION", margin + cellPad, y + 15);
      reports.forEach((r, i) => {
        const x = margin + labelW + colW * i;
        pdf.text(`SYSTEM /${i + 1}`, x + cellPad, y + 15);
      });
      y += matrixHeaderH;
    };
    drawMatrixHeader();

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    allObligations.forEach((ob) => {
      const labelLines = pdf.splitTextToSize(ob, labelW - cellPad * 2);
      const rowHeight = Math.max(26, labelLines.length * 10 + 10);
      if (y + rowHeight > pageH - margin) {
        pdf.addPage();
        y = margin;
        drawMatrixHeader();
      }
      const count = reports.filter((r) => (r.obligations || []).includes(ob)).length;
      const unique = count === 1;

      pdf.setTextColor(9, 9, 11);
      pdf.text(labelLines, margin + cellPad, y + 14);
      if (unique) {
        // yellow UNIQUE pill
        pdf.setFillColor(234, 179, 8);
        const pillW = 38;
        pdf.rect(labelW + margin - pillW - cellPad, y + 6, pillW, 12, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(9, 9, 11);
        pdf.text("UNIQUE", labelW + margin - pillW - cellPad + 6, y + 14);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
      }

      reports.forEach((r, i) => {
        const has = (r.obligations || []).includes(ob);
        const x = margin + labelW + colW * i;
        if (has) {
          pdf.setFillColor(9, 9, 11);
          pdf.rect(x, y, colW, rowHeight, "F");
          pdf.setTextColor(250, 250, 250);
          pdf.setFont("helvetica", "bold");
          pdf.text("YES", x + cellPad, y + 14);
          pdf.setFont("helvetica", "normal");
        } else {
          pdf.setTextColor(160, 160, 160);
          pdf.text("—", x + cellPad, y + 14);
        }
        pdf.setTextColor(9, 9, 11);
      });

      pdf.setDrawColor(228, 228, 231);
      pdf.line(margin, y + rowHeight, pageW - margin, y + rowHeight);
      y += rowHeight;
    });

    // Timeline
    newPageIfNeeded(100);
    y += 24;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(9, 9, 11);
    pdf.text("Regulatory timeline", margin, y);
    y += 18;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    (reports[0].deadlines || []).forEach((d) => {
      newPageIfNeeded(20);
      pdf.setTextColor(202, 138, 4);
      pdf.text(d.date, margin, y);
      pdf.setTextColor(9, 9, 11);
      const lines = pdf.splitTextToSize(d.item, pageW - margin * 2 - 90);
      pdf.text(lines, margin + 90, y);
      y += Math.max(14, lines.length * 12);
    });

    // Disclaimer
    y += 20;
    newPageIfNeeded(40);
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    const disc = pdf.splitTextToSize(
      "This comparison is a non-binding diagnostic derived from publicly available text of Regulation (EU) 2024/1689. It is not legal advice. Consult qualified counsel before any regulatory filing or material business decision.",
      pageW - margin * 2
    );
    pdf.text(disc, margin, y);

    pdf.save(`EU-AI-Act-Comparison-${reports.map((r) => r.session_id.slice(0, 4)).join("-")}.pdf`);
    track("comparison_pdf_downloaded", { count: reports.length });
    toast.success("Comparison PDF downloaded.");
  };

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
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={downloadPDF}
                className="inline-flex items-center gap-2 h-12 px-6 bg-foreground text-background hover:bg-[#0020C2] hover:text-white label-eyebrow transition-all"
                data-testid="download-comparison-pdf-btn"
              >
                <Download className="h-4 w-4" /> Export comparison as PDF
              </button>
              {(() => {
                const summary = reports
                  .map((r, i) => {
                    const meta = RISK_META[r.risk_level] || RISK_META.minimal;
                    const url = `${window.location.origin}/report/${r.session_id}`;
                    return `  ${i + 1}. ${meta.label} — ${r.score}/100 — ${url}`;
                  })
                  .join("\r\n");
                const subject = `EU AI Act portfolio review — ${reports.length} systems`;
                const body = [
                  "Hi —",
                  "",
                  `I pulled a side-by-side comparison of ${reports.length} of our AI systems under the EU AI Act 2026 and I'd like your review before we act on any of the obligations:`,
                  "",
                  summary,
                  "",
                  `Relevant deadlines start 2 Aug 2026 for high-risk systems; max penalty is €35M or 7% of global turnover.`,
                  "",
                  `Portfolio comparison (lifetime access, no login):`,
                  window.location.href,
                  "",
                  `Could you confirm the obligations that apply per system, and flag anything we should reprioritise?`,
                  "",
                  "Thanks.",
                ].join("\r\n");
                return (
                  <InviteCounselButton
                    subject={subject}
                    body={body}
                    context={{ surface: "compare", count: reports.length }}
                    testId="invite-counsel-compare-btn"
                  />
                );
              })()}
              <span className="label-eyebrow text-foreground/50">
                Landscape A4 · ready for GC handoff
              </span>
            </div>
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
                const count = reports.filter((r) => (r.obligations || []).includes(ob)).length;
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
                      const has = (r.obligations || []).includes(ob);
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

import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { RISK_META } from "@/lib/quiz-data";
import { Download, Copy, FileText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function ReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [badgeTab, setBadgeTab] = useState("preview");
  const badgeRef = useRef(null);

  useEffect(() => {
    api
      .get(`/report/${sessionId}`)
      .then(({ data }) => setReport(data))
      .catch(() => {
        toast.error("Report unavailable. Redirecting to results.");
        navigate(`/results/${sessionId}`);
      });
  }, [sessionId, navigate]);

  if (!report) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <span className="label-eyebrow text-foreground/60">Loading full report…</span>
      </div>
    );
  }

  const meta = RISK_META[report.risk_level] || RISK_META.minimal;
  const embedCode = `<a href="https://aiact-scorecard.eu" target="_blank" rel="noopener">\n  ${report.compliance_badge_svg}\n</a>`;

  const copyBadge = async () => {
    await navigator.clipboard.writeText(embedCode);
    toast.success("Embed code copied.");
  };

  const downloadPDF = () => {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    let y = margin;
    const pageW = pdf.internal.pageSize.getWidth();

    const addLine = (text, size = 11, bold = false, color = [10, 10, 10]) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(...color);
      const lines = pdf.splitTextToSize(text, pageW - margin * 2);
      lines.forEach((ln) => {
        if (y > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(ln, margin, y);
        y += size + 4;
      });
    };

    // Header
    pdf.setFillColor(9, 9, 11);
    pdf.rect(0, 0, pageW, 90, "F");
    pdf.setTextColor(250, 250, 250);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("EU AI ACT 2026 — SCORECARD REPORT", margin, 40);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Session: ${report.session_id}`, margin, 58);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 72);
    y = 130;

    addLine("RISK CLASSIFICATION", 10, true, [82, 82, 91]);
    addLine(`${meta.label}  ·  Score ${report.score}/100`, 22, true);
    y += 8;
    addLine(meta.copy, 11, false, [82, 82, 91]);
    addLine(`References: ${report.art_references.join(" · ")}`, 10, false, [82, 82, 91]);
    y += 12;

    addLine("OBLIGATIONS CHECKLIST", 10, true, [82, 82, 91]);
    report.obligations.forEach((o, i) => addLine(`${String(i + 1).padStart(2, "0")}.  ${o}`, 11));
    y += 12;

    addLine("DEADLINES", 10, true, [82, 82, 91]);
    report.deadlines.forEach((d) => addLine(`${d.date}  —  ${d.item}`, 11));
    y += 12;

    addLine("PENALTY EXPOSURE", 10, true, [82, 82, 91]);
    addLine(report.penalties, 11);
    y += 12;

    if (report.fria_template) {
      addLine("FRIA STARTER TEMPLATE (Art 27)", 10, true, [82, 82, 91]);
      addLine("System description:", 11, true);
      addLine(report.fria_template.system_description, 11);
      addLine("Fundamental rights impacted:", 11, true);
      report.fria_template.fundamental_rights_impacts.forEach((r) => addLine(`• ${r}`, 11));
      addLine("Affected stakeholders:", 11, true);
      addLine(report.fria_template.affected_stakeholders, 11);
      addLine("Mitigations:", 11, true);
      addLine(report.fria_template.mitigations, 11);
      addLine("Residual risk:", 11, true);
      addLine(report.fria_template.residual_risk, 11);
      addLine("Review cadence:", 11, true);
      addLine(report.fria_template.review_cadence, 11);
      y += 12;
    }

    if (report.dpdp_findings?.length) {
      addLine("INDIA DPDP FINDINGS", 10, true, [82, 82, 91]);
      report.dpdp_findings.forEach((f) => addLine(`• ${f}`, 11));
    }

    addLine(
      "\nThis report is a non-binding diagnostic. It is not legal advice. Consult qualified counsel before any regulatory filing.",
      9,
      false,
      [120, 120, 120]
    );

    pdf.save(`EU-AI-Act-Report-${report.session_id.slice(0, 8)}.pdf`);
    track("pdf_downloaded", { risk_level: report.risk_level, score: report.score });
  };

  const downloadFRIA = () => {
    if (!report.fria_template) return toast.info("FRIA template applies to High-Risk systems only.");
    const rows = [
      ["Section", "Content"],
      ["System description", report.fria_template.system_description],
      ...report.fria_template.fundamental_rights_impacts.map((r, i) => [`Right ${i + 1}`, r]),
      ["Affected stakeholders", report.fria_template.affected_stakeholders],
      ["Mitigations", report.fria_template.mitigations],
      ["Residual risk", report.fria_template.residual_risk],
      ["Review cadence", report.fria_template.review_cadence],
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FRIA-template-${report.session_id.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="report-page">
      <Navbar />

      {/* Paid banner */}
      <div className="bg-[#16A34A] text-white">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-2.5 flex items-center gap-3 label-eyebrow">
          <ShieldCheck className="h-4 w-4" />
          Payment confirmed — full access unlocked · {report.payment_id}
        </div>
      </div>

      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8">
              <div className="label-eyebrow text-foreground/60 mb-4">§ Full report</div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 border label-eyebrow mb-6"
                style={{ borderColor: meta.color, color: meta.color }}
              >
                <span className="h-2 w-2 block" style={{ background: meta.color }} />
                {meta.label}
              </div>
              <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95]">
                <span className="mono tabular-nums">{report.score}</span>
                <span className="text-foreground/40"> / 100</span>
              </h1>
              <p className="mt-4 max-w-2xl text-foreground/70 leading-relaxed">{meta.copy}</p>
            </div>
            <div className="md:col-span-4 border border-foreground/20 p-5 space-y-3">
              <button
                onClick={downloadPDF}
                className="inline-flex items-center gap-2 w-full justify-center h-12 bg-foreground text-background hover:bg-[#0020C2] hover:text-white label-eyebrow transition-all"
                data-testid="download-pdf-btn"
              >
                <Download className="h-4 w-4" /> Download branded PDF
              </button>
              {report.fria_template && (
                <button
                  onClick={downloadFRIA}
                  className="inline-flex items-center gap-2 w-full justify-center h-11 border border-foreground/20 hover:bg-foreground hover:text-background label-eyebrow transition-all"
                  data-testid="download-fria-btn"
                >
                  <FileText className="h-4 w-4" /> FRIA starter (CSV)
                </button>
              )}
              <div className="label-eyebrow text-foreground/50 text-center pt-2">Lifetime access · no subscription</div>
            </div>
          </div>
        </section>

        {/* Obligations */}
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
            <div className="label-eyebrow text-foreground/60 mb-4">§ 01 · Obligations checklist</div>
            <ul className="border-t border-l border-foreground/15 grid grid-cols-1 md:grid-cols-2" data-testid="obligations-list">
              {report.obligations.map((o, i) => (
                <li key={i} className="p-5 border-r border-b border-foreground/15 flex items-start gap-4">
                  <span className="mono text-xs text-foreground/50 w-10 shrink-0">/{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm leading-relaxed">{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Deadlines */}
        <section className="border-b border-foreground/10 bg-foreground text-background">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
            <div className="label-eyebrow text-background/60 mb-4">§ 02 · Regulatory timeline</div>
            <ul className="border-t border-background/20">
              {report.deadlines.map((d, i) => (
                <li
                  key={i}
                  className="grid md:grid-cols-12 gap-4 py-5 border-b border-background/20 items-start"
                >
                  <span className="mono text-sm md:col-span-2 text-[#EAB308]">{d.date}</span>
                  <span className="md:col-span-9 font-display text-lg md:text-2xl tracking-tight">{d.item}</span>
                  <span className="label-eyebrow text-background/50 md:col-span-1 md:text-right">/0{i + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Penalty */}
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12 grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5">
              <div className="label-eyebrow text-foreground/60 mb-3">§ 03 · Penalty exposure</div>
              <h3 className="font-display text-3xl tracking-tighter leading-[1.05]">What non-compliance costs.</h3>
            </div>
            <p className="md:col-span-7 text-foreground/80 leading-relaxed text-lg">{report.penalties}</p>
          </div>
        </section>

        {/* FRIA */}
        {report.fria_template && (
          <section className="border-b border-foreground/10">
            <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
              <div className="label-eyebrow text-foreground/60 mb-4">§ 04 · FRIA starter template (Art 27)</div>
              <div className="border border-foreground/15">
                {[
                  ["System description", report.fria_template.system_description],
                  ["Fundamental rights impacts", report.fria_template.fundamental_rights_impacts.join(" · ")],
                  ["Affected stakeholders", report.fria_template.affected_stakeholders],
                  ["Mitigations", report.fria_template.mitigations],
                  ["Residual risk", report.fria_template.residual_risk],
                  ["Review cadence", report.fria_template.review_cadence],
                ].map(([k, v]) => (
                  <div key={k} className="grid md:grid-cols-12 border-b border-foreground/15 last:border-b-0">
                    <div className="md:col-span-3 p-5 bg-foreground/[0.03] label-eyebrow text-foreground/70">{k}</div>
                    <div className="md:col-span-9 p-5 text-sm leading-relaxed">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* DPDP */}
        {report.dpdp_findings?.length > 0 && (
          <section className="border-b border-foreground/10">
            <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
              <div className="label-eyebrow text-foreground/60 mb-4">§ 05 · India DPDP findings</div>
              <ul className="space-y-2">
                {report.dpdp_findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 border-b border-foreground/10 pb-2">
                    <span className="mono text-xs text-foreground/50 w-8">/{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Badge */}
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-12">
            <div className="label-eyebrow text-foreground/60 mb-4">§ 06 · Compliance badge</div>
            <div className="grid md:grid-cols-12 gap-8">
              <div className="md:col-span-5 border border-foreground/20 p-8 grid place-items-center bg-foreground/[0.03]">
                <div
                  ref={badgeRef}
                  dangerouslySetInnerHTML={{ __html: report.compliance_badge_svg }}
                  data-testid="compliance-badge-svg"
                />
              </div>
              <div className="md:col-span-7">
                <div className="flex gap-0 border border-foreground/20 mb-3">
                  {["preview", "embed"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setBadgeTab(t)}
                      className={`px-4 h-9 label-eyebrow border-r border-foreground/20 last:border-r-0 ${
                        badgeTab === t ? "bg-foreground text-background" : "hover:bg-foreground hover:text-background"
                      }`}
                      data-testid={`badge-tab-${t}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {badgeTab === "embed" ? (
                  <>
                    <pre className="border border-foreground/15 p-4 text-[11px] mono leading-relaxed whitespace-pre-wrap break-all bg-foreground/[0.02] max-h-64 overflow-auto" data-testid="badge-embed-code">
                      {embedCode}
                    </pre>
                    <button
                      onClick={copyBadge}
                      className="mt-3 inline-flex items-center gap-2 h-10 px-4 border border-foreground/20 hover:bg-foreground hover:text-background label-eyebrow"
                      data-testid="copy-badge-btn"
                    >
                      <Copy className="h-4 w-4" /> Copy embed code
                    </button>
                  </>
                ) : (
                  <p className="text-foreground/70 leading-relaxed">
                    Drop this badge on your product or investor page. It signals that your AI system has been
                    diagnostically assessed under the EU AI Act 2026. Replace the link to point at your own
                    documentation if desired.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

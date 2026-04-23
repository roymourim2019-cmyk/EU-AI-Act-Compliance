import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Megaphone, Mail, CheckCircle2 } from "lucide-react";
import useSeo from "@/lib/useSeo";
import { api } from "@/lib/api";
import { toast } from "sonner";

const BENEFITS = [
  {
    title: "Revenue share · 25% lifetime",
    body: "Every paid report from your audience earns 25% for 24 months. Settled monthly via wire or Stripe Connect.",
  },
  {
    title: "Co-branded landing page",
    body: "We ship a dedicated /p/{yourslug} page carrying your masthead, newsletter byline, and a custom tier discount for your list.",
  },
  {
    title: "Data you actually want",
    body: "Weekly funnel report: clicks, quiz completions, paid conversions, and risk-mix breakdown. No vanity metrics.",
  },
  {
    title: "First look at regulatory content",
    body: "Your newsletter gets our regulatory updates a week before the public /updates feed.",
  },
];

export default function PartnersPage() {
  const [form, setForm] = useState({ name: "", newsletter: "", email: "", audience: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useSeo({
    title: "Partners · Legal & compliance newsletters · Roy's Enterprise",
    description:
      "Partner with the EU AI Act Compliance scorecard. 25% lifetime rev-share for legal, compliance, and AI-governance newsletters.",
    canonical: typeof window !== "undefined" ? window.location.origin + "/partners" : "",
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/partners/apply", form);
      toast.success("Application received. We'll reply within 2 business days.");
      setSubmitted(true);
    } catch (err) {
      if (err?.response?.status === 429) {
        toast.error("Too many attempts. Try again in a minute.");
      } else if (err?.response?.status === 422) {
        toast.error("Please check your email and required fields.");
      } else {
        toast.error("Couldn't send right now. Email partners@aiact-scorecard.eu directly.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="partners-page">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-16 md:py-20">
            <Link to="/" className="label-eyebrow text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-8 sharp-link">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <div className="label-eyebrow text-foreground/60 mb-4 flex items-center gap-2">
              <Megaphone className="h-3.5 w-3.5 text-[#EA580C]" /> § Partner program · early
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95]">
              Distribute to<br /> your list.<br />
              <span className="text-[#0020C2]">Keep 25%.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-foreground/70 leading-relaxed">
              We're partnering with ten legal, compliance, and AI-governance newsletters for Q2 2026. If your audience
              buys compliance tooling, this works — we ship revenue share, co-branded pages, and weekly funnel data.
            </p>
          </div>
        </section>

        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-12 md:py-16">
            <div className="grid md:grid-cols-2 border-t border-l border-foreground/15">
              {BENEFITS.map((b) => (
                <div key={b.title} className="p-6 md:p-8 border-r border-b border-foreground/15" data-testid={`partner-benefit-${b.title}`}>
                  <div className="font-display text-xl md:text-2xl tracking-tight mb-3 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 mt-1 text-[#16A34A] shrink-0" />
                    {b.title}
                  </div>
                  <p className="text-foreground/80 leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[900px] px-6 md:px-10 py-12 md:py-16">
            <div className="label-eyebrow text-foreground/60 mb-3">§ Apply</div>
            <h2 className="font-display text-3xl md:text-4xl tracking-tighter leading-[1.05] mb-8">
              Tell us about your list.
            </h2>
            {submitted ? (
              <div className="border border-[#16A34A] p-6 flex items-start gap-3" data-testid="partner-submitted">
                <CheckCircle2 className="h-5 w-5 mt-0.5 text-[#16A34A] shrink-0" />
                <div>
                  <div className="font-display text-xl tracking-tight">Application received.</div>
                  <p className="text-foreground/70 mt-1 text-sm">
                    We've logged your submission and will reply within 2 business days. Questions in the meantime?
                    Email <a href="mailto:partners@aiact-scorecard.eu" className="sharp-link">partners@aiact-scorecard.eu</a>.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="border border-foreground/15" data-testid="partner-form">
                {[
                  { k: "name", label: "Your name", ph: "Jane Counsel", type: "text" },
                  { k: "newsletter", label: "Newsletter / outlet", ph: "AI Governance Weekly", type: "text" },
                  { k: "email", label: "Contact email", ph: "jane@example.com", type: "email" },
                  { k: "audience", label: "Audience size (approx)", ph: "12,000 subscribers", type: "text" },
                ].map((f) => (
                  <label key={f.k} className="block border-b border-foreground/15">
                    <div className="px-5 pt-4 label-eyebrow text-foreground/60">{f.label}</div>
                    <input
                      required
                      type={f.type}
                      value={form[f.k]}
                      onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                      placeholder={f.ph}
                      className="w-full h-12 px-5 bg-transparent outline-none border-0"
                      data-testid={`partner-input-${f.k}`}
                    />
                  </label>
                ))}
                <label className="block">
                  <div className="px-5 pt-4 label-eyebrow text-foreground/60">Anything we should know?</div>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Audience focus, prior sponsorships, what you want from us…"
                    className="w-full px-5 py-3 bg-transparent outline-none border-0 resize-none"
                    data-testid="partner-input-notes"
                  />
                </label>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 bg-foreground text-background label-eyebrow hover:bg-[#0020C2] hover:text-white transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
                  data-testid="partner-submit-btn"
                >
                  <Mail className="h-4 w-4" /> {submitting ? "Sending…" : "Send application"}
                </button>
              </form>
            )}
            <p className="mt-4 label-eyebrow text-foreground/50">
              Applications are reviewed weekly. First ten partners locked in Q2 2026.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

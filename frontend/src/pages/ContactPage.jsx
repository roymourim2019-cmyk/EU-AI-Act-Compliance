import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Mail, MapPin, MessageSquare, CheckCircle2 } from "lucide-react";
import useSeo from "@/lib/useSeo";
import { api } from "@/lib/api";
import { toast } from "sonner";

const CONTACTS = [
  { label: "General", email: "hello@aiact-scorecard.eu", icon: Mail },
  { label: "Privacy / DPA", email: "privacy@aiact-scorecard.eu", icon: Mail },
  { label: "Refunds", email: "refunds@aiact-scorecard.eu", icon: Mail },
  { label: "Partnerships", email: "partners@aiact-scorecard.eu", icon: Mail },
  { label: "Legal notices", email: "legal@aiact-scorecard.eu", icon: Mail },
  { label: "Security", email: "security@aiact-scorecard.eu", icon: Mail },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", topic: "General", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useSeo({
    title: "Contact · EU AI Act Compliance · Roy's Enterprise",
    description:
      "Contact Roy's Enterprise about the EU AI Act Compliance scorecard. Privacy, refunds, partnerships, and legal notices.",
    canonical: typeof window !== "undefined" ? window.location.origin + "/contact" : "",
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/contact", form);
      toast.success("Message received. We'll reply within 2 business days.");
      setSubmitted(true);
    } catch (err) {
      if (err?.response?.status === 429) {
        toast.error("Too many messages. Try again in a minute.");
      } else if (err?.response?.status === 422) {
        toast.error("Please check your email and required fields.");
      } else {
        toast.error("Couldn't send. Email hello@aiact-scorecard.eu directly.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="contact-page">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-16 md:py-20">
            <Link to="/" className="label-eyebrow text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-8 sharp-link">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <div className="label-eyebrow text-foreground/60 mb-4 flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-[#0020C2]" /> § Contact
            </div>
            <h1 className="font-display text-5xl md:text-7xl tracking-tighter leading-[0.95]">
              Reach a human.
            </h1>
            <p className="mt-6 max-w-2xl text-foreground/70 leading-relaxed">
              No gated "talk to sales" routing. Every mailbox below goes to a person who replies within 2 business days.
            </p>
          </div>
        </section>

        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-12 md:py-16 grid md:grid-cols-2 gap-10">
            <div>
              <div className="label-eyebrow text-foreground/60 mb-4">§ 01 · Direct email</div>
              <ul className="border-t border-foreground/15" data-testid="contact-emails">
                {CONTACTS.map((c) => {
                  const Icon = c.icon;
                  return (
                    <li key={c.email} className="flex items-center justify-between border-b border-foreground/15 py-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-foreground/60" />
                        <span className="label-eyebrow text-foreground/70">{c.label}</span>
                      </div>
                      <a href={`mailto:${c.email}`} className="font-display text-sm md:text-base sharp-link hover:text-[#0020C2]">
                        {c.email}
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-8 border border-foreground/15 p-5">
                <div className="label-eyebrow text-foreground/60 mb-2 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" /> Registered address
                </div>
                <div className="font-display text-lg tracking-tight">Roy&rsquo;s Enterprise</div>
                <div className="text-sm text-foreground/70 mt-1">
                  Bengaluru, Karnataka<br /> India
                </div>
                <div className="mt-3 label-eyebrow text-foreground/50">
                  We do not take walk-ins. Email first.
                </div>
              </div>
            </div>

            <div>
              <div className="label-eyebrow text-foreground/60 mb-4">§ 02 · Send a message</div>
              {submitted ? (
                <div className="border border-[#16A34A] p-6 flex items-start gap-3" data-testid="contact-submitted">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 text-[#16A34A] shrink-0" />
                  <div>
                    <div className="font-display text-xl tracking-tight">Message received.</div>
                    <p className="text-foreground/70 mt-1 text-sm">
                      We'll reply within 2 business days. For urgent matters, email the topic-specific inbox directly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="border border-foreground/15" data-testid="contact-form">
                  {[
                    { k: "name", label: "Your name", type: "text", ph: "Jane Compliance" },
                    { k: "email", label: "Your email", type: "email", ph: "jane@example.com" },
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
                        data-testid={`contact-input-${f.k}`}
                      />
                    </label>
                  ))}
                  <label className="block border-b border-foreground/15">
                    <div className="px-5 pt-4 label-eyebrow text-foreground/60">Topic</div>
                    <select
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      className="w-full h-12 px-5 bg-transparent outline-none border-0"
                      data-testid="contact-input-topic"
                    >
                      {CONTACTS.map((c) => <option key={c.label}>{c.label}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <div className="px-5 pt-4 label-eyebrow text-foreground/60">Message</div>
                    <textarea
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="What's going on?"
                      className="w-full px-5 py-3 bg-transparent outline-none border-0 resize-none"
                      data-testid="contact-input-message"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 bg-foreground text-background label-eyebrow hover:bg-[#0020C2] hover:text-white transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    data-testid="contact-submit-btn"
                  >
                    <Mail className="h-4 w-4" /> {submitting ? "Sending…" : "Send message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

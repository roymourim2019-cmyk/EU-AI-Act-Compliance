import React, { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Countdown from "@/components/Countdown";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/subscribe", { email });
      toast.success("Subscribed. We'll send updates as the Aug 2026 deadline approaches.");
      setEmail("");
    } catch (err) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-foreground text-background" data-testid="footer">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-16 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-6">
          <div className="label-eyebrow text-background/60 mb-4">§ 07 · Countdown</div>
          <h3 className="font-display text-3xl md:text-5xl tracking-tighter leading-[1]">
            High-risk systems<br /> go live 2 Aug 2026.
          </h3>
          <div className="mt-8">
            <Countdown />
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <div className="label-eyebrow text-background/60 mb-4">Newsletter</div>
          <p className="text-background/70 leading-relaxed mb-5">
            Monthly dispatch. New EU AI Office guidance, standards updates, enforcement actions. No filler.
          </p>
          <form onSubmit={onSubscribe} className="flex flex-col sm:flex-row gap-0 border border-background/30" data-testid="subscribe-form">
            <input
              type="email"
              required
              placeholder="your@work-email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent px-4 h-12 text-background placeholder:text-background/40 outline-none border-b sm:border-b-0 sm:border-r border-background/30"
              data-testid="subscribe-input"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 bg-background text-foreground label-eyebrow hover:bg-[#0020C2] hover:text-white transition-all duration-200 disabled:opacity-50"
              data-testid="subscribe-btn"
            >
              {loading ? "Sending…" : "Subscribe"}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-background/20">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 label-eyebrow text-background/60">
          <div>© 2026 AI Act Scorecard · Non-binding diagnostic</div>
          <div className="flex gap-6">
            <span>Reg (EU) 2024/1689</span>
            <span>DPDP Act 2023</span>
            <span>Made for compliance teams</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

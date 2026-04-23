import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { toast } from "sonner";
import Countdown from "@/components/Countdown";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [retrieveId, setRetrieveId] = useState("");

  const onSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post("/subscribe", { email });
      track("newsletter_subscribed", {});
      toast.success("Subscribed. We'll send updates as the Aug 2026 deadline approaches.");
      setEmail("");
    } catch (err) {
      if (err?.response?.status === 429) {
        toast.error("Too many attempts. Try again in a minute.");
      } else {
        toast.error("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const onRetrieve = (e) => {
    e.preventDefault();
    const id = retrieveId.trim();
    if (!id) return;
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(id)) {
      toast.error("That doesn't look like a valid session ID.");
      return;
    }
    navigate(`/results/${id}`);
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

          <div className="mt-10 label-eyebrow text-background/60 mb-3">Retrieve report</div>
          <p className="text-background/70 leading-relaxed mb-4 text-sm">
            Paste your session ID to jump back to your results or paid report. Your link is permanent.
          </p>
          <form onSubmit={onRetrieve} className="flex flex-col sm:flex-row gap-0 border border-background/30" data-testid="retrieve-form">
            <input
              type="text"
              required
              placeholder="paste session id"
              value={retrieveId}
              onChange={(e) => setRetrieveId(e.target.value)}
              className="flex-1 bg-transparent px-4 h-12 text-background placeholder:text-background/40 outline-none border-b sm:border-b-0 sm:border-r border-background/30 mono text-xs"
              data-testid="retrieve-input"
            />
            <button
              type="submit"
              className="h-12 px-5 bg-background text-foreground label-eyebrow hover:bg-[#0020C2] hover:text-white transition-all duration-200 inline-flex items-center gap-2"
              data-testid="retrieve-btn"
            >
              Retrieve <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
          <Link
            to="/recover"
            className="mt-3 inline-flex items-center gap-1 label-eyebrow text-background/60 hover:text-background sharp-link"
            data-testid="recover-link"
          >
            Lost your link? Recover by email <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="border-t border-background/20">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 label-eyebrow text-background/60">
          <div data-testid="footer-copyright">
            © 2026 Roy&rsquo;s Enterprise · EU AI Act Compliance · All rights reserved
          </div>
          <div className="flex flex-wrap gap-4 md:gap-5">
            <Link to="/updates" className="hover:text-background sharp-link" data-testid="footer-updates">Updates</Link>
            <Link to="/changelog" className="hover:text-background sharp-link" data-testid="footer-changelog">Changelog</Link>
            <Link to="/trust" className="hover:text-background sharp-link" data-testid="footer-trust">Trust</Link>
            <Link to="/partners" className="hover:text-background sharp-link" data-testid="footer-partners">Partners</Link>
            <Link to="/privacy" className="hover:text-background sharp-link" data-testid="footer-privacy">Privacy</Link>
            <Link to="/terms" className="hover:text-background sharp-link" data-testid="footer-terms">Terms</Link>
            <Link to="/refund" className="hover:text-background sharp-link" data-testid="footer-refund">Refunds</Link>
            <Link to="/contact" className="hover:text-background sharp-link" data-testid="footer-contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

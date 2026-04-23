import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { track } from "@/lib/analytics";
import { toast } from "sonner";
import { Lock, Check } from "lucide-react";
import { usePricing, tiersAsList } from "@/lib/pricing";

export default function MockCheckoutModal({ open, onClose, sessionId, onSuccess, initialTier }) {
  const pricing = usePricing();
  const tiers = tiersAsList(pricing);
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [tier, setTier] = useState(initialTier || "pro");

  useEffect(() => {
    if (!open) return;
    const preferred =
      initialTier ||
      (typeof window !== "undefined" && sessionStorage.getItem("preferred_tier")) ||
      "pro";
    setTier(preferred === "free" || !pricing[preferred] ? "pro" : preferred);
  }, [open, initialTier, pricing]);

  const selected = pricing[tier] || pricing.pro;

  const pay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const { data } = await api.post("/checkout/mock", {
        session_id: sessionId,
        email: email || null,
        tier,
      });
      track("checkout_completed", { amount_usd: data.amount, tier: data.tier, payment_id: data.payment_id });
      toast.success(`Payment succeeded · ${selected.label} · $${data.amount}`);
      onSuccess?.(data);
    } catch (err) {
      toast.error("Mock payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg border border-foreground/20 p-0 rounded-none bg-background"
        data-testid="checkout-modal"
      >
        <div className="p-6 border-b border-foreground/15">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight flex items-center gap-2">
              <Lock className="h-4 w-4" /> Pick your tier
            </DialogTitle>
            <DialogDescription className="sr-only">
              Choose a pricing tier and complete the mock checkout to unlock your full EU AI Act compliance report.
            </DialogDescription>
          </DialogHeader>
          <p className="label-eyebrow text-foreground/60 mt-2">
            Mock checkout · Razorpay-ready · no real charge
          </p>
        </div>
        <form onSubmit={pay} className="p-6 space-y-5">
          <div className="grid grid-cols-3 border border-foreground/15" data-testid="tier-picker">
            {tiers.map((t, i) => {
              const active = tier === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  className={`relative p-3 text-left ${
                    i !== tiers.length - 1 ? "border-r border-foreground/15" : ""
                  } ${active ? "bg-foreground text-background" : "hover:bg-foreground/5"}`}
                  data-testid={`tier-option-${t.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="label-eyebrow text-[10px]">{t.label}</span>
                    {active && <Check className="h-3 w-3" />}
                  </div>
                  <div className="font-display text-xl tabular-nums">${t.amount_usd}</div>
                  {t.popular && (
                    <span className="absolute top-0 right-0 bg-[#EAB308] text-black label-eyebrow text-[9px] px-1">
                      Popular
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="border border-foreground/15 p-4 flex items-center justify-between">
            <div>
              <div className="label-eyebrow text-foreground/60">Selected · {selected.label}</div>
              <div className="text-xs text-foreground/70 mt-1">{selected.tagline}</div>
            </div>
            <span className="font-display text-3xl tracking-tight">${selected.amount_usd}.00</span>
          </div>

          <div>
            <label className="label-eyebrow text-foreground/60 block mb-2" htmlFor="co-email">
              Email for the report
            </label>
            <input
              id="co-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full h-11 border border-foreground/20 px-4 bg-transparent outline-none focus:border-foreground"
              data-testid="checkout-email-input"
            />
          </div>
          <div className="border border-foreground/15 p-4 space-y-2">
            <div className="label-eyebrow text-foreground/60">Card (mock)</div>
            <div className="mono text-sm tracking-widest">4242 4242 4242 4242</div>
            <div className="flex justify-between mono text-xs text-foreground/60">
              <span>12 / 28</span><span>CVC 123</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="w-full h-12 bg-[#0020C2] text-white hover:bg-[#00189B] label-eyebrow transition-all disabled:opacity-50"
            data-testid="checkout-pay-btn"
          >
            {processing ? "Processing…" : `Pay $${selected.amount_usd} · ${selected.label} (mock)`}
          </button>
          <p className="mono text-[11px] text-foreground/50 text-center">
            Live Razorpay gateway plugs into /api/checkout/mock with no frontend changes
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

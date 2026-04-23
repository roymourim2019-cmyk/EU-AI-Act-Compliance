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
import { Lock, Check, ShieldCheck } from "lucide-react";
import { usePricing, tiersAsList } from "@/lib/pricing";

// Lazy-load Razorpay Checkout.js exactly once per session.
const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let _razorpayScriptPromise = null;
function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (_razorpayScriptPromise) return _razorpayScriptPromise;
  _razorpayScriptPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = RAZORPAY_SRC;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
  return _razorpayScriptPromise;
}

export default function MockCheckoutModal({ open, onClose, sessionId, onSuccess, initialTier }) {
  const pricing = usePricing();
  const tiers = tiersAsList(pricing);
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [tier, setTier] = useState(initialTier || "pro");
  const [provider, setProvider] = useState({ enabled: false, key_id: null }); // razorpay config

  useEffect(() => {
    if (!open) return;
    const preferred =
      initialTier ||
      (typeof window !== "undefined" && sessionStorage.getItem("preferred_tier")) ||
      "pro";
    setTier(preferred === "free" || !pricing[preferred] ? "pro" : preferred);
    // Fetch Razorpay config on modal open. Cheap — cached by the browser after first hit.
    api.get("/razorpay/config").then(({ data }) => {
      setProvider({ enabled: !!data?.enabled, key_id: data?.key_id || null });
      if (data?.enabled) loadRazorpayScript();
    }).catch(() => setProvider({ enabled: false, key_id: null }));
  }, [open, initialTier, pricing]);

  const selected = pricing[tier] || pricing.pro;

  const payViaRazorpay = async () => {
    const ok = await loadRazorpayScript();
    if (!ok || !window.Razorpay) {
      toast.error("Couldn't load Razorpay. Check your network and retry.");
      return false;
    }
    const { data: order } = await api.post("/razorpay/order", {
      session_id: sessionId,
      tier,
      email: email || null,
    });
    return new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount_paise,
        currency: order.currency,
        order_id: order.order_id,
        name: "Roy's Enterprise",
        description: `EU AI Act Compliance · ${order.tier_label}`,
        prefill: { email: email || undefined },
        notes: { tier: order.tier, session_id: sessionId },
        theme: { color: "#0020C2" },
        handler: async (res) => {
          try {
            const { data: verify } = await api.post("/razorpay/verify", {
              session_id: sessionId,
              tier,
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
              email: email || null,
            });
            track("checkout_completed", {
              amount_usd: verify.amount_usd,
              tier: verify.tier,
              payment_id: verify.payment_id,
              provider: "razorpay",
            });
            toast.success(`Payment succeeded · ${selected.label} · $${verify.amount_usd}`);
            onSuccess?.(verify);
            resolve(true);
          } catch (err) {
            toast.error("Payment captured but verification failed. We'll resolve it — check your email.");
            resolve(false);
          }
        },
        modal: {
          ondismiss: () => {
            track("checkout_cancelled", { tier, provider: "razorpay" });
            resolve(false);
          },
        },
      });
      rzp.on("payment.failed", (e) => {
        toast.error(`Payment failed: ${e?.error?.description || "try again"}`);
        resolve(false);
      });
      rzp.open();
    });
  };

  const payViaMock = async () => {
    await new Promise((r) => setTimeout(r, 800));
    const { data } = await api.post("/checkout/mock", {
      session_id: sessionId,
      email: email || null,
      tier,
    });
    track("checkout_completed", {
      amount_usd: data.amount,
      tier: data.tier,
      payment_id: data.payment_id,
      provider: "mock",
    });
    toast.success(`Payment succeeded · ${selected.label} · $${data.amount}`);
    onSuccess?.(data);
    return true;
  };

  const pay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      if (provider.enabled) {
        await payViaRazorpay();
      } else {
        await payViaMock();
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || "Payment failed";
      toast.error(msg);
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
              Choose a pricing tier and complete checkout to unlock your full EU AI Act compliance report.
            </DialogDescription>
          </DialogHeader>
          <p className="label-eyebrow text-foreground/60 mt-2 flex items-center gap-2" data-testid="checkout-provider-label">
            {provider.enabled ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-[#16A34A]" /> Razorpay · secure checkout · charged in INR
              </>
            ) : (
              <>Mock checkout · no real charge</>
            )}
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

          {!provider.enabled && (
            <div className="border border-foreground/15 p-4 space-y-2">
              <div className="label-eyebrow text-foreground/60">Card (mock)</div>
              <div className="mono text-sm tracking-widest">4242 4242 4242 4242</div>
              <div className="flex justify-between mono text-xs text-foreground/60">
                <span>12 / 28</span><span>CVC 123</span>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={processing}
            className="w-full h-12 bg-[#0020C2] text-white hover:bg-[#00189B] label-eyebrow transition-all disabled:opacity-50"
            data-testid="checkout-pay-btn"
          >
            {processing
              ? "Processing…"
              : provider.enabled
              ? `Pay $${selected.amount_usd} · ${selected.label} · via Razorpay`
              : `Pay $${selected.amount_usd} · ${selected.label} (mock)`}
          </button>
          <p className="mono text-[11px] text-foreground/50 text-center">
            {provider.enabled
              ? "Charged in INR · exchange rate locked at order time"
              : "Razorpay activates automatically once keys are configured on the server"}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export default function MockCheckoutModal({ open, onClose, sessionId, onSuccess }) {
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);

  const pay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      const { data } = await api.post("/checkout/mock", { session_id: sessionId, email: email || null });
      toast.success(`Payment succeeded · ${data.payment_id}`);
      onSuccess?.(data);
    } catch (e) {
      toast.error("Mock payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md border border-foreground/20 p-0 rounded-none bg-background"
        data-testid="checkout-modal"
      >
        <div className="p-6 border-b border-foreground/15">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-tight flex items-center gap-2">
              <Lock className="h-4 w-4" /> Unlock full report
            </DialogTitle>
          </DialogHeader>
          <p className="label-eyebrow text-foreground/60 mt-2">
            Mock checkout · Razorpay-ready · no real charge
          </p>
        </div>
        <form onSubmit={pay} className="p-6 space-y-5">
          <div className="border border-foreground/15 p-4 flex items-center justify-between">
            <span className="label-eyebrow text-foreground/60">Total</span>
            <span className="font-display text-3xl tracking-tight">$49.00</span>
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
            {processing ? "Processing…" : "Pay $49 (mock)"}
          </button>
          <p className="mono text-[11px] text-foreground/50 text-center">
            Live Razorpay/Stripe integration can be plugged in at /api/checkout/mock
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

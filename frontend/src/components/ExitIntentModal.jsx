import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, FileText, Building2, GitCompare, BadgeCheck, ArrowRight } from "lucide-react";
import { track } from "@/lib/analytics";

const STORAGE_KEY = "eu_ai_act_exit_intent_shown";

export default function ExitIntentModal({ onUpgrade, enabled = true }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const onMouseOut = (e) => {
      if (e.clientY > 0) return; // only trigger on top exit
    if (!e.relatedTarget) {
        sessionStorage.setItem(STORAGE_KEY, "1");
        track("exit_intent_shown", {});
        setOpen(true);
      }
    };
    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, [enabled]);

  const accept = () => {
    track("exit_intent_accepted", {});
    setOpen(false);
    onUpgrade?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg border border-foreground/20 rounded-none p-0 bg-background" data-testid="exit-intent-modal">
        <div className="p-6 border-b border-foreground/15">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl tracking-tighter leading-[1.05]">
              Wait — you haven&apos;t unlocked the part your legal team actually needs.
            </DialogTitle>
            <DialogDescription className="sr-only">
              Upgrade reminder before leaving the results page.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-6 space-y-3">
          {[
            { icon: FileText, t: "Full obligations checklist mapped to Art 9–15" },
            { icon: BadgeCheck, t: "Compliance badge (SVG + embed code)" },
            { icon: Building2, t: "Supplier questionnaire (CSV) for your vendors" },
            { icon: GitCompare, t: "Portfolio comparison & PDF export" },
            { icon: Lock, t: "Lifetime access — $49 one-time, no subscription" },
          ].map((x, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-foreground/10 pb-2">
              <x.icon className="h-4 w-4 mt-0.5 text-[#0020C2]" />
              <span className="text-sm">{x.t}</span>
            </div>
          ))}
          <button
            onClick={accept}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 h-12 bg-[#0020C2] text-white hover:bg-[#00189B] label-eyebrow transition-all"
            data-testid="exit-intent-cta"
          >
            Unlock for $49 <ArrowRight className="h-4 w-4" />
          </button>
          <p className="label-eyebrow text-foreground/50 text-center">Early-access price · jumps to $99 on 1 Sep 2026</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

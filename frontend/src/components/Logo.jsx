import React from "react";

/**
 * "EU AI Act Compliance" logo — Swiss/brutalist monogram.
 *
 * Layout:
 *   [  AI·C  ] [·][·][·]
 *   Black foreground square with inverted "AI·C" text, and a
 *   three-dot risk-traffic-light stack on the right.
 *
 * Theme-aware: swaps on dark mode via currentColor / bg utilities.
 */
export default function Logo({ className = "h-7" }) {
  return (
    <div className={`inline-flex items-stretch gap-1.5 ${className}`} aria-hidden="true" data-testid="brand-logo">
      <div className="relative aspect-square bg-foreground text-background grid place-items-center">
        <span className="font-display text-[10px] font-black tracking-tighter leading-none">
          AI·C
        </span>
      </div>
      <div className="flex flex-col gap-[2px] justify-center">
        <div className="h-1.5 w-1.5 bg-[#DC2626]" />
        <div className="h-1.5 w-1.5 bg-[#EAB308]" />
        <div className="h-1.5 w-1.5 bg-[#16A34A]" />
      </div>
    </div>
  );
}

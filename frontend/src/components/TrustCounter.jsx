import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function TrustCounter() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/stats").then(({ data }) => setStats(data)).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[TrustCounter] /api/stats failed:", err?.message);
    });
  }, []);
  if (!stats) return null;
  return (
    <div className="flex flex-wrap items-center gap-6 label-eyebrow text-foreground/70" data-testid="trust-counter">
      <div className="flex items-center gap-2">
        <span className="inline-block h-2 w-2 bg-[#16A34A] pulse-dot" />
        <span className="mono text-foreground tabular-nums">{stats.assessed.toLocaleString()}</span>
        <span>AI systems diagnosed</span>
      </div>
      <span className="hidden md:inline text-foreground/30">·</span>
      <div>
        <span className="mono text-foreground tabular-nums">{stats.reports_sold.toLocaleString()}</span> paid reports delivered
      </div>
    </div>
  );
}

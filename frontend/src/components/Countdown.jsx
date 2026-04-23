import React, { useEffect, useState } from "react";

function getTimeLeft(target) {
  const diff = target - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
}

const TARGET = new Date("2026-08-02T00:00:00Z").getTime();

export default function Countdown({ compact = false }) {
  const [t, setT] = useState(getTimeLeft(TARGET));
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(TARGET)), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <span className="mono text-xs" data-testid="countdown-compact">
        {t.d}d · {pad(t.h)}h · {pad(t.m)}m · {pad(t.s)}s
      </span>
    );
  }

  return (
    <div className="flex items-stretch gap-0 border border-foreground/20" data-testid="countdown-grid">
      {[
        { k: "DAYS", v: t.d },
        { k: "HOURS", v: pad(t.h) },
        { k: "MINUTES", v: pad(t.m) },
        { k: "SECONDS", v: pad(t.s) },
      ].map((x, i) => (
        <div
          key={x.k}
          className={`flex-1 px-5 py-4 ${i !== 0 ? "border-l border-foreground/20" : ""}`}
        >
          <div className="font-display text-3xl md:text-4xl tabular-nums">{x.v}</div>
          <div className="label-eyebrow mt-1 text-muted-foreground">{x.k}</div>
        </div>
      ))}
    </div>
  );
}

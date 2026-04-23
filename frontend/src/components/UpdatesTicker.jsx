import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowUpRight, Radio } from "lucide-react";

/**
 * Compact "Last updated" strip for the Landing page. Mirrors a regulatory-
 * updates ticker: date + tag + one-line title, with a link to the full feed.
 * Data comes from /api/updates (curated monthly in server.py).
 */
export default function UpdatesTicker() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/updates?limit=4").then(({ data }) => {
      if (data?.updates) setItems(data.updates);
    }).catch(() => { /* silent — not critical */ });
  }, []);

  if (!items.length) return null;

  return (
    <section className="border-b border-foreground/10 bg-foreground/[0.02]" data-testid="updates-ticker">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-end justify-between mb-6 gap-6 flex-wrap">
          <div>
            <div className="label-eyebrow text-foreground/60 mb-2 flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-[#DC2626]" /> § Last updated · regulatory feed
            </div>
            <h2 className="font-display text-3xl md:text-4xl tracking-tighter leading-[1.05]">
              What moved in the last ninety days.
            </h2>
          </div>
          <Link
            to="/updates"
            className="label-eyebrow text-foreground/70 hover:text-foreground inline-flex items-center gap-1 sharp-link"
            data-testid="updates-view-all"
          >
            View full feed <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 border-t border-l border-foreground/15" data-testid="updates-list">
          {items.map((u) => (
            <li
              key={u.id}
              className="p-5 border-r border-b border-foreground/15"
              data-testid={`update-${u.id}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="mono text-xs text-foreground/60">{u.date}</span>
                <span className="label-eyebrow text-[10px] px-1.5 py-0.5 bg-foreground text-background">
                  {u.tag}
                </span>
              </div>
              <div className="font-display text-lg tracking-tight leading-snug mb-1">{u.title}</div>
              <p className="text-sm text-foreground/70 leading-relaxed">{u.body}</p>
              {u.url && (
                <a
                  href={u.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 label-eyebrow text-foreground/70 hover:text-[#0020C2]"
                  data-testid={`update-source-${u.id}`}
                >
                  {u.source} <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

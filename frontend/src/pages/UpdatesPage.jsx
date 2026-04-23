import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { ArrowUpRight, Radio, ArrowLeft } from "lucide-react";
import useSeo from "@/lib/useSeo";

export default function UpdatesPage() {
  const [items, setItems] = useState([]);

  useSeo({
    title: "EU AI Act regulatory updates · Feb 2026 feed",
    description:
      "Curated regulatory updates for the EU AI Act, UK AI Regulation, and Colorado AI Act. AI Office bulletins, enforcement actions, harmonised standards, FRIA templates.",
    canonical: typeof window !== "undefined" ? window.location.origin + "/updates" : "",
  });

  useEffect(() => {
    api.get("/updates?limit=20").then(({ data }) => {
      if (data?.updates) setItems(data.updates);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="updates-page">
      <Navbar />
      <main className="flex-1">
        <section className="border-b border-foreground/10">
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-16 md:py-20">
            <Link to="/" className="label-eyebrow text-foreground/60 hover:text-foreground inline-flex items-center gap-1 mb-8 sharp-link">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </Link>
            <div className="label-eyebrow text-foreground/60 mb-4 flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 text-[#DC2626]" /> § Regulatory updates feed
            </div>
            <h1 className="font-display text-5xl md:text-6xl tracking-tighter leading-[0.95]">
              Last updated.
            </h1>
            <p className="mt-6 max-w-2xl text-foreground/70 leading-relaxed">
              Hand-curated from AI Office, CEN-CENELEC JTC 21, national data-protection authorities, UK AISI, and the
              Colorado AG. No press-release repackaging — we link to the primary source.
            </p>
          </div>
        </section>
        <section>
          <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-10 md:py-14">
            <ul className="border-t border-foreground/15" data-testid="updates-full-list">
              {items.map((u) => (
                <li
                  key={u.id}
                  className="grid md:grid-cols-12 gap-6 py-7 border-b border-foreground/15"
                  data-testid={`update-row-${u.id}`}
                >
                  <div className="md:col-span-2">
                    <div className="mono text-sm text-foreground/70">{u.date}</div>
                    <div className="mt-2 label-eyebrow text-[10px] inline-block px-1.5 py-0.5 bg-foreground text-background">
                      {u.tag}
                    </div>
                  </div>
                  <div className="md:col-span-10">
                    <div className="font-display text-xl md:text-2xl tracking-tight leading-snug mb-2">{u.title}</div>
                    <p className="text-foreground/80 leading-relaxed">{u.body}</p>
                    {u.url && (
                      <a
                        href={u.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1 label-eyebrow text-foreground/70 hover:text-[#0020C2]"
                      >
                        Source · {u.source} <ArrowUpRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {!items.length && (
              <div className="py-20 text-center label-eyebrow text-foreground/60">Loading feed…</div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

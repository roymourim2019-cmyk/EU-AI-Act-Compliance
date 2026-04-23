import React from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";
import { ArrowUpRight } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b border-foreground/10" data-testid="main-navbar">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" data-testid="brand-link">
          <Logo className="h-7" />
          <span className="font-display text-lg tracking-tight">EU AI Act Compliance</span>
          <span className="mono text-[10px] text-muted-foreground ml-1 hidden md:inline">v.2026.02</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 label-eyebrow text-foreground/70">
          {isLanding ? (
            <>
              <a href="#how-it-works" className="sharp-link hover:text-foreground" data-testid="nav-how">How it works</a>
              <a href="#pricing" className="sharp-link hover:text-foreground" data-testid="nav-pricing">Pricing</a>
              <a href="#faq" className="sharp-link hover:text-foreground" data-testid="nav-faq">FAQ</a>
            </>
          ) : (
            <Link to="/" className="sharp-link hover:text-foreground" data-testid="nav-home">Home</Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/quiz"
            className="group inline-flex items-center gap-1 h-9 px-4 bg-foreground text-background label-eyebrow hover:bg-[#0020C2] hover:text-white transition-all duration-200"
            data-testid="nav-start-quiz"
          >
            Start quiz
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="h-9 w-9 border border-foreground/20 hover:bg-foreground hover:text-background transition-all duration-200 ease-out inline-flex items-center justify-center"
      aria-label="Toggle theme"
      data-testid="theme-toggle"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

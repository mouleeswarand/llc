"use client";

import { useEffect, useState } from "react";
import { THEME_COOKIE, parseTheme, type Theme } from "@/lib/theme";

const ORDER: Theme[] = ["light", "dark", "system"];
const LABELS: Record<Theme, string> = { light: "Light theme", dark: "Dark theme", system: "System theme" };

/** Cycles light → dark → system. Saved in a cookie so the server renders the same theme next time. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  // The server already rendered <html data-theme>, so read it rather than guessing.
  useEffect(() => setTheme(parseTheme(document.documentElement.dataset.theme)), []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(theme ?? "system") + 1) % ORDER.length];
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (next !== "system") root.classList.add(next);
    root.dataset.theme = next;
    document.cookie =
      next === "system"
        ? `${THEME_COOKIE}=; path=/; max-age=0; samesite=lax`
        : `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setTheme(next);
  }

  const current = theme ?? "system";
  return (
    <button
      type="button"
      onClick={cycle}
      title={`${LABELS[current]} — click to change`}
      aria-label={`${LABELS[current]}. Click to change theme`}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-surface text-slate-600 transition hover:border-slate-300 hover:text-slate-900 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden>
        {current === "light" && (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
        {current === "dark" && <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />}
        {current === "system" && (
          <>
            <rect x="3" y="4" width="18" height="12" rx="2" />
            <path d="M8 20h8M12 16v4" />
          </>
        )}
      </svg>
    </button>
  );
}

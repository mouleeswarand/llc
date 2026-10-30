import type { Config } from "tailwindcss";

// Colors are CSS variables (RGB triplets) defined in globals.css for :root and .dark,
// so every existing utility (bg-slate-50, text-brand-600, …) follows the active theme.
const scale = (name: string, steps: number[]) =>
  Object.fromEntries(steps.map((s) => [s, `rgb(var(--${name}-${s}) / <alpha-value>)`]));

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export default {
  // `dark:` applies when <html> has .dark (chosen), or when the OS is dark and the user
  // hasn't explicitly picked light (.light). No script needed, so no flash.
  darkMode: ["variant", ["&:is(.dark *)", "@media (prefers-color-scheme: dark) { &:not(.light *) }"]],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: scale("slate", STEPS),
        brand: scale("brand", STEPS),
        accent: scale("accent", [100, 500, 600]),
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(var(--shadow) / 0.06), 0 4px 16px -4px rgb(var(--shadow) / 0.08)",
        lift: "0 2px 4px rgb(var(--shadow) / 0.08), 0 12px 32px -8px rgb(var(--shadow) / 0.18)",
      },
    },
  },
  plugins: [],
} satisfies Config;

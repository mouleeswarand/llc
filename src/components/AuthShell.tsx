import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BRAND } from "@/lib/brand";

const POINTS = [
  "Your formation documents, EIN and filings in one place",
  "Scanned business mail, delivered to your dashboard",
  "Annual report reminders so you stay in good standing",
];

/** Two-column frame for the login and sign-up pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_24rem_at_10%_0%,rgb(52_94_226/0.35),transparent),radial-gradient(30rem_20rem_at_100%_100%,rgb(196_146_54/0.18),transparent)]" />
        <div className="relative self-start"><Logo tone="light" /></div>
        <div className="relative">
          <p className="font-display text-4xl font-semibold leading-tight">{BRAND.slogan}</p>
          <ul className="mt-8 space-y-4 text-white/80">
            {POINTS.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[0.6875rem] text-[#e0b25c]">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/50">© {new Date().getFullYear()} {BRAND.name}</p>
      </aside>

      <main className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <span className="lg:invisible"><Logo /></span>
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}

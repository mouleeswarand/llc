import Link from "next/link";
import { Logo } from "@/components/Logo";
import { BRAND } from "@/lib/brand";
import { PACKAGES, STATES } from "@/lib/catalog";
import { money } from "@/lib/format";
import { getSessionUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

const PROMOS = ["Online filing in minutes", "Registered agent included", "State fees at cost"];

const HERO_POINTS = [
  "Formation documents prepared and filed for you",
  "Registered agent address keeps your home address off public records",
  "One dashboard for documents, mail, billing and annual reports",
];

const FEATURES = [
  { icon: "file", title: "State filing", body: "We prepare your Articles and submit them to the Secretary of State." },
  { icon: "shield", title: "Registered agent", body: "An in-state address to receive legal notices on your behalf." },
  { icon: "hash", title: "EIN", body: "We obtain your Employer Identification Number from the IRS." },
  { icon: "mail", title: "Mail scanning", body: "Business mail scanned to your dashboard, forwarded on request." },
  { icon: "calendar", title: "Compliance reminders", body: "Annual report deadlines tracked so you stay in good standing." },
] as const;

const SERVICE_GROUPS = [
  {
    title: "Company formation",
    items: ["LLCs and corporations", "Operating agreements and bylaws", "Certificates of good standing"],
  },
  {
    title: "Ongoing compliance",
    items: ["Annual report filing", "Address and name changes", "Adding or removing members and officers"],
  },
  {
    title: "Documents and certificates",
    items: ["Certified copies", "Apostilles", "Corporate binder and seal"],
  },
];

const STEPS = [
  { title: "Tell us about your company", body: "Pick your state, entity type and name. Add your members or shareholders." },
  { title: "We file with the state", body: "We prepare and submit your Articles and act as your registered agent." },
  { title: "Run it from your dashboard", body: "Documents, mail, billing, annual reports and add-on services in one place." },
];

const FAQ = [
  { q: "How long does formation take?", a: "Most states approve filings within 1–10 business days. Expedited options vary by state." },
  { q: "Do I need to live in the state I form in?", a: "No. Our registered agent address satisfies the in-state address requirement." },
  { q: "What are the state fees?", a: "State fees are charged at cost and shown before checkout. They differ by state and entity type." },
];

const FOOTER_COLUMNS = [
  { title: "Services", links: [["Form an LLC", "/start"], ["Form a corporation", "/start"], ["Pricing", "#pricing"]] },
  { title: "Resources", links: [["How it works", "#how"], ["FAQ", "#faq"], ["State fees", "#pricing"]] },
  { title: "Account", links: [["Log in", "/login"], ["Dashboard", "/dashboard"], ["Start your business", "/start"]] },
] as const;

export default async function Home() {
  const session = await getSessionUser();
  return (
    <div className="marketing min-h-screen">
      <div className="bg-brand-900 text-white">
        <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm sm:px-6 lg:px-10 xl:px-16">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {PROMOS.map((p) => (
              <li key={p} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent-500" />{p}</li>
            ))}
          </ul>
          <span className="hidden font-semibold md:inline">{BRAND.slogan}</span>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10 xl:px-16">
          <Logo />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {BRAND.supportPhone && (
              <a href={`tel:${BRAND.supportPhone}`} className="hidden text-base font-semibold text-brand-700 sm:inline">Call {BRAND.supportPhone}</a>
            )}
            <Link href="/start" className="btn-primary hidden sm:inline-flex">Start Your Business</Link>
          </div>
        </div>
        <nav className="mx-auto flex w-full flex-wrap items-center gap-x-7 gap-y-2 px-4 pb-3 text-[15px] font-medium text-slate-600 sm:px-6 lg:px-10 xl:px-16">
          <a href="#services" className="hover:text-brand-600">Services</a>
          <a href="#pricing" className="hover:text-brand-600">Pricing</a>
          <a href="#how" className="hover:text-brand-600">How it works</a>
          <a href="#faq" className="hover:text-brand-600">FAQ</a>
          {session ? (
            <Link href="/dashboard" className="ml-auto text-brand-600 hover:underline">Dashboard</Link>
          ) : (
            <span className="ml-auto flex gap-5">
              <Link href="/login" className="text-brand-600 hover:underline">Login</Link>
              <Link href="/signup" className="text-brand-600 hover:underline">Sign up</Link>
            </span>
          )}
        </nav>
      </header>

      <section className="relative overflow-hidden px-4 py-14 sm:px-6 lg:px-10 xl:px-16 lg:py-24">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,rgb(var(--brand-500)/0.14),transparent),radial-gradient(40rem_24rem_at_0%_110%,rgb(var(--accent-500)/0.10),transparent)]" />
        <div className="hero-grid relative items-center">
          <div className="hero-badge flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">We file in</span>
            {Object.values(STATES).map((s) => (
              <span key={s.name} className="rounded-full border border-slate-200 bg-surface px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">{s.name}</span>
            ))}
          </div>
          <div className="hero-title">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-600">{BRAND.slogan}</p>
            <h1 className="mt-3 text-[2.75rem] leading-[1.08] sm:text-6xl">Start your LLC <span className="text-brand-600">today</span></h1>
            <ul className="mt-6 space-y-3">
              {HERO_POINTS.map((p) => (
                <li key={p} className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-brand-600" />{p}</li>
              ))}
            </ul>
          </div>
          <div className="hero-image flex justify-center">
            <HeroIllustration />
          </div>
          <div className="hero-button flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/start" className="btn-primary px-8 py-3 text-base">Start Your Business</Link>
            <p className="flex items-center gap-2 text-base text-slate-600">
              <Icon name="tag" className="h-5 w-5 text-accent-500" />
              Packages from {money(Math.min(...PACKAGES.map((p) => p.priceCents)))} + state fees
            </p>
          </div>
        </div>
      </section>

      <section id="services" className="px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto w-full">
          <h2 className="text-center text-4xl text-ink">Launch your business today</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50"><Icon name={f.icon} className="h-6 w-6 text-brand-600" /></span>
                <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-base text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center"><Link href="/start" className="btn-primary px-8 py-3 text-base">Launch Your Business</Link></div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="grid w-full gap-10 xl:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="text-4xl text-ink">Everything your company needs after formation</h2>
            <p className="mt-4 text-slate-600">
              Forming the company is the first step. Keeping it in good standing means filing reports on time, keeping records
              current and handling official mail. Order any of these from your dashboard whenever you need them.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {SERVICE_GROUPS.map((g) => (
              <Link key={g.title} href="/start" className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift">
                <h3 className="font-bold text-slate-900">{g.title}</h3>
                <ul className="mt-3 space-y-2 text-base text-slate-600">
                  {g.items.map((i) => (
                    <li key={i} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-brand-600" />{i}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto w-full">
          <h2 className="text-center text-4xl text-ink">Packages</h2>
          <p className="mt-2 text-center text-slate-600">Plus state filing fees, charged at cost.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PACKAGES.map((p, i) => (
              <div key={p.code} className={`flex flex-col rounded-2xl border bg-surface p-7 shadow-card ${i === 1 ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200"}`}>
                {i === 1 && <span className="mb-3 self-start rounded-full bg-accent-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-accent-600 ring-1 ring-accent-500/30">Most popular</span>}
                <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                <p className="mt-3 text-3xl font-bold text-brand-700">
                  {money(p.priceCents)}
                  {p.monthlyCents > 0 && <span className="text-base font-normal text-slate-500"> + {money(p.monthlyCents)}/mo</span>}
                </p>
                <ul className="mt-5 flex-1 space-y-2 text-base text-slate-600">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-brand-600" />{f}</li>
                  ))}
                </ul>
                <Link href={`/start?package=${p.code}`} className="btn-primary mt-6">Choose {p.name}</Link>
              </div>
            ))}
          </div>
          <div className="mt-10 overflow-x-auto">
            <table className="table mx-auto max-w-2xl rounded-xl bg-surface text-base">
              <thead>
                <tr><th>State</th><th>Formation fee</th><th>Annual report</th></tr>
              </thead>
              <tbody>
                {Object.entries(STATES).map(([code, s]) => (
                  <tr key={code}>
                    <td>{s.name}</td>
                    <td>{money(s.formationFeeCents)}</td>
                    <td>{s.annualReportFeeCents ? money(s.annualReportFeeCents) : "None"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="how" className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto w-full">
          <h2 className="text-center text-4xl text-ink">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{i + 1}</div>
                <h3 className="font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-base text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-4xl text-ink">Questions</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-xl border border-slate-200 bg-surface p-5">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-base text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-900 px-4 py-16 text-center text-white sm:px-6 lg:px-10 xl:px-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,rgb(52_94_226/0.35),transparent)]" />
        <div className="relative">
          <h2 className="text-4xl !text-white">Ready to form your company?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">It takes about ten minutes. We handle the filing from there.</p>
          <Link href="/start" className="btn mt-7 bg-white px-8 py-3 text-base text-[#0a193a] shadow-lg hover:bg-white/90">Start Your Business</Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-brand-900 px-4 py-12 text-white/70 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto grid w-full gap-8 md:grid-cols-4">
          <div>
            <div className="inline-block rounded-lg bg-white p-3 [&_span]:!text-[#0a193a]"><Logo /></div>
            <p className="mt-4 text-base">{BRAND.tagline}</p>
            <p className="mt-2 text-base"><a href={`mailto:${BRAND.supportEmail}`} className="hover:text-white">{BRAND.supportEmail}</a></p>
          </div>
          {FOOTER_COLUMNS.map((c) => (
            <div key={c.title}>
              <h3 className="font-semibold !text-white">{c.title}</h3>
              <ul className="mt-3 space-y-2 text-base">
                {c.links.map(([label, href]) => (
                  <li key={label}><a href={href} className="hover:text-white">{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 w-full border-t border-white/15 pt-6 text-sm text-white/55">
          <p>
            {BRAND.name} is not a law firm and does not provide legal, tax or financial advice. Information on this site is general
            and may not apply to your situation. State fees are set by each state and may change.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
    </svg>
  );
}

const ICON_PATHS: Record<string, string> = {
  file: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z",
  hash: "M9 4 7 20M17 4l-2 16M4 9h16M3 15h16",
  mail: "M3 6h18v12H3zM3 6l9 7 9-7",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  tag: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01",
};

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

function HeroIllustration() {
  return (
    <svg viewBox="0 0 400 320" className="h-auto w-full max-w-md" role="img" aria-label="Company documents and dashboard">
      <rect x="40" y="30" width="320" height="230" rx="16" className="fill-surface stroke-slate-200" strokeWidth="2" />
      <rect x="40" y="30" width="320" height="40" rx="16" className="fill-brand-600" />
      <rect x="40" y="54" width="320" height="16" className="fill-brand-600" />
      <circle cx="66" cy="50" r="6" fill="#fff" opacity=".7" />
      <circle cx="86" cy="50" r="6" fill="#fff" opacity=".5" />
      <rect x="70" y="95" width="120" height="12" rx="6" className="fill-brand-100" />
      <rect x="70" y="120" width="180" height="10" rx="5" className="fill-slate-200" />
      <rect x="70" y="140" width="150" height="10" rx="5" className="fill-slate-200" />
      <rect x="70" y="175" width="110" height="56" rx="10" className="fill-brand-50" />
      <rect x="196" y="175" width="134" height="56" rx="10" className="fill-brand-50" />
      <path d="M86 204l10 10 20-22" fill="none" className="stroke-brand-600" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="212" y="192" width="90" height="8" rx="4" className="fill-brand-100" />
      <rect x="212" y="208" width="60" height="8" rx="4" className="fill-brand-100" />
      <g transform="translate(262 170) rotate(8)">
        <rect width="100" height="120" rx="8" className="fill-surface stroke-slate-200" strokeWidth="2" />
        <rect x="16" y="20" width="68" height="8" rx="4" className="fill-slate-300" />
        <rect x="16" y="38" width="56" height="6" rx="3" className="fill-slate-200" />
        <rect x="16" y="52" width="62" height="6" rx="3" className="fill-slate-200" />
        <circle cx="70" cy="94" r="14" className="fill-accent-500" />
        <path d="M63 94l5 5 9-10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

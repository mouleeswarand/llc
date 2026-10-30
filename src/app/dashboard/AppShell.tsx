"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon, type IconName } from "@/components/icons";
import { authClient, goTo } from "@/lib/auth-client";

type Company = { id: string; name: string };

const SECTIONS: { href: string; label: string; icon: IconName }[] = [
  { href: "", label: "Overview", icon: "home" },
  { href: "/billing", label: "Billing", icon: "card" },
  { href: "/annual-report", label: "Annual report", icon: "calendar" },
  { href: "/ownership", label: "Ownership", icon: "users" },
  { href: "/services", label: "Services", icon: "sparkle" },
  { href: "/mail", label: "Mail", icon: "mail" },
  { href: "/documents", label: "Documents", icon: "file" },
];

/** Signed-in frame: fixed sidebar on desktop, top bar + slide-in drawer on phones and tablets. */
export function AppShell({ user, companies, children }: { user: { name: string; email: string }; companies: Company[]; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const currentId = pathname.match(/^\/dashboard\/([^/]+)/)?.[1];
  const current = companies.find((c) => c.id === currentId);

  useEffect(() => setOpen(false), [pathname]); // close the drawer after navigating
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const nav = <Sidebar companies={companies} current={current} pathname={pathname} user={user} />;

  return (
    <div className="min-h-screen lg:pl-72">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-surface lg:flex lg:flex-col">{nav}</aside>

      {/* Mobile / tablet drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div className={`absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
        <aside className={`absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-surface shadow-lift transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <button className="absolute right-3 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setOpen(false)} aria-label="Close menu">
            <Icon name="close" />
          </button>
          {nav}
        </aside>
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-surface/85 px-4 backdrop-blur-md sm:px-6 lg:px-10">
        <button className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Icon name="menu" className="h-6 w-6" />
        </button>
        <span className="lg:hidden"><Logo /></span>
        <nav className="hidden min-w-0 items-center gap-2 text-[15px] text-slate-500 lg:flex" aria-label="Breadcrumb">
          <Link href="/dashboard" className="hover:text-slate-900">My companies</Link>
          {current && (
            <>
              <Icon name="chevron" className="h-4 w-4 shrink-0" />
              <span className="truncate font-medium text-slate-900">{current.name}</span>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 sm:flex" title={user.email}>
            {initials(user.name)}
          </span>
        </div>
      </header>

      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

function Sidebar({ companies, current, pathname, user }: { companies: Company[]; current?: Company; pathname: string; user: { name: string; email: string } }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-6"><Logo /></div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <SideLink href="/dashboard" icon="building" label="My companies" active={pathname === "/dashboard"} />

        {current && (
          <div className="mt-6">
            <p className="eyebrow px-3">Company</p>
            <p className="mt-1 truncate px-3 text-[15px] font-semibold text-ink">{current.name}</p>
            <div className="mt-3 space-y-1">
              {SECTIONS.map((s) => {
                const href = `/dashboard/${current.id}${s.href}`;
                return <SideLink key={s.label} href={href} icon={s.icon} label={s.label} active={pathname === href} />;
              })}
            </div>
          </div>
        )}

        {companies.length > 0 && (
          <div className="mt-8">
            <p className="eyebrow px-3">{current ? "Switch company" : "Your companies"}</p>
            <div className="mt-2 space-y-1">
              {companies.filter((c) => c.id !== current?.id).map((c) => (
                <Link key={c.id} href={`/dashboard/${c.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">{initials(c.name)}</span>
                  <span className="truncate">{c.name}</span>
                </Link>
              ))}
              <Link href="/start" className="flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-medium text-brand-600 hover:bg-brand-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-dashed border-brand-300"><Icon name="plus" className="h-4 w-4" /></span>
                Form a new company
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">{initials(user.name)}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            title="Log out"
            aria-label="Log out"
            onClick={async () => {
              await authClient.signOut().catch(() => undefined);
              goTo("/");
            }}
          >
            <Icon name="logout" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SideLink({ href, icon, label, active }: { href: string; icon: IconName; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition ${
        active ? "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <Icon name={icon} className={`h-5 w-5 ${active ? "text-brand-600" : "text-slate-400"}`} />
      {label}
    </Link>
  );
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
}

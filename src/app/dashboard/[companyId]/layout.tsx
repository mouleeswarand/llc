import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Icon } from "@/components/icons";
import { requireCompany } from "@/lib/auth";
import { db } from "@/lib/db";
import { STATES, type StateCode } from "@/lib/catalog";

export default async function CompanyLayout({ children, params }: { children: React.ReactNode; params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const { company } = await requireCompany(companyId);
  const [unsigned, pendingOrders] = await Promise.all([
    db.document.count({ where: { companyId, signatureRequired: true } }),
    db.order.count({ where: { companyId, status: { in: ["PENDING", "FAILED"] } } }),
  ]);
  const base = `/dashboard/${companyId}`;
  const stateName = STATES[company.state as StateCode]?.name ?? company.state;

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-semibold text-white shadow-card dark:to-brand-300">
          {company.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="eyebrow">{stateName} {company.entityType === "LLC" ? "LLC" : "Corporation"}</p>
          <p className="truncate font-display text-2xl font-semibold text-ink sm:text-3xl">{company.name}</p>
        </div>
        <span className="sm:ml-auto"><StatusBadge status={company.status} /></span>
      </div>

      {(unsigned > 0 || pendingOrders > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {unsigned > 0 && (
            <Alert tone="info" text={`${unsigned} document${unsigned > 1 ? "s" : ""} waiting for your signature`} href={`${base}/documents`} cta="Review" />
          )}
          {pendingOrders > 0 && (
            <Alert tone="danger" text={`${pendingOrders} unpaid invoice${pendingOrders > 1 ? "s" : ""}`} href={`${base}/billing`} cta="View billing" />
          )}
        </div>
      )}

      {children}
    </div>
  );
}

function Alert({ tone, text, href, cta }: { tone: "info" | "danger"; text: string; href: string; cta: string }) {
  const styles =
    tone === "info"
      ? "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-200"
      : "border-red-200 bg-red-50 text-red-800 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200";
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-[0.9375rem] ${styles}`}>
      <Icon name={tone === "info" ? "info" : "alert"} className="h-5 w-5 shrink-0" />
      <span className="flex-1">{text}</span>
      <Link href={href} className="shrink-0 font-semibold underline-offset-4 hover:underline">{cta} →</Link>
    </div>
  );
}

import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Icon } from "@/components/icons";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { STATES, type StateCode } from "@/lib/catalog";
import { shortDate } from "@/lib/format";

export default async function MyCompaniesPage() {
  const user = await requireUser();
  const companies = await db.company.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { documents: { where: { signatureRequired: true } } } } },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Welcome back, {user.name.split(" ")[0]}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">My companies</h1>
        </div>
        <Link href="/start" className="btn-primary"><Icon name="plus" className="h-4 w-4" /> Form a new company</Link>
      </div>

      {companies.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Icon name="building" className="h-7 w-7" /></span>
          <h2 className="mt-5 text-2xl">No companies yet</h2>
          <p className="mt-2 max-w-md text-slate-600">Form your first LLC or corporation. It takes about ten minutes, and you can track everything from here.</p>
          <Link href="/start" className="btn-primary mt-6">Start your company</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {companies.map((c) => (
            <Link key={c.id} href={`/dashboard/${c.id}`} className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white dark:to-brand-300">
                  {c.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <StatusBadge status={c.status} />
              </div>
              <h2 className="mt-5 text-xl group-hover:text-brand-600">{c.name}</h2>
              <p className="mt-1 text-slate-500">
                {STATES[c.state as StateCode]?.name ?? c.state} {c.entityType === "LLC" ? "LLC" : "corporation"}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">Formed {shortDate(c.formationDate)}</span>
                {c._count.documents > 0 ? (
                  <span className="font-medium text-amber-700 dark:text-amber-300">{c._count.documents} to sign</span>
                ) : (
                  <span className="flex items-center gap-1 font-medium text-brand-600">Open <Icon name="chevron" className="h-4 w-4" /></span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

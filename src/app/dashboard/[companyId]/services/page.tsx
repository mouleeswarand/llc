import { requireCompany } from "@/lib/auth";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { orderServices } from "@/app/actions/company";

export default async function ServicesPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const { company } = await requireCompany(companyId);
  const services = await db.service.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });

  // Uncategorised services render as rows; categorised ones are grouped under a collapsible heading.
  const groups: { category: string | null; items: typeof services }[] = [];
  for (const s of services) {
    const last = groups[groups.length - 1];
    if (s.category && last?.category === s.category) last.items.push(s);
    else groups.push({ category: s.category, items: [s] });
  }

  return (
    <form action={orderServices} className="space-y-6">
      <input type="hidden" name="companyId" value={company.id} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl">Services</h1>
        <button className="btn-primary">Proceed To Checkout</button>
      </div>
      <div className="card space-y-2">
        {groups.map((g, i) =>
          g.category ? (
            <details key={i} className="py-2">
              <summary className="cursor-pointer py-2 text-slate-800">{g.category}</summary>
              <div className="pl-4">{g.items.map((s) => <ServiceRow key={s.id} s={s} />)}</div>
            </details>
          ) : (
            g.items.map((s) => <ServiceRow key={s.id} s={s} />)
          ),
        )}
        {services.length === 0 && <p className="text-sm text-slate-500">No services configured. Run <code>npm run db:seed</code>.</p>}
      </div>
    </form>
  );
}

function ServiceRow({ s }: { s: { id: string; name: string; priceCents: number } }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 py-3">
      <input type="checkbox" name="serviceId" value={s.id} className="h-4 w-4" />
      <span>
        <span className="block text-slate-800">{s.name}</span>
        <span className="text-sm text-slate-500">{money(s.priceCents)}</span>
      </span>
    </label>
  );
}

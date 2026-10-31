import { requireCompany } from "@/lib/auth";
import { db } from "@/lib/db";
import { MEMBER_ROLES } from "@/lib/catalog";
import { addMember, removeMember } from "@/app/actions/company";

export default async function OwnershipPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const { user, company } = await requireCompany(companyId);
  const members = await db.member.findMany({ where: { companyId }, orderBy: { createdAt: "asc" } });
  const totalPct = members.reduce((s, m) => s + m.ownershipPct, 0);
  const roles = MEMBER_ROLES[company.entityType];

  return (
    <>
      <div>
        <h1 className="text-2xl sm:text-3xl">{company.entityType === "LLC" ? "LLC" : "Corporation"} Ownership Team</h1>
        <p className="mt-2 text-[0.9375rem] text-slate-600">Contact information is kept private and used only for our records and to prepare your documents.</p>
      </div>

      <div className="card overflow-x-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">{company.entityType === "LLC" ? "Members & Managers" : "Officers & Shareholders"}</h2>
          <span className={`text-sm font-semibold ${Math.abs(totalPct - 100) < 0.01 ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>Total: {totalPct}%</span>
        </div>
        <table className="table">
          <thead><tr><th>Name</th><th>Role</th><th>Responsible party</th><th>Ownership</th><th /></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td><div className="font-medium">{m.name}</div><div className="text-slate-500">{m.email}</div></td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {m.roles.map((r) => <span key={r} className="rounded-full bg-sky-50 dark:bg-sky-500/10 px-3 py-1 text-xs text-sky-800 dark:text-sky-300">{r}</span>)}
                  </div>
                </td>
                <td>{m.isResponsibleParty ? "Yes" : "—"}</td>
                <td>{m.ownershipPct}%</td>
                <td className="text-right">
                  <form action={removeMember}>
                    <input type="hidden" name="companyId" value={company.id} />
                    <input type="hidden" name="memberId" value={m.id} />
                    <button className="text-sm text-red-600 dark:text-red-400 hover:underline">Remove</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={addMember} className="card space-y-4">
        <h2 className="text-xl">Add New</h2>
        <input type="hidden" name="companyId" value={company.id} />
        <div className="grid gap-3 md:grid-cols-3">
          <input name="name" required placeholder="Full name" className="input" />
          <input name="email" type="email" placeholder="Email" className="input" />
          <input name="ownershipPct" type="number" min={0} max={100} step="0.01" placeholder="Ownership %" className="input" />
        </div>
        <div className="flex flex-wrap gap-4">
          {roles.map((r) => (
            <label key={r} className="flex items-center gap-1 text-sm"><input type="checkbox" name="roles" value={r} /> {r}</label>
          ))}
        </div>
        <button className="btn-primary">Add</button>
      </form>

      <div className="card">
        <h2 className="text-xl">Account Users</h2>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="font-medium">{user.name}</span>
          <span className="rounded-full bg-sky-50 dark:bg-sky-500/10 px-3 py-1 text-xs text-sky-800 dark:text-sky-300">Account Owner</span>
        </div>
      </div>
    </>
  );
}

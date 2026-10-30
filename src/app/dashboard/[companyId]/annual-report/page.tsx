import { StatusBadge } from "@/components/StatusBadge";
import { requireCompany } from "@/lib/auth";
import { db } from "@/lib/db";
import { longDate, money } from "@/lib/format";
import { fileAnnualReport } from "@/app/actions/company";

export default async function AnnualReportPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const { company } = await requireCompany(companyId);
  const reports = await db.annualReport.findMany({ where: { companyId }, orderBy: { year: "desc" } });

  return (
    <>
      <div>
        <h1 className="text-2xl sm:text-3xl">Annual Report</h1>
        <p className="mt-2 text-[15px] text-slate-600">Keep {company.name} in good standing by filing its annual report before the due date.</p>
      </div>
      <div className="card overflow-x-auto">
        <table className="table">
          <thead><tr><th>Year</th><th>Due date</th><th>State fee</th><th>Status</th><th /></tr></thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.year}</td>
                <td>{longDate(r.dueDate)}</td>
                <td>{money(r.feeCents)}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-right">
                  {(r.status === "UPCOMING" || r.status === "LATE") && (
                    <form action={fileAnnualReport}>
                      <input type="hidden" name="companyId" value={company.id} />
                      <input type="hidden" name="reportId" value={r.id} />
                      <button className="btn-primary">File now</button>
                    </form>
                  )}
                  {r.filedAt && <span className="text-sm text-slate-500">Filed {longDate(r.filedAt)}</span>}
                </td>
              </tr>
            ))}
            {reports.length === 0 && <tr><td colSpan={5} className="text-slate-500">No annual reports scheduled.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

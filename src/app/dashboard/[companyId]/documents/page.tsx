import { requireCompany } from "@/lib/auth";
import { db } from "@/lib/db";
import { shortDate } from "@/lib/format";
import { signDocument, uploadDocument } from "@/app/actions/company";

export default async function DocumentsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const { company } = await requireCompany(companyId);
  const docs = await db.document.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } });

  return (
    <>
      <h1 className="text-2xl sm:text-3xl">Documents</h1>
      <form action={uploadDocument} className="card flex flex-wrap items-center gap-4 border-dashed">
        <input type="hidden" name="companyId" value={company.id} />
        <input type="file" name="file" required className="flex-1 text-sm" />
        <button className="btn-primary">Add new document</button>
        <p className="w-full text-xs text-slate-500">Up to 10 MB. Stored privately; download links expire after 5 minutes.</p>
      </form>
      <div className="space-y-3">
        {docs.map((d) => (
          <div key={d.id} className="card flex items-center gap-4 py-4">
            <span className={`rounded-md border px-2 py-1 text-xs font-bold ${d.fileType === "PDF" ? "border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300" : "border-brand-500 text-brand-600"}`}>{d.fileType}</span>
            <span className="flex-1">
              {d.storageKey || d.url ? <a href={`/api/documents/${d.id}`} className="hover:underline">{d.name}</a> : d.name}
            </span>
            {d.signatureRequired ? (
              <form action={signDocument}>
                <input type="hidden" name="companyId" value={company.id} />
                <input type="hidden" name="documentId" value={d.id} />
                <button className="rounded-md bg-brand-600 px-3 py-1 text-xs font-bold uppercase text-white">Sign now</button>
              </form>
            ) : d.signedAt ? (
              <span className="text-xs text-green-700 dark:text-green-400">Signed {shortDate(d.signedAt)}</span>
            ) : null}
            <span className="w-28 text-right text-sm text-slate-500">{shortDate(d.createdAt)}</span>
          </div>
        ))}
        {docs.length === 0 && <p className="text-sm text-slate-500">No documents yet. Filed documents appear here once the state approves them.</p>}
      </div>
    </>
  );
}

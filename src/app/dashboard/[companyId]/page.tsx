import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { Icon, type IconName } from "@/components/icons";
import { requireCompany } from "@/lib/auth";
import { db } from "@/lib/db";
import { longDate, money } from "@/lib/format";
import { updateAddresses } from "@/app/actions/company";

export default async function OverviewPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const { user, company } = await requireCompany(companyId);
  const [documents, nextReport] = await Promise.all([
    db.document.findMany({ where: { companyId }, orderBy: { createdAt: "asc" } }),
    db.annualReport.findFirst({ where: { companyId, status: { in: ["UPCOMING", "LATE"] } }, orderBy: { year: "asc" } }),
  ]);
  const articles = documents.find((d) => /articles/i.test(d.name));
  const ein = documents.find((d) => /ein/i.test(d.name));
  const agreement = documents.find((d) => /agreement|bylaws/i.test(d.name));

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon="building" label="Status"><StatusBadge status={company.status} /></Stat>
        <Stat icon="calendar" label="Next annual report" hint={nextReport ? `${money(nextReport.feeCents)} state fee` : undefined}>
          {longDate(nextReport?.dueDate ?? company.renewalDate)}
        </Stat>
        <Stat icon="file" label="EIN">{company.ein ?? "Not yet issued"}</Stat>
        <Stat icon="info" label="Filing ID">{company.filingId ?? "Pending"}</Stat>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="card">
          <h2 className="text-xl">Company contact</h2>
          <dl className="mt-5 space-y-4 text-[15px]">
            <Field label="Contact name">{user.name}</Field>
            <Field label="Phone">{user.phone ?? "—"}</Field>
            <Field label="Email">{user.email}</Field>
          </dl>
        </div>

        <form action={updateAddresses} className="card xl:col-span-2">
          <h2 className="text-xl">Addresses</h2>
          <input type="hidden" name="companyId" value={company.id} />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="principalAddress">Principal place of business</label>
              <textarea id="principalAddress" name="principalAddress" rows={3} className="input" defaultValue={company.principalAddress ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="mailingAddress">Mailing address</label>
              <textarea id="mailingAddress" name="mailingAddress" rows={3} className="input" defaultValue={company.mailingAddress ?? ""} />
            </div>
          </div>
          <button className="btn-outline mt-5">Save addresses</button>
        </form>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-2xl">Company documents</h2>
          <Link href={`/dashboard/${company.id}/documents`} className="btn-link">View all documents →</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <DocCard title={company.entityType === "LLC" ? "Articles of Organization" : "Articles of Incorporation"} doc={articles} />
          <DocCard title={company.entityType === "LLC" ? "Operating Agreement" : "Corporate Bylaws"} doc={agreement} />
          <DocCard title="Employer Identification Number" doc={ein} />
        </div>
      </section>
    </>
  );
}

function Stat({ icon, label, hint, children }: { icon: IconName; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="eyebrow">{label}</p>
        <div className="mt-1 truncate text-lg font-semibold text-slate-900">{children}</div>
        {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1 break-words text-slate-900">{children}</dd>
    </div>
  );
}

function DocCard({ title, doc }: { title: string; doc?: { id: string; name: string; url: string | null; storageKey: string | null } }) {
  const downloadable = doc && (doc.storageKey || doc.url);
  return (
    <div className="card flex flex-col p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Icon name="file" /></span>
      <p className="eyebrow mt-4">{title}</p>
      <p className="mt-1 flex-1 text-[15px] text-slate-700">{doc ? doc.name : "Not available yet."}</p>
      {downloadable && (
        <a href={`/api/documents/${doc.id}`} className="btn-outline mt-4 self-start">
          <Icon name="download" className="h-4 w-4" /> Download
        </a>
      )}
    </div>
  );
}

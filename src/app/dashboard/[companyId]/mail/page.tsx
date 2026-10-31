import { requireCompany } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRealtime } from "@/lib/realtime";
import { mailQuery, type LiveMailRow } from "@/lib/realtime-queries";
import { LiveMail } from "./LiveMail";

export default async function MailPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const { user, company } = await requireCompany(companyId);

  // Same rows as mailQuery(): render them now, then the live subscription takes over.
  const [initialData, sealedQuery] = await Promise.all([
    db.mailItem.findMany({
      where: { companyId },
      orderBy: [{ receivedAt: "desc" }, { id: "asc" }],
      take: 200,
      select: { id: true, reference: true, itemType: true, sender: true, receivedAt: true, status: true, tracking: true, scanUrl: true },
    }) as Promise<LiveMailRow[]>,
    getRealtime().seal({ query: mailQuery(user.id, companyId) }),
  ]);

  return (
    <>
      <h1 className="text-2xl sm:text-3xl">Mail</h1>
      <p className="text-[0.9375rem] text-slate-600">To make sure you receive everything, ask senders to address mail to your company name rather than your personal name.</p>
      <LiveMail
        key={sealedQuery.queryFingerprint}
        companyId={company.id}
        userId={user.id}
        realtimeUrl={process.env.NEON_REALTIME_URL!}
        initialData={initialData}
        sealedQuery={sealedQuery}
      />
    </>
  );
}

import { StatusBadge } from "@/components/StatusBadge";
import { requireCompany } from "@/lib/auth";
import { db } from "@/lib/db";
import { longDate, money, shortDate } from "@/lib/format";
import { removePaymentMethod, setDefaultPaymentMethod } from "@/app/actions/company";

export default async function BillingPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const { user, company } = await requireCompany(companyId);
  const [orders, paymentMethods, subscription] = await Promise.all([
    db.order.findMany({ where: { companyId }, include: { paymentMethod: true }, orderBy: { createdAt: "desc" } }),
    db.paymentMethod.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
    db.subscription.findUnique({ where: { companyId } }),
  ]);
  const defaultCard = paymentMethods.find((p) => p.isDefault);

  return (
    <>
      <div>
        <h1 className="text-2xl sm:text-3xl">Billing</h1>
        <p className="mt-2 text-[0.9375rem] text-slate-600">Your upcoming subscription and registration fees for {company.name}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card">
          <div className="eyebrow">Next payment due</div>
          <div className="mt-1 text-lg font-semibold">{subscription ? longDate(subscription.nextPaymentDate) : "—"}</div>
        </div>
        <div className="card">
          <div className="eyebrow">Current monthly bill</div>
          <div className="mt-1 text-lg font-semibold">{subscription ? `${money(subscription.monthlyCents)}/month` : "No subscription"}</div>
          <div className="text-sm text-slate-600">Plus state filing fees</div>
        </div>
        <div className="card">
          <div className="eyebrow">Payment method</div>
          <div className="mt-1 text-lg font-semibold">{defaultCard ? `${defaultCard.brand} ${defaultCard.last4}` : "None on file"}</div>
          {defaultCard && <div className="text-sm text-slate-600">Exp. {defaultCard.expMonth}/{defaultCard.expYear}</div>}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-4 text-xl">Billing History</h2>
        <table className="table">
          <thead>
            <tr><th>Order Number</th><th>Amount</th><th>Date</th><th>Status</th><th>Payment Method</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><div className="font-medium">{o.orderNumber}</div><div className="max-w-xs truncate text-slate-600">{o.description}</div></td>
                <td>{money(o.amountCents)}</td>
                <td>{shortDate(o.createdAt)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>{o.paymentMethod ? `Ending in ${o.paymentMethod.last4}` : "—"}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={5} className="text-slate-500">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl">Saved Payment Methods</h2>
          {/* Adding cards requires a payment processor; see README "Payments". */}
          <button className="btn-outline" disabled title="Connect Stripe to enable">+ Add Payment Method</button>
        </div>
        <div className="space-y-3">
          {paymentMethods.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <div className="font-semibold">{p.brand} ending in {p.last4}</div>
                <div className="text-sm text-slate-600">Exp. {p.expMonth}/{p.expYear}</div>
              </div>
              {p.isDefault ? (
                <span className="rounded-full bg-cyan-50 dark:bg-cyan-500/10 px-3 py-1 text-xs text-cyan-800 dark:text-cyan-200">Default</span>
              ) : (
                <div className="flex gap-3">
                  <form action={setDefaultPaymentMethod}><input type="hidden" name="paymentMethodId" value={p.id} /><button className="btn-link">Make default</button></form>
                  <form action={removePaymentMethod}><input type="hidden" name="paymentMethodId" value={p.id} /><button className="text-sm text-red-600 dark:text-red-400 hover:underline">Remove</button></form>
                </div>
              )}
            </div>
          ))}
          {paymentMethods.length === 0 && <p className="text-sm text-slate-500">No saved payment methods.</p>}
        </div>
      </div>

      <div className="card flex items-center justify-between">
        <div>
          <h2 className="text-xl">Current Subscription</h2>
          <p className="mt-1 text-2xl text-brand-600">{subscription?.planName ?? "None"}</p>
        </div>
      </div>
    </>
  );
}

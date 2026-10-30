"use client";

import { useCallback, useState } from "react";
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import { StatusBadge } from "@/components/StatusBadge";
import { updateMailStatus } from "@/app/actions/company";
import type { LiveMailRow } from "@/lib/realtime-queries";

type Props = {
  companyId: string;
  userId: string;
  realtimeUrl: string;
  initialData: LiveMailRow[];
  sealedQuery: SealedLiveQuery<LiveMailRow>;
};

// A full page load resets this.
let signedOut = false;

export function LiveMail(props: Props) {
  const [client] = useState(() => createRealtimeClient({ url: props.realtimeUrl }));
  return (
    <RealtimeProvider client={client}>
      <MailTable {...props} />
    </RealtimeProvider>
  );
}

function MailTable({ companyId, userId, initialData, sealedQuery }: Props) {
  const [query] = useState(sealedQuery); // renewals go through refreshQuery
  const refreshQuery = useCallback(async () => {
    if (signedOut) throw new Error("Signed out");
    const res = await fetch(`/api/companies/${companyId}/mail/live`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.status === 401) {
      signedOut = true;
      window.location.reload();
      throw new Error("Signed out");
    }
    if (!res.ok) throw new Error(`Could not renew the mail feed (${res.status})`);
    return (await res.json()) as SealedLiveQuery<LiveMailRow>;
  }, [companyId, userId]);

  const { data, status, error } = useLiveQuery(query, { refreshQuery, initialData });
  const rows = data ?? initialData;

  return (
    <div className="card overflow-x-auto">
      <p className="mb-3 text-xs text-slate-500">
        {status === "live" ? "● Live — new mail appears automatically" : status === "error" ? `Live updates stopped: ${error?.message}` : "Connecting…"}
      </p>
      <table className="table">
        <thead><tr><th>ID</th><th>Item</th><th>Sender</th><th>Date</th><th>Status</th><th>Tracking</th><th /></tr></thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <td>{m.reference}</td>
              <td>{m.itemType}</td>
              <td>{m.sender ?? "—"}</td>
              <td>{formatDate(m.receivedAt)}</td>
              <td><StatusBadge status={m.status} /></td>
              <td>{m.tracking ?? ""}</td>
              <td className="whitespace-nowrap text-right">
                {(m.status === "RECEIVED" || m.status === "SCANNED") && (
                  <div className="flex justify-end gap-3">
                    <MailAction companyId={companyId} mailId={m.id} status="FORWARD_REQUESTED" label="Forward" />
                    <MailAction companyId={companyId} mailId={m.id} status="DISCARDED" label="Discard" />
                  </div>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={7} className="text-slate-500">No mail yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

// Prisma's timestamp(3) columns hold UTC without a zone; the live feed may send them as text.
function formatDate(value: Date | string) {
  const d = typeof value === "string" ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value.replace(" ", "T")}Z`) : value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function MailAction({ companyId, mailId, status, label }: { companyId: string; mailId: string; status: string; label: string }) {
  return (
    <form action={updateMailStatus}>
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="mailId" value={mailId} />
      <input type="hidden" name="status" value={status} />
      <button className="btn-link">{label}</button>
    </form>
  );
}

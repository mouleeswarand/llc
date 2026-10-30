import { humanize } from "@/lib/format";

const TONES: Record<string, string> = {
  GOOD_STANDING: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  PAID: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  FILED: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  FORWARDED: "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400",
  SCANNED: "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300",
  PROCESSING: "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300",
  SUBMITTED: "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300",
  RECEIVED: "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300",
  FORWARD_REQUESTED: "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300",
  UPCOMING: "bg-slate-100 text-slate-700",
  PENDING: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
  FAILED: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300",
  LATE: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300",
  DELINQUENT: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${TONES[status] ?? "bg-slate-100 text-slate-700"}`}>
      {humanize(status)}
    </span>
  );
}

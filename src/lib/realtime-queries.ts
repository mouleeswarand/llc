// Live query definitions shared by the app server and scripts. Keep secrets out: no "server-only" here.
import { rawSql } from "@neon/realtime/server";

export type LiveMailRow = {
  id: string;
  reference: string;
  itemType: string;
  sender: string | null;
  // Prisma returns a Date; the live feed may deliver the raw timestamp string.
  receivedAt: Date | string;
  status: string;
  tracking: string | null;
  scanUrl: string | null;
};

/** A company's mail, authorized in the query itself by joining on the owner. */
export function mailQuery(userId: string, companyId: string) {
  return rawSql<LiveMailRow>(
    `SELECT m."id", m."reference", m."itemType", m."sender", m."receivedAt", m."status", m."tracking", m."scanUrl"
     FROM "MailItem" m
     INNER JOIN "Company" c ON c."id" = m."companyId"
     WHERE c."ownerId" = $1 AND m."companyId" = $2
     ORDER BY m."receivedAt" DESC, m."id"
     LIMIT 200`,
    [userId, companyId],
  );
}

export function databaseName(url = process.env.DATABASE_URL) {
  try {
    return new URL(url!).pathname.slice(1) || "neondb";
  } catch {
    return "neondb";
  }
}

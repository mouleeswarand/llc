// Neon Function: marks annual reports LATE once their due date passes.
// POST /cron is called daily by the "daily-compliance" trigger in neon.ts.
// GET / is a health check that confirms the function can reach Postgres.
import { attachDatabasePool } from "@neon/functions";
import { parseTriggerDelivery } from "@neon/functions/triggers";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
attachDatabasePool(pool);

export async function markOverdueReports(db: Pick<Pool, "query">) {
  const { rowCount } = await db.query(
    `UPDATE "AnnualReport" SET "status" = 'LATE'
     WHERE "status" = 'UPCOMING' AND "dueDate" < now()`,
  );
  return rowCount ?? 0;
}

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "POST" && pathname === "/cron") {
      const parsed = await parseTriggerDelivery(request);
      if (!parsed.ok) {
        return new Response(parsed.error, { status: parsed.error === "invalid_body" ? 400 : 401 });
      }
      const markedLate = await markOverdueReports(pool);
      return Response.json({ ok: true, invocationId: parsed.invocation.invocationId, markedLate });
    }

    if (request.method === "GET" && pathname === "/") {
      const { rows } = await pool.query<{ ok: number }>("SELECT 1 AS ok");
      return Response.json({ ok: rows[0]?.ok === 1 });
    }

    return new Response("Not found", { status: 404 });
  },
};

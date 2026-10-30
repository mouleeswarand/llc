import { getSessionUser } from "@/lib/auth";
import { getRealtime } from "@/lib/realtime";
import { mailQuery } from "@/lib/realtime-queries";

// Renews the sealed mail query for the Mail page. The page sends the user id it was rendered for,
// so a different session in another tab is treated as signed out.
export async function POST(request: Request, { params }: { params: Promise<{ companyId: string }> }) {
  const user = await getSessionUser();
  const body = (await request.json().catch(() => ({}))) as { userId?: unknown };
  if (!user || body.userId !== user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { companyId } = await params;
  const sealedQuery = await getRealtime().seal({ query: mailQuery(user.id, companyId) });
  return Response.json(sealedQuery, { headers: { "Cache-Control": "no-store" } });
}

import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { documentsBucket } from "@/lib/storage";

// Redirects to a short-lived presigned URL after checking the document belongs to the user.
export async function GET(_request: Request, { params }: { params: Promise<{ documentId: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { documentId } = await params;
  const doc = await db.document.findFirst({
    where: { id: documentId, company: { ownerId: user.id } },
    select: { storageKey: true, url: true },
  });
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  const target = doc.storageKey ? await documentsBucket().url(doc.storageKey, { expiresIn: 300 }) : doc.url;
  if (!target) return Response.json({ error: "No file attached" }, { status: 404 });
  return Response.redirect(target, 302);
}

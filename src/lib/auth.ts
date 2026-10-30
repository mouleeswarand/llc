import "server-only";
import { notFound, redirect } from "next/navigation";
import { db } from "./db";
import { auth } from "./neon-auth";

export async function getSessionUser() {
  const { data: session } = await auth.getSession();
  return session?.user ?? null;
}

/** Ensures the app-side profile row exists for a Neon Auth user. */
export function syncUser(user: { id: string; email: string; name?: string | null }, phone?: string | null) {
  return db.user.upsert({
    where: { id: user.id },
    update: { email: user.email.toLowerCase() },
    create: { id: user.id, email: user.email.toLowerCase(), name: user.name || user.email, phone: phone || null },
  });
}

export async function getCurrentUser() {
  const sessionUser = await getSessionUser();
  return sessionUser ? syncUser(sessionUser) : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Loads a company owned by the signed-in user, or 404s. */
export async function requireCompany(companyId: string) {
  const user = await requireUser();
  const company = await db.company.findFirst({ where: { id: companyId, ownerId: user.id } });
  if (!company) notFound();
  return { user, company };
}

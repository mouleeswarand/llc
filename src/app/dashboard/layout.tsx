import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "./AppShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const companies = await db.company.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });
  return (
    <AppShell user={{ name: user.name, email: user.email }} companies={companies}>
      {children}
    </AppShell>
  );
}

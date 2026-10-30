import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user] = await Promise.all([searchParams, getSessionUser()]);
  if (user) redirect("/dashboard");
  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your companies.">
      <AuthForm mode="sign-in" next={next} />
    </AuthShell>
  );
}

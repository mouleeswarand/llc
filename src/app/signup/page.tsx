import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";
import { getSessionUser } from "@/lib/auth";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, user] = await Promise.all([searchParams, getSessionUser()]);
  if (user) redirect("/dashboard");
  return (
    <AuthShell
      title="Create your account"
      subtitle={<>Ready to form a company? <Link href="/start" className="btn-link">Start here</Link> instead — you&apos;ll create your account as part of it.</>}
    >
      <AuthForm mode="sign-up" next={next} />
    </AuthShell>
  );
}

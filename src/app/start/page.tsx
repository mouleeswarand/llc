import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSessionUser } from "@/lib/auth";
import { FormationWizard } from "./FormationWizard";

export default async function StartPage({ searchParams }: { searchParams: Promise<{ package?: string }> }) {
  const [{ package: pkg }, session] = await Promise.all([searchParams, getSessionUser()]);
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-surface">
        <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <FormationWizard initialPackage={pkg} isLoggedIn={!!session} aiEnabled={!!process.env.NEON_AI_GATEWAY_TOKEN} />
      </main>
    </div>
  );
}

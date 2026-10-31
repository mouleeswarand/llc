"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient, goTo, safeNext } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const signUp = mode === "sign-up";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    const password = String(form.get("password"));
    setError(null);

    if (signUp && password.length < 8) return setError("Use at least 8 characters for your password.");
    if (signUp && password !== String(form.get("confirm"))) return setError("The passwords don't match.");

    setPending(true);
    try {
      const { error } = signUp
        ? await authClient.signUp.email({ email, password, name: String(form.get("name")).trim() })
        : await authClient.signIn.email({ email, password });
      if (error) {
        setError(describe(error, mode));
        setPending(false);
        return;
      }
      goTo(safeNext(next));
    } catch {
      setError("Couldn't reach the sign-in service. Check your connection and try again.");
      setPending(false);
    }
  }

  // Google sign-in also creates the account on first use, so it serves both modes.
  async function continueWithGoogle() {
    setError(null);
    setPending(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${safeNext(next)}`,
      });
      if (error) {
        setError(error.message || "Couldn't start Google sign-in. Please try again.");
        setPending(false);
      }
      // On success the browser is redirected to Google.
    } catch {
      setError("Couldn't reach the sign-in service. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <>
    <div className="mt-6">
      <button type="button" onClick={continueWithGoogle} disabled={pending} className="btn-outline w-full">
        <GoogleLogo /> Continue with Google
      </button>
      <div className="mt-6 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" /> or with email <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate={false}>
      {signUp && (
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" required className="input" autoComplete="name" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required minLength={signUp ? 8 : undefined} className="input"
          autoComplete={signUp ? "new-password" : "current-password"} />
      </div>
      {signUp && (
        <div>
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input id="confirm" name="confirm" type="password" required className="input" autoComplete="new-password" />
        </div>
      )}
      {error && <p role="alert" className="rounded-md bg-red-50 dark:bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
      <button className="btn-primary w-full" disabled={pending}>
        {pending ? (signUp ? "Creating account…" : "Logging in…") : signUp ? "Create account" : "Log in"}
      </button>
      <p className="text-sm text-slate-600">
        {signUp ? (
          <>Already have an account? <Link href={withNext("/login", next)} className="btn-link">Log in</Link></>
        ) : (
          <>New here? <Link href={withNext("/signup", next)} className="btn-link">Create an account</Link></>
        )}
      </p>
    </form>
    </>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.1 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}

function withNext(path: string, next?: string) {
  return next ? `${path}?next=${encodeURIComponent(next)}` : path;
}

function describe(error: { status?: number; code?: string; message?: string }, mode: Mode) {
  const code = error.code ?? "";
  if (mode === "sign-in" && (error.status === 401 || code === "INVALID_EMAIL_OR_PASSWORD")) {
    return "Incorrect email or password.";
  }
  if (code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" || error.status === 422) {
    return "An account with this email already exists. Log in instead.";
  }
  if (code === "PASSWORD_TOO_SHORT") return "Use at least 8 characters for your password.";
  if (code === "INVALID_EMAIL") return "Enter a valid email address.";
  if (error.status === 429) return "Too many attempts. Wait a minute and try again.";
  return error.message || "Something went wrong. Please try again.";
}

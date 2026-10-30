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

  return (
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

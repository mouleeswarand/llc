"use client";

import { createAuthClient } from "@neon/auth/next";

// Browser auth client. Talks to the same-origin /api/auth proxy (src/app/api/auth).
export const authClient = createAuthClient();

/** After sign-in, sign-up or sign-out, leave with a full page load so every server component sees the new session. */
export function goTo(path: string) {
  window.location.assign(path);
}

export function safeNext(next: string | null | undefined) {
  return next && next.startsWith("/dashboard") ? next : "/dashboard";
}

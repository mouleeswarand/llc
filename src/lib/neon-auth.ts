import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

// Managed Better Auth. NEON_AUTH_BASE_URL comes from `neon env pull`;
// NEON_AUTH_COOKIE_SECRET is app config (32+ random characters).
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});

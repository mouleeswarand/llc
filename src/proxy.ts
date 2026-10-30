import { auth } from "@/lib/neon-auth";

// Everything except the marketing page, the formation wizard, login and sign-up requires a session.
export default auth.middleware({
  loginUrl: "/login",
  publicRoutes: ["/", "/start", "/login", "/signup"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

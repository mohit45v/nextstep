import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Only the edge-safe config here — importing `@/lib/auth` would pull Prisma
// into the Edge runtime and fail to build.
const { auth } = NextAuth(authConfig);

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`. This runs
 * before every matched request and defers the allow/deny decision to the
 * `authorized` callback in `auth.config.ts`.
 */
export default auth;

export const config = {
  /**
   * Every page request except Next internals, static assets and `/api/*`.
   * API routes guard themselves with `requireApiUser()` from `@/lib/session`
   * so they can return 401 JSON instead of an HTML redirect.
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

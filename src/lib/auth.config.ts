import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import {
  ALLOWED_EMAIL_DOMAIN,
  DEFAULT_LOGIN_REDIRECT,
  PUBLIC_ROUTES,
} from "./constants";

/**
 * Edge-safe half of the Auth.js config.
 *
 * `middleware.ts` runs on the Edge runtime, where Prisma cannot run. So the
 * adapter lives in `auth.ts` (Node only) and everything the middleware needs
 * lives here. See https://authjs.dev/guides/edge-compatibility
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    // JWT rather than database sessions, so middleware can read the session on
    // the Edge without a DB round-trip on every request.
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    Google({
      authorization: {
        params: {
          // Restricts Google's own account chooser to Terna Workspace
          // accounts. A hint only — the signIn callback below is the real gate.
          hd: ALLOWED_EMAIL_DOMAIN,
          prompt: "select_account",
        },
      },
    }),
  ],

  callbacks: {
    /**
     * The actual domain gate. Returning false aborts the sign-in and Auth.js
     * redirects to `pages.error` with `?error=AccessDenied`.
     */
    signIn({ profile }) {
      if (!profile) return false;

      // Google returns `hd` (hosted domain) only for Workspace accounts, and
      // `email_verified` for all. Both must hold, plus a literal suffix check
      // so a personal account that somehow set a matching `hd` still fails.
      const hostedDomain = (profile as { hd?: string }).hd;
      const emailVerified = profile.email_verified === true;
      const email = profile.email?.toLowerCase() ?? "";

      return (
        emailVerified &&
        hostedDomain === ALLOWED_EMAIL_DOMAIN &&
        email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)
      );
    },

    /**
     * Copy the DB profile onto the token on first sign-in, so later requests
     * (including Edge middleware) can read role/credits without a DB query.
     */
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.credits = user.credits;
        token.branch = user.branch ?? null;
      }

      // Lets a client call `updateSession({ credits })` after a mutation.
      if (trigger === "update" && session) {
        if (typeof session.credits === "number") token.credits = session.credits;
        if (typeof session.branch === "string") token.branch = session.branch;
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.credits = token.credits;
        session.user.branch = token.branch;
      }
      return session;
    },

    /** Used by `middleware.ts` to decide whether a request may continue. */
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = request.nextUrl;

      // Already signed in and hitting /login → bounce to the dashboard.
      if (pathname === "/login") {
        if (isLoggedIn) {
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.nextUrl));
        }
        return true;
      }

      // The landing page and the attribution page stay public — PUBLIC_ROUTES is
      // the single list, so adding one there is enough.
      if ((PUBLIC_ROUTES as readonly string[]).includes(pathname)) return true;

      // Everything else requires a session; Auth.js redirects to `pages.signIn`
      // with a callbackUrl when this returns false.
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;

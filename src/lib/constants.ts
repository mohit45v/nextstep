/**
 * The only email domain allowed to sign in to NextStep.
 *
 * This is enforced in three places, all of which must agree:
 *  1. The Google `hd` authorization param — Google's account chooser only
 *     offers Terna accounts. This is a UX hint and can be bypassed by a
 *     crafted URL, so it is never the only check.
 *  2. The `signIn` callback in `src/lib/auth.config.ts` — rejects any profile
 *     whose verified Workspace domain is not Terna. This is the real gate.
 *  3. A DB-level `@unique` email, so one Google account maps to one user.
 */
export const ALLOWED_EMAIL_DOMAIN = "ternaengg.ac.in";

/** Routes reachable without a session. Everything else requires sign-in. */
export const PUBLIC_ROUTES = ["/", "/login", "/auth/error"] as const;

/** Where a user lands after a successful sign-in. */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

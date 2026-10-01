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

/**
 * Routes reachable without a session. Everything else requires sign-in.
 *
 * `/attributions` is public because it has to be: the open licences behind the
 * question bank require attribution, and attribution behind a login is not
 * attribution.
 */
export const PUBLIC_ROUTES = ["/", "/login", "/auth/error", "/attributions"] as const;

/** Where a user lands after a successful sign-in. */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/* ---------------------------------------------------------------------------
   Student profile
   --------------------------------------------------------------------------- */

/**
 * Branches offered at Terna Engineering College, as they should appear on a
 * profile. Stored as the display string rather than an enum: the list changes
 * when the college adds a programme, and a migration per intake is not worth
 * the type safety here.
 */
export const BRANCHES = [
  "Computer Engineering",
  "Computer Science & Engineering (Data Science)",
  "Artificial Intelligence & Data Science",
  "Information Technology",
  "Electronics & Telecommunication Engineering",
  "Electronics & Computer Science",
  "Mechanical Engineering",
  "Civil Engineering",
] as const;

export type Branch = (typeof BRANCHES)[number];

/**
 * Roll number format.
 *
 * ASSUMPTION, worth confirming against your own ID card before the first real
 * intake: uppercase letters and digits only, 6–12 characters, containing at
 * least two digits — e.g. `TU3F2122001`, `21CE1042`. It deliberately rejects
 * spaces, hyphens and lowercase so one student cannot register two spellings of
 * the same roll number past the `@unique` constraint.
 *
 * Tighten this to the exact institutional pattern when you have it; the whole
 * check lives in this one constant.
 */
export const ROLL_NUMBER_PATTERN = /^(?=(?:[^0-9]*[0-9]){2,})[A-Z0-9]{6,12}$/;

/**
 * How far ahead a graduation year may be set. A four-year degree plus a year of
 * slack covers a first-year student who joined this month; anything beyond that
 * is a typo.
 */
export const MAX_GRAD_YEARS_AHEAD = 6;

/* ---------------------------------------------------------------------------
   Marking
   --------------------------------------------------------------------------- */

/**
 * Campus aptitude papers mark negatively, and a student who has only ever
 * practised without a penalty guesses far too freely in the real test. Both
 * figures live here because the server is the only thing allowed to apply them.
 */
export const MARKS_CORRECT = 4;
export const MARKS_INCORRECT = -1;

/** Timezone and locale every stored timestamp is rendered in. */
export const DISPLAY_TIMEZONE = "Asia/Kolkata";
export const DISPLAY_LOCALE = "en-IN";

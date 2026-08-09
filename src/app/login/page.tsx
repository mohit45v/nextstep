import type { Metadata } from "next";
import { signIn } from "@/lib/auth";
import { ALLOWED_EMAIL_DOMAIN, DEFAULT_LOGIN_REDIRECT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign in",
  description: `Sign in with your @${ALLOWED_EMAIL_DOMAIN} account.`,
};

/** Auth.js error codes → messages a student can act on. */
const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: `That account isn't a Terna one. Sign in with your @${ALLOWED_EMAIL_DOMAIN} college email.`,
  OAuthAccountNotLinked:
    "This email is already registered through a different sign-in method.",
  // Auth.js also reports adapter/database failures as "Configuration", so the
  // database is worth naming here — a placeholder DATABASE_URL is by far the
  // most common cause during setup.
  Configuration:
    "Sign-in is misconfigured on the server. Check DATABASE_URL points at a real database and that you have run `npm run db:migrate`, then check AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET and AUTH_SECRET. The server terminal has the details.",
  Verification: "That sign-in link has expired. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const message = error
    ? (ERROR_MESSAGES[error] ?? "Something went wrong signing you in. Try again.")
    : null;

  async function signInWithGoogle() {
    "use server";
    await signIn("google", {
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4 py-12 text-[#F8FAFC]">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[#262F40] bg-[#131927] p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#2563EB] text-2xl font-bold text-white">
              N
            </div>
            <h1 className="text-2xl font-bold">
              NextStep <span className="text-[#60A5FA]">Portal</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Placement &amp; Skill Acceleration Platform
            </p>
          </div>

          {message && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300"
            >
              {message}
            </div>
          )}

          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-white px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#131927]"
            >
              <GoogleMark />
              Continue with Terna Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
            Only <span className="font-mono text-slate-400">@{ALLOWED_EMAIL_DOMAIN}</span>{" "}
            accounts can sign in. Use the Google account your college issued you
            — no separate password needed.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Trouble signing in? Contact your TPO coordinator.
        </p>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5a11 11 0 0 0-9.82 6.05l3.66 2.84c.87-2.6 3.3-4.64 6.16-4.64Z"
      />
    </svg>
  );
}

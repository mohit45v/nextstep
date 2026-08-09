import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ALLOWED_EMAIL_DOMAIN, DEFAULT_LOGIN_REDIRECT } from "@/lib/constants";

/**
 * Public landing page. Signed-in students skip it entirely and go straight to
 * the dashboard.
 */
export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect(DEFAULT_LOGIN_REDIRECT);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F17] px-4 py-16 text-[#F8FAFC]">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2563EB] text-3xl font-bold text-white">
          N
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          NextStep
        </h1>
        <p className="mt-3 text-lg text-[#60A5FA]">
          AI Placement &amp; Career Development Engine
        </p>

        <p className="mx-auto mt-6 max-w-xl text-slate-400">
          Aptitude practice, DSA drilling, company test series, skill-gap
          analysis and ATS resume tooling — built for Terna Engineering College.
        </p>

        <Link
          href="/login"
          className="mt-10 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-8 py-3.5 font-semibold text-white transition hover:bg-[#1D4ED8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F17]"
        >
          Sign in with your Terna account →
        </Link>

        <p className="mt-4 text-xs text-slate-500">
          Restricted to <span className="font-mono">@{ALLOWED_EMAIL_DOMAIN}</span> accounts
        </p>
      </div>
    </main>
  );
}

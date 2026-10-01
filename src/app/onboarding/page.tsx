import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getProfileUser, isProfileComplete } from "@/lib/session";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Logo } from "@/components/ui/Logo";
import { completeOnboarding } from "./actions";

export const metadata: Metadata = {
  title: "Set up your profile",
  description: "Tell NextStep your branch, graduation year and roll number.",
};

/**
 * Deliberately outside the `(app)` route group.
 *
 * `(app)/layout.tsx` sends anyone with an incomplete profile here, so if this
 * page lived inside that group it would redirect to itself forever. It renders
 * its own minimal chrome instead of the app shell — there is nothing to navigate
 * to until the profile exists.
 */
export default async function OnboardingPage() {
  const user = await getProfileUser();
  if (!user) redirect("/login");

  // Finished already: nothing to do here. /profile is where edits happen.
  if (isProfileComplete(user)) redirect("/dashboard");

  const firstName = (user.name ?? "").split(" ")[0];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[32rem]">
        <Logo />

        <div className="mt-6 rounded-card border border-line bg-surface p-7 sm:p-8">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
            <GraduationCap className="h-5 w-5" />
          </span>

          <h1 className="mt-5 text-2xl font-bold">
            {firstName ? `Welcome, ${firstName}` : "Welcome"}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
            Three details before you start. They decide which DSA sheet you get,
            how you appear on branch leaderboards, and what your TPO sees.
          </p>

          <p className="mt-5 rounded-input bg-inset px-4 py-3 text-sm text-ink-muted">
            Signed in as{" "}
            <span className="font-medium text-ink">{user.email}</span>
          </p>

          <div className="mt-6">
            <ProfileForm
              action={completeOnboarding}
              submitLabel="Finish setup"
              pendingLabel="Saving…"
              footnote={
                <p className="border-t border-line pt-4 text-xs leading-relaxed text-ink-subtle">
                  You can change any of this later from your profile. Your roll
                  number has to be unique — it is how a TPO matches your practice
                  record to the college register.
                </p>
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

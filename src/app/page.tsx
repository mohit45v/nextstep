import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Binary,
  Building2,
  Calculator,
  CircleCheck,
  LogIn,
  Timer,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { ALLOWED_EMAIL_DOMAIN, DEFAULT_LOGIN_REDIRECT } from "@/lib/constants";
import { buttonStyles, Container } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroPreview } from "@/components/landing/HeroPreview";

/**
 * Public landing page. Signed-in students skip it entirely.
 *
 * Deliberately contains no learner counts, testimonials or placement
 * statistics — there is no data behind any of those yet, and inventing them is
 * exactly what this rebuild removed from the rest of the app.
 */
export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect(DEFAULT_LOGIN_REDIRECT);

  return (
    <>
      <LandingHeader />

      <main className="flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="pt-14 pb-20 sm:pt-20 sm:pb-28">
          <Container>
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Built for Terna Engineering College
                </span>

                <h1 className="mt-6 text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-[3.5rem]">
                  Placement prep,
                  <br />
                  <span className="text-accent">all in one place.</span>
                </h1>

                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
                  Practise aptitude, drill DSA and sit timed company mock tests —
                  scored properly, with worked explanations for every question.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/login" className={buttonStyles({ size: "lg" })}>
                    Sign in with Terna
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#features" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                    See what&rsquo;s inside
                  </a>
                </div>

                <p className="mt-4 text-sm text-ink-subtle">
                  Uses your college Google account — no new password to remember.
                </p>

                <ul className="mt-10 space-y-3">
                  {[
                    "Timed mock exams with +4 / −1 marking, scored on the server.",
                    "Every question has a worked explanation and a shortcut tip.",
                    "Curated DSA sheets plus live problems from the Codeforces API.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <CircleCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent" />
                      <span className="text-[15px] text-ink-muted">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="lg:pl-4">
                <HeroPreview />
              </div>
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Features                                                         */}
        {/* ---------------------------------------------------------------- */}
        <section id="features" className="scroll-mt-20 border-y border-line bg-surface py-20 sm:py-24">
          <Container>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">What you get</h2>
              <p className="mt-4 text-lg text-ink-muted">
                Three things, done properly, instead of a dashboard full of
                buttons that go nowhere.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <FeatureCard
                icon={<Calculator className="h-5 w-5" />}
                title="Aptitude practice"
                body="Quantitative, logical reasoning and verbal topics. Work through questions at your own pace, with the method laid out after every answer."
              />
              <FeatureCard
                icon={<Timer className="h-5 w-5" />}
                title="Company mock tests"
                body="Sit a timed paper modelled on real campus tests — TCS NQT, Infosys, Accenture — then review each question against the correct method."
              />
              <FeatureCard
                icon={<Binary className="h-5 w-5" />}
                title="DSA problem hub"
                body="Branch-wise curated problem sheets with direct LeetCode links, plus a live feed pulled from the Codeforces problemset API."
              />
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* How it works                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section id="how" className="scroll-mt-20 py-20 sm:py-24">
          <Container>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
              <p className="mt-4 text-lg text-ink-muted">
                Three steps, about a minute.
              </p>
            </div>

            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              <Step
                n={1}
                icon={<LogIn className="h-4 w-4" />}
                title="Sign in with college Google"
                body={`Only @${ALLOWED_EMAIL_DOMAIN} accounts are accepted. Nothing to register for, no password to set.`}
              />
              <Step
                n={2}
                icon={<Calculator className="h-4 w-4" />}
                title="Pick a topic or a test"
                body="Practise one topic at a time when you're learning, or sit a full timed paper when you want a realistic run."
              />
              <Step
                n={3}
                icon={<Building2 className="h-4 w-4" />}
                title="Review every question"
                body="See what you got wrong and why, with the working shown step by step — not just a score at the end."
              />
            </ol>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Closing CTA                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="pb-20 sm:pb-28">
          <Container>
            <div className="rounded-[1.25rem] border border-accent-line bg-accent-soft px-6 py-14 text-center sm:px-12">
              <h2 className="text-3xl font-bold sm:text-4xl">Ready to start?</h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-ink-muted">
                Sign in with your college account and pick your first topic.
              </p>
              <Link
                href="/login"
                className={buttonStyles({ size: "lg", className: "mt-8" })}
              >
                Sign in with Terna
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </section>
      </main>

      <footer className="border-t border-line bg-surface py-10">
        <Container className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <Logo />
          <p className="text-center text-sm text-ink-subtle sm:text-right">
            A student project for Terna Engineering College.
            <br className="hidden sm:block" /> Not an official college service.
          </p>
        </Container>
      </footer>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-card border border-line bg-canvas p-6">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent">
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="relative">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-bold text-white">
          {n}
        </span>
        <span className="text-accent">{icon}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{body}</p>
    </li>
  );
}

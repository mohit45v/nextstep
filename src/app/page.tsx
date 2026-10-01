import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Binary,
  Building2,
  Calculator,
  CircleCheck,
  LogIn,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getDemoQuestions } from "@/lib/aptitude";
import { ALLOWED_EMAIL_DOMAIN, DEFAULT_LOGIN_REDIRECT } from "@/lib/constants";
import { buttonStyles, Container } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { Reveal } from "@/components/landing/Reveal";

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

  // Read after the redirect, so a signed-in visitor never pays for the query.
  const demoQuestions = await getDemoQuestions();

  return (
    <>
      <LandingHeader />

      <main className="flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28">
          {/* Decorative backdrop */}
          <div aria-hidden="true" className="dot-grid absolute inset-0 -z-10" />
          <div
            aria-hidden="true"
            className="absolute -top-32 -right-32 -z-10 h-96 w-96 rounded-full bg-accent-soft blur-3xl"
          />

          <Container>
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
              <div>
                <Reveal>
                  <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-ink-muted backdrop-blur">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                    </span>
                    Built for Terna Engineering College
                  </span>
                </Reveal>

                <Reveal delay={60}>
                  <h1 className="mt-6 text-4xl leading-[1.06] font-extrabold sm:text-5xl lg:text-[3.6rem]">
                    Placement prep,
                    <br />
                    <span className="bg-gradient-to-r from-accent to-[#ff9345] bg-clip-text text-transparent">
                      all in one place.
                    </span>
                  </h1>
                </Reveal>

                <Reveal delay={120}>
                  <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
                    Practise aptitude, drill DSA and sit timed company mock
                    tests — scored properly, with worked explanations for every
                    question.
                  </p>
                </Reveal>

                <Reveal delay={180}>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                      href="/login"
                      className={buttonStyles({
                        size: "lg",
                        className:
                          "group shadow-lg shadow-accent/25 transition-transform hover:-translate-y-0.5",
                      })}
                    >
                      Sign in with Terna
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <a
                      href="#features"
                      className={buttonStyles({
                        variant: "secondary",
                        size: "lg",
                        className: "transition-transform hover:-translate-y-0.5",
                      })}
                    >
                      See what&rsquo;s inside
                    </a>
                  </div>
                </Reveal>

                <Reveal delay={240}>
                  <p className="mt-4 flex items-center gap-1.5 text-sm text-ink-subtle">
                    <ShieldCheck className="h-4 w-4" />
                    Uses your college Google account — no new password.
                  </p>
                </Reveal>

                <ul className="mt-10 space-y-3">
                  {[
                    "Timed mock exams with +4 / −1 marking, scored on the server.",
                    "Every question has a worked explanation and a shortcut tip.",
                    "Curated DSA sheets plus live problems from the Codeforces API.",
                  ].map((line, i) => (
                    <li key={line}>
                      <Reveal delay={300 + i * 70}>
                        <span className="flex items-start gap-3">
                        <CircleCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent" />
                        <span className="text-[15px] text-ink-muted">{line}</span>
                      </span>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>

              <Reveal delay={200} className="lg:pl-4">
                <div className="motion-safe:animate-float-slow">
                  <HeroPreview questions={demoQuestions} />
                </div>
              </Reveal>
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Features                                                         */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="features"
          className="scroll-mt-20 border-y border-line bg-surface py-20 sm:py-24"
        >
          <Container>
            <Reveal>
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold sm:text-4xl">What you get</h2>
                <p className="mt-4 text-lg text-ink-muted">
                  Three things, done properly, instead of a dashboard full of
                  buttons that go nowhere.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: <Calculator className="h-5 w-5" />,
                  title: "Aptitude practice",
                  body: "Quantitative, logical reasoning and verbal topics. Work through questions at your own pace, with the method laid out after every answer.",
                },
                {
                  icon: <Timer className="h-5 w-5" />,
                  title: "Company mock tests",
                  body: "Sit a timed paper modelled on real campus tests — TCS NQT, Infosys, Accenture — then review each question against the correct method.",
                },
                {
                  icon: <Binary className="h-5 w-5" />,
                  title: "DSA problem hub",
                  body: "Branch-wise curated problem sheets with direct LeetCode links, plus a live feed pulled from the Codeforces problemset API.",
                },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 90}>
                  <div className="group h-full rounded-card border border-line bg-canvas p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-line hover:shadow-[0_12px_32px_-12px_rgba(255,101,0,0.25)]">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent transition-transform duration-300 group-hover:scale-110">
                      {f.icon}
                    </span>
                    <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">
                      {f.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* How it works                                                     */}
        {/* ---------------------------------------------------------------- */}
        <section id="how" className="scroll-mt-20 py-20 sm:py-24">
          <Container>
            <Reveal>
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
                <p className="mt-4 text-lg text-ink-muted">
                  Three steps, about a minute.
                </p>
              </div>
            </Reveal>

            <ol className="relative mt-12 grid gap-8 md:grid-cols-3">
              {/* Connecting rule behind the step numbers */}
              <div
                aria-hidden="true"
                className="absolute top-[18px] right-0 left-0 hidden h-px bg-gradient-to-r from-line via-line-strong to-line md:block"
              />

              {[
                {
                  icon: <LogIn className="h-4 w-4" />,
                  title: "Sign in with college Google",
                  body: `Only @${ALLOWED_EMAIL_DOMAIN} accounts are accepted. Nothing to register for, no password to set.`,
                },
                {
                  icon: <Calculator className="h-4 w-4" />,
                  title: "Pick a topic or a test",
                  body: "Practise one topic at a time when you're learning, or sit a full timed paper when you want a realistic run.",
                },
                {
                  icon: <Building2 className="h-4 w-4" />,
                  title: "Review every question",
                  body: "See what you got wrong and why, with the working shown step by step — not just a score at the end.",
                },
              ].map((s, i) => (
                <li key={s.title} className="relative">
                  <Reveal delay={i * 110}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-bold text-white ring-4 ring-canvas">
                        {i + 1}
                      </span>
                      <span className="text-accent">{s.icon}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                      {s.body}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Closing CTA                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="pb-20 sm:pb-28">
          <Container>
            <Reveal>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-accent-line bg-accent-soft px-6 py-16 text-center sm:px-12">
                <div
                  aria-hidden="true"
                  className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
                />

                <div className="relative">
                  <h2 className="text-3xl font-bold sm:text-4xl">Ready to start?</h2>
                  <p className="mx-auto mt-4 max-w-lg text-lg text-ink-muted">
                    Sign in with your college account and pick your first topic.
                  </p>
                  <Link
                    href="/login"
                    className={buttonStyles({
                      size: "lg",
                      className:
                        "group mt-8 shadow-lg shadow-accent/25 transition-transform hover:-translate-y-0.5",
                    })}
                  >
                    Sign in with Terna
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </section>
      </main>

      <footer className="border-t border-line bg-surface py-10">
        <Container className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <Logo />
          <div className="text-center text-sm text-ink-subtle sm:text-right">
            <p>
              A student project for Terna Engineering College.
              <br className="hidden sm:block" /> Not an official college service.
            </p>
            {/* The open licences behind the question bank require attribution, and
                attribution nobody can find is not attribution. */}
            <Link
              href="/attributions"
              className="mt-2 inline-block font-medium text-ink-muted hover:text-accent hover:underline"
            >
              Question sources &amp; licences
            </Link>
          </div>
        </Container>
      </footer>
    </>
  );
}

import Link from "next/link";
import { Container, buttonStyles } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";

/**
 * Shown for an unknown URL, and for every `notFound()` the app calls — an exam
 * pack that does not exist, or an attempt belonging to somebody else.
 *
 * It deliberately does not distinguish those cases: "this attempt is not yours"
 * would confirm that the id exists, which is not something a stranger needs to
 * learn from a 404 page.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Container className="max-w-md text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-8 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          That link doesn&rsquo;t lead anywhere. It may have been removed, or it
          may belong to someone else&rsquo;s account.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link href="/dashboard" className={buttonStyles()}>
            Go to dashboard
          </Link>
          <Link href="/" className={buttonStyles({ variant: "secondary" })}>
            Home
          </Link>
        </div>
      </Container>
    </main>
  );
}

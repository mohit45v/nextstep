"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button, Container, buttonStyles } from "@/components/ui";

/**
 * The app's error boundary.
 *
 * Next.js passes a `digest` rather than the error itself in production, on
 * purpose: a stack trace from the server can name internal paths and query
 * shapes. The digest is enough to find the matching line in the server log,
 * which is what the "reference" below is for.
 *
 * `reset()` re-renders the segment, which is worth offering — most failures here
 * are a dropped database connection, and the second attempt usually works.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The browser console is the only place a developer sees this in dev; in
    // production the server has already logged it under the same digest.
    console.error("Page error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <Container className="max-w-md text-center">
        <span className="inline-grid h-12 w-12 place-items-center rounded-xl bg-danger-soft text-danger">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
          This page couldn&rsquo;t load. It is usually a dropped connection to the
          database — trying again often works.
        </p>

        <div className="mt-7 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link href="/dashboard" className={buttonStyles({ variant: "secondary" })}>
            Go to dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-ink-subtle">
            Reference <span className="font-mono">{error.digest}</span> — quote this
            if you report it.
          </p>
        )}
      </Container>
    </main>
  );
}

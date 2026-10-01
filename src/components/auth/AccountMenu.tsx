import Link from "next/link";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui";

/**
 * Server component: the sign-out server action lives here, so the client-side
 * AppShell never needs to import auth code.
 *
 * Sign-out is a POST form rather than a link — as a GET, a page prefetch or an
 * <img> tag pointing at the URL could silently log the user out.
 *
 * Every value here is read from the database by the layout. The credits figure
 * in particular used to be a hardcoded 250 in the old navbar; it is now the real
 * column, so it moves when something actually spends a credit.
 */
export function AccountMenu({
  name,
  email,
  branch,
  gradYear,
  credits,
}: {
  name: string;
  email: string | null;
  branch?: string | null;
  gradYear?: number | null;
  credits?: number;
}) {
  const initial = (name || email || "?").charAt(0).toUpperCase();

  // "Computer Engineering · 2029" under the name, falling back to the email when
  // the profile has not been filled in (which only happens on /onboarding).
  const subtitle =
    [branch, gradYear ? `’${String(gradYear).slice(-2)}` : null]
      .filter(Boolean)
      .join(" · ") || email;

  return (
    <div className="flex items-center gap-3">
      {typeof credits === "number" && (
        <span
          title="AI credits"
          className="hidden items-center gap-1.5 rounded-full border border-accent-line bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent sm:inline-flex"
        >
          {credits} credits
        </span>
      )}

      <Link
        href="/profile"
        className="hidden items-center gap-2.5 rounded-full px-1.5 py-1 transition-colors hover:bg-inset sm:flex"
      >
        <span
          aria-hidden="true"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-accent"
        >
          {initial}
        </span>
        <span className="min-w-0">
          <span className="block max-w-[14rem] truncate text-sm font-medium text-ink">
            {name}
          </span>
          {subtitle && (
            <span className="block max-w-[14rem] truncate text-xs text-ink-subtle">
              {subtitle}
            </span>
          )}
        </span>
      </Link>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <Button type="submit" variant="secondary" size="sm">
          Sign out
        </Button>
      </form>
    </div>
  );
}

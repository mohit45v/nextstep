import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui";

/**
 * Server component: the sign-out server action lives here, so the client-side
 * AppShell never needs to import auth code.
 *
 * Sign-out is a POST form rather than a link — as a GET, a page prefetch or an
 * <img> tag pointing at the URL could silently log the user out.
 */
export function AccountMenu({
  name,
  email,
}: {
  name: string;
  email: string | null;
}) {
  const initial = (name || email || "?").charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="hidden items-center gap-2.5 sm:flex">
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
          {email && (
            <span className="block max-w-[14rem] truncate text-xs text-ink-subtle">
              {email}
            </span>
          )}
        </span>
      </div>

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

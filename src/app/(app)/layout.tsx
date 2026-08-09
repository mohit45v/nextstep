import { requireUser } from "@/lib/session";
import { AppShell } from "@/components/layout/AppShell";
import { SignOutButton } from "@/components/auth/SignOutButton";

/**
 * Layout for every signed-in route. `requireUser()` is the server-side gate —
 * middleware already redirects anonymous visitors, but this makes the guarantee
 * hold even if the matcher is ever misconfigured.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <AppShell
      accountSlot={
        <div className="flex items-center gap-3">
          <span
            className="hidden text-xs text-slate-400 md:inline"
            title={user.email ?? undefined}
          >
            {user.name ?? user.email}
          </span>
          <SignOutButton />
        </div>
      }
    >
      {children}
    </AppShell>
  );
}

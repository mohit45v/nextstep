import { requireUser } from "@/lib/session";
import { AppShell } from "@/components/layout/AppShell";
import { AccountMenu } from "@/components/auth/AccountMenu";

/**
 * Layout for every signed-in route. `requireUser()` is the server-side gate —
 * proxy.ts already redirects anonymous visitors, but this makes the guarantee
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
        <AccountMenu
          name={user.name ?? user.email ?? "Student"}
          email={user.email ?? null}
        />
      }
    >
      {children}
    </AppShell>
  );
}

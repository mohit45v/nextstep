import { requireProfileUser } from "@/lib/session";
import { AppShell } from "@/components/layout/AppShell";
import { AccountMenu } from "@/components/auth/AccountMenu";

/**
 * Layout for every signed-in route.
 *
 * `requireProfileUser()` is two gates in one: no session sends the visitor to
 * /login (proxy.ts does this too, but this makes the guarantee hold even if the
 * matcher is misconfigured), and an unfinished profile sends them to
 * /onboarding. Because every page in this group renders inside this layout, a
 * new user cannot reach any of them before onboarding — including by typing a
 * URL directly.
 *
 * /onboarding itself sits outside this group, or it would redirect to itself.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireProfileUser();

  return (
    <AppShell
      isAdmin={user.role === "ADMIN"}
      accountSlot={
        <AccountMenu
          name={user.name ?? user.email}
          email={user.email}
          branch={user.branch}
          gradYear={user.gradYear}
          credits={user.credits}
        />
      }
    >
      {children}
    </AppShell>
  );
}

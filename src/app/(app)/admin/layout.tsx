import { requireRole } from "@/lib/session";

/**
 * Everything under /admin requires the ADMIN role.
 *
 * The check is in the layout, so it covers every current and future admin page
 * without each one having to remember. `requireRole` redirects to /dashboard
 * rather than showing a 403 — a student who finds the URL should simply land
 * somewhere useful.
 *
 * The role comes from the JWT, which is minted at sign-in: promoting someone to
 * ADMIN in the database takes effect after they sign out and back in. That is the
 * trade for not hitting the database on every request in the proxy.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("ADMIN");
  return children;
}

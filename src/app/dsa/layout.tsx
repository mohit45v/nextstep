import { requireUser } from "@/lib/session";

/**
 * /dsa sits outside the `(app)` group because it ships its own navbar and
 * drawer (the drawer drives branch filtering). Nesting it under AppShell would
 * render two navbars and two drawers. It still needs the same auth gate.
 */
export default async function DsaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}

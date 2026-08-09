import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { Role } from "@/generated/prisma/client";

/**
 * For server components and server actions: returns the signed-in user or
 * sends the visitor to /login. Never returns null, so callers can use the
 * result directly without a null check.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** Same, but also enforces a role. Sends unauthorised users to /dashboard. */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

/**
 * For route handlers under /api. Returns the user, or a 401 Response to return
 * as-is:
 *
 *   const result = await requireApiUser();
 *   if (result instanceof Response) return result;
 */
export async function requireApiUser() {
  const session = await auth();
  if (!session?.user) {
    return Response.json(
      { error: "Unauthorized", message: "Sign in with your Terna account." },
      { status: 401 },
    );
  }
  return session.user;
}

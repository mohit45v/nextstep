import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { prisma } from "./prisma";
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

/* ---------------------------------------------------------------------------
   Profile
   --------------------------------------------------------------------------- */

/**
 * The profile fields every signed-in screen needs. Read from the database
 * rather than the JWT: the token is minted at sign-in and keeps whatever
 * branch/credits were true then, so a student who just finished onboarding
 * would see stale values until they signed out and back in.
 */
export type ProfileUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: Role;
  branch: string | null;
  gradYear: number | null;
  rollNumber: string | null;
  credits: number;
};

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  branch: true,
  gradYear: true,
  rollNumber: true,
  credits: true,
} as const;

/**
 * The signed-in user's database row, or null if there is no session.
 *
 * Wrapped in React's `cache` so a layout, a page and a component in the same
 * render share one query instead of issuing three.
 */
export const getProfileUser = cache(async (): Promise<ProfileUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: PROFILE_SELECT,
  });
});

/** Onboarding is done when all three fields a student must supply are set. */
export function isProfileComplete(
  user: Pick<ProfileUser, "branch" | "gradYear" | "rollNumber"> | null,
): boolean {
  return Boolean(user?.branch && user.gradYear && user.rollNumber);
}

/**
 * For screens that need a finished profile: returns the row, or sends the
 * student to /onboarding. Use this instead of `requireUser()` anywhere that
 * reads branch, graduation year or roll number.
 */
export async function requireProfileUser(): Promise<ProfileUser> {
  const user = await getProfileUser();
  // No row for a live session means the user was deleted mid-session; the
  // session cookie is worthless, so start again at /login.
  if (!user) redirect("/login");
  if (!isProfileComplete(user)) redirect("/onboarding");
  return user;
}

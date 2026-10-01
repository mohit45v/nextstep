"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfileUser } from "@/lib/session";
import { saveProfile } from "@/lib/profile";
import type { ProfileFormState } from "@/lib/validation/profile";

/**
 * Edit-in-place version of the onboarding action: same validation, same unique
 * roll-number handling, but it stays on /profile and reports success rather
 * than redirecting.
 */
export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await getProfileUser();
  if (!user) redirect("/login");

  const failure = await saveProfile(user.id, formData);
  if (failure) return failure;

  // Branch appears in the shell on every protected page, so revalidate the
  // layout, not just this route.
  revalidatePath("/", "layout");
  return { success: true };
}

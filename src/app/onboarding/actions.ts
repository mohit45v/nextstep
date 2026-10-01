"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfileUser } from "@/lib/session";
import { saveProfile } from "@/lib/profile";
import type { ProfileFormState } from "@/lib/validation/profile";

/**
 * Server action behind the onboarding form.
 *
 * It takes a `FormData`, not a typed object: that is what a plain HTML form
 * posts, which is why the form keeps working with JavaScript disabled.
 */
export async function completeOnboarding(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await getProfileUser();
  if (!user) redirect("/login");

  const failure = await saveProfile(user.id, formData);
  if (failure) return failure;

  // The app layout reads branch/credits on every protected page, so the whole
  // layout tree is stale once the profile changes — not just this route.
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

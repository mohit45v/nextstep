import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  parseProfileForm,
  type ProfileFormState,
} from "@/lib/validation/profile";

/**
 * Validates a profile form and writes it to the signed-in user's row.
 *
 * Shared by the onboarding action and the profile action so both enforce the
 * same rules and report failures identically. Returns a form state on failure
 * and `null` on success, which lets each caller decide what success means —
 * onboarding redirects, the profile page stays put and says "Saved".
 */
export async function saveProfile(
  userId: string,
  formData: FormData,
): Promise<ProfileFormState | null> {
  const parsed = parseProfileForm(formData);

  // Echo the submitted values back either way, so a rejected form still shows
  // what the student typed.
  const values = {
    branch: String(formData.get("branch") ?? ""),
    gradYear: String(formData.get("gradYear") ?? ""),
    rollNumber: String(formData.get("rollNumber") ?? "").trim().toUpperCase(),
  };

  if (!parsed.ok) return { errors: parsed.errors, values };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        branch: parsed.data.branch,
        gradYear: parsed.data.gradYear,
        rollNumber: parsed.data.rollNumber,
      },
    });
    return null;
  } catch (error) {
    // P2002 is the unique constraint on rollNumber: another student has already
    // registered this one. Reported on the field rather than as a crash, since
    // it is usually a typo in the last digit.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        errors: {
          rollNumber:
            "That roll number is already registered to another account. Check it, and talk to your TPO coordinator if it really is yours.",
        },
        values,
      };
    }
    throw error;
  }
}

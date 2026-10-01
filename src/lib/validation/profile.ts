import { z } from "zod";
import {
  BRANCHES,
  MAX_GRAD_YEARS_AHEAD,
  ROLL_NUMBER_PATTERN,
} from "@/lib/constants";

/**
 * One schema for the profile, used by both `/onboarding` and `/profile`.
 *
 * It lives in `lib` rather than beside either action because the server action
 * is the only place the rules are enforced — a client-side `required` attribute
 * is a convenience, not a check. Anything that writes `branch`, `gradYear` or
 * `rollNumber` goes through here first.
 */

/** The current year, computed per call — a module-level constant would freeze on new year's eve. */
const currentYear = () => new Date().getFullYear();

export const profileSchema = z.object({
  branch: z.enum(BRANCHES, {
    error: "Pick your branch from the list.",
  }),

  // Validated as text first, then coerced. A bare `z.coerce.number()` turns an
  // empty field into 0, which fails the range check and tells a student who typed
  // nothing that "that year has already passed".
  gradYear: z
    .string()
    .trim()
    .min(1, "Enter your graduation year, e.g. 2029.")
    .regex(/^\d{4}$/, "Enter a four-digit year, e.g. 2029.")
    // `transform` rather than `pipe(z.coerce.number())`: the regex above has
    // already proved this is four digits, and a coerced schema's input type is
    // `unknown`, which does not line up with a string pipeline.
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(
          currentYear(),
          "That year has already passed — enter the year you will graduate.",
        )
        .max(
          currentYear() + MAX_GRAD_YEARS_AHEAD,
          `That is too far ahead. Use a year up to ${currentYear() + MAX_GRAD_YEARS_AHEAD}.`,
        ),
    ),

  // Trimmed and upper-cased before the pattern runs, so "  tu3f2122001 " is
  // accepted and stored as "TU3F2122001" rather than rejected on whitespace.
  rollNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      ROLL_NUMBER_PATTERN,
      "That doesn't look like a Terna roll number — 6 to 12 letters and digits, e.g. TU3F2122001.",
    ),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/** Field-keyed errors, the shape the form components render. */
export type ProfileFieldErrors = Partial<Record<keyof ProfileInput, string>>;

export interface ProfileFormState {
  errors?: ProfileFieldErrors & { form?: string };
  values?: { branch?: string; gradYear?: string; rollNumber?: string };
  success?: boolean;
}

/**
 * Parses a `FormData` into a profile, returning either the clean values or
 * per-field messages. Keeping this out of the actions means both actions report
 * errors identically.
 */
export function parseProfileForm(
  formData: FormData,
):
  | { ok: true; data: ProfileInput }
  | { ok: false; errors: ProfileFieldErrors } {
  const raw = {
    branch: String(formData.get("branch") ?? ""),
    gradYear: String(formData.get("gradYear") ?? ""),
    rollNumber: String(formData.get("rollNumber") ?? ""),
  };

  const result = profileSchema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };

  const errors: ProfileFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ProfileInput | undefined;
    // First message per field wins — showing three messages under one input
    // reads as three separate problems.
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { ok: false, errors };
}

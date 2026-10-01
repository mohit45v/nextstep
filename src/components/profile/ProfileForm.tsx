"use client";

import { useActionState } from "react";
import { AlertTriangle } from "lucide-react";
import { BRANCHES, MAX_GRAD_YEARS_AHEAD } from "@/lib/constants";
import type { ProfileFormState } from "@/lib/validation/profile";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";

type ProfileAction = (
  state: ProfileFormState,
  formData: FormData,
) => Promise<ProfileFormState>;

interface ProfileFormProps {
  action: ProfileAction;
  /** Pre-fills the inputs when editing an existing profile. */
  initial?: { branch?: string | null; gradYear?: number | null; rollNumber?: string | null };
  submitLabel: string;
  pendingLabel: string;
  /** Rendered under the submit button — e.g. the onboarding "why we ask" note. */
  footnote?: React.ReactNode;
}

/**
 * The one profile form, shared by /onboarding and /profile.
 *
 * It works with JavaScript switched off: the `<form action={...}>` posts to the
 * server action, which re-renders the page with `state.errors` filled in.
 * `useActionState` only adds the in-place update and the pending label on top of
 * that — it is not what makes the form function.
 */
export function ProfileForm({
  action,
  initial,
  submitLabel,
  pendingLabel,
  footnote,
}: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(action, {});

  // After a failed submit the server echoes back what was typed, so a rejected
  // roll number is still in the box to correct rather than wiped.
  const values = {
    branch: state.values?.branch ?? initial?.branch ?? "",
    gradYear: state.values?.gradYear ?? initial?.gradYear?.toString() ?? "",
    rollNumber: state.values?.rollNumber ?? initial?.rollNumber ?? "",
  };

  const thisYear = new Date().getFullYear();

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.errors?.form && (
        <div
          role="alert"
          className="flex gap-3 rounded-input border border-danger-line bg-danger-soft px-4 py-3"
        >
          <AlertTriangle className="h-[18px] w-[18px] shrink-0 text-danger" />
          <p className="text-sm leading-relaxed text-danger">{state.errors.form}</p>
        </div>
      )}

      <Field
        label="Branch"
        htmlFor="branch"
        error={state.errors?.branch}
        hint="Your degree programme."
      >
        <select
          id="branch"
          name="branch"
          defaultValue={values.branch}
          aria-invalid={state.errors?.branch ? true : undefined}
          aria-describedby={state.errors?.branch ? "branch-error" : undefined}
          className={inputClass(Boolean(state.errors?.branch))}
        >
          <option value="">Select your branch</option>
          {BRANCHES.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Graduation year"
        htmlFor="gradYear"
        error={state.errors?.gradYear}
        hint={`The year your degree finishes — ${thisYear} to ${thisYear + MAX_GRAD_YEARS_AHEAD}.`}
      >
        <input
          id="gradYear"
          name="gradYear"
          type="number"
          inputMode="numeric"
          min={thisYear}
          max={thisYear + MAX_GRAD_YEARS_AHEAD}
          placeholder={String(thisYear + 2)}
          defaultValue={values.gradYear}
          aria-invalid={state.errors?.gradYear ? true : undefined}
          aria-describedby={state.errors?.gradYear ? "gradYear-error" : undefined}
          className={inputClass(Boolean(state.errors?.gradYear))}
        />
      </Field>

      <Field
        label="Roll number"
        htmlFor="rollNumber"
        error={state.errors?.rollNumber}
        hint="As printed on your college ID. Letters and digits only."
      >
        <input
          id="rollNumber"
          name="rollNumber"
          type="text"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder="TU3F2122001"
          defaultValue={values.rollNumber}
          aria-invalid={state.errors?.rollNumber ? true : undefined}
          aria-describedby={state.errors?.rollNumber ? "rollNumber-error" : undefined}
          className={cn(inputClass(Boolean(state.errors?.rollNumber)), "uppercase")}
        />
      </Field>

      <div className="pt-1">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? pendingLabel : submitLabel}
        </Button>
        {state.success && !isPending && (
          <p role="status" className="mt-3 text-sm font-medium text-success">
            Saved.
          </p>
        )}
      </div>

      {footnote}
    </form>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full rounded-input border bg-surface px-4 py-2.5 text-[15px] text-ink",
    "placeholder:text-ink-subtle focus:outline-none",
    hasError
      ? "border-danger-line focus:border-danger"
      : "border-line focus:border-accent",
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {hint && <p className="mt-1 text-xs text-ink-subtle">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

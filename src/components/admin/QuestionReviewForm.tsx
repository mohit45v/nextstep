"use client";

import { useActionState, useState } from "react";
import { AlertTriangle, Check, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Card } from "@/components/ui";
import { CATEGORY_BY_LABEL, DIFFICULTY_BY_LABEL } from "@/lib/aptitude-labels";
import type { QuestionFormState } from "@/lib/validation/question";
import type { ReviewQuestion } from "@/lib/admin";
import type { TopicSummary } from "@/types/aptitude";

type ReviewAction = (
  state: QuestionFormState,
  formData: FormData,
) => Promise<QuestionFormState>;

/**
 * The editorial form: read the question, fix it, then decide.
 *
 * The three buttons submit the same form with a different `intent`, so "save" can
 * never be confused with "publish to every student". Only the option list needs
 * client state (rows can be added and removed); everything else is a plain input
 * the server reads from `FormData`, which is why the form still submits with
 * JavaScript off.
 */
export function QuestionReviewForm({
  question,
  topics,
  action,
}: {
  question: ReviewQuestion;
  topics: TopicSummary[];
  action: ReviewAction;
}) {
  const [state, formAction, isPending] = useActionState(action, {});
  const [options, setOptions] = useState<string[]>(() =>
    question.options.length > 0 ? question.options.map((o) => o.text) : ["", ""],
  );
  const [correctOption, setCorrectOption] = useState(() =>
    question.correctOption >= 0 ? question.correctOption : 0,
  );

  function removeOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    // Keep the flag pointing at the same option it pointed at before the removal.
    setCorrectOption((prev) => {
      if (index === prev) return 0;
      return index < prev ? prev - 1 : prev;
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.errors?.form && (
        <Alert tone="danger">{state.errors.form}</Alert>
      )}
      {state.success && <Alert tone="success">{state.success}</Alert>}

      <Card className="p-6">
        <Field label="Question" htmlFor="prompt" error={state.errors?.prompt}>
          <textarea
            id="prompt"
            name="prompt"
            rows={4}
            defaultValue={question.prompt}
            className={inputClass(Boolean(state.errors?.prompt))}
          />
        </Field>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-ink">Options</legend>
          <p className="mt-1 text-xs text-ink-subtle">
            Select the radio beside the correct one. Imported answer keys are often
            wrong — work the question yourself before you trust it.
          </p>

          <ul className="mt-3 space-y-2">
            {options.map((option, index) => (
              <li key={index} className="flex items-center gap-2.5">
                <input
                  type="radio"
                  name="correctOption"
                  value={index}
                  checked={correctOption === index}
                  onChange={() => setCorrectOption(index)}
                  aria-label={`Option ${String.fromCharCode(65 + index)} is correct`}
                  className="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                />
                <span className="w-5 shrink-0 text-xs font-bold text-ink-subtle">
                  {String.fromCharCode(65 + index)}
                </span>
                <input
                  type="text"
                  name="option"
                  value={option}
                  onChange={(e) =>
                    setOptions((prev) =>
                      prev.map((o, i) => (i === index ? e.target.value : o)),
                    )
                  }
                  className={inputClass(false)}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    aria-label={`Remove option ${String.fromCharCode(65 + index)}`}
                    className="shrink-0 cursor-pointer rounded-lg p-2 text-ink-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {(state.errors?.options || state.errors?.correctOption) && (
            <p role="alert" className="mt-2 text-sm text-danger">
              {state.errors.options ?? state.errors.correctOption}
            </p>
          )}

          {options.length < 8 && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={() => setOptions((prev) => [...prev, ""])}
            >
              <Plus className="h-4 w-4" />
              Add option
            </Button>
          )}
        </fieldset>

        <div className="mt-6">
          <Field
            label="Explanation"
            htmlFor="explanation"
            hint="The method, step by step. This is what makes a question worth serving."
            error={state.errors?.explanation}
          >
            <textarea
              id="explanation"
              name="explanation"
              rows={7}
              defaultValue={question.explanation}
              className={cn(inputClass(Boolean(state.errors?.explanation)), "font-mono text-[13px]")}
            />
          </Field>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Shortcut (optional)" htmlFor="shortcutTip">
            <textarea
              id="shortcutTip"
              name="shortcutTip"
              rows={3}
              defaultValue={question.shortcutTip ?? ""}
              className={inputClass(false)}
            />
          </Field>
          <Field label="Formula used (optional)" htmlFor="formulaUsed">
            <textarea
              id="formulaUsed"
              name="formulaUsed"
              rows={3}
              defaultValue={question.formulaUsed ?? ""}
              className={inputClass(false)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Topic"
            htmlFor="topicId"
            hint="Required to approve. Drafts may sit without one."
            error={state.errors?.topicId}
          >
            <select
              id="topicId"
              name="topicId"
              defaultValue={question.topicId ?? ""}
              className={inputClass(Boolean(state.errors?.topicId))}
            >
              <option value="">No topic yet</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name} ({topic.category})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Company tags (optional)" htmlFor="companyTags" hint="Comma separated, e.g. TCS, Infosys.">
            <input
              id="companyTags"
              name="companyTags"
              type="text"
              defaultValue={question.companyTags.join(", ")}
              className={inputClass(false)}
            />
          </Field>

          <Field label="Category" htmlFor="category" error={state.errors?.category}>
            <select
              id="category"
              name="category"
              defaultValue={question.category}
              className={inputClass(Boolean(state.errors?.category))}
            >
              {Object.entries(CATEGORY_BY_LABEL).map(([label, value]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Difficulty" htmlFor="difficulty" error={state.errors?.difficulty}>
            <select
              id="difficulty"
              name="difficulty"
              defaultValue={question.difficulty}
              className={inputClass(Boolean(state.errors?.difficulty))}
            >
              {Object.entries(DIFFICULTY_BY_LABEL).map(([label, value]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      {/* The decision. Named buttons, so the server knows which one was pressed. */}
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" name="intent" value="approve" disabled={isPending}>
          <Check className="h-4 w-4" />
          {isPending ? "Working…" : "Approve"}
        </Button>
        <Button
          type="submit"
          name="intent"
          value="save"
          variant="secondary"
          disabled={isPending}
        >
          Save draft
        </Button>
        <Button
          type="submit"
          name="intent"
          value="reject"
          variant="danger"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          Reject
        </Button>

        <p className="text-xs text-ink-subtle">
          Approving serves this question to students immediately.
        </p>
      </div>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full rounded-input border bg-surface px-3.5 py-2.5 text-sm text-ink",
    "placeholder:text-ink-subtle focus:outline-none",
    hasError ? "border-danger-line focus:border-danger" : "border-line focus:border-accent",
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
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "danger" | "success";
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-card border px-4 py-3 text-sm",
        tone === "danger"
          ? "border-danger-line bg-danger-soft text-danger"
          : "border-success-line bg-success-soft text-success",
      )}
    >
      {tone === "danger" && <AlertTriangle className="h-[18px] w-[18px] shrink-0" />}
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

import { z } from "zod";
import { CATEGORY_BY_LABEL, DIFFICULTY_BY_LABEL } from "@/lib/aptitude-labels";

/**
 * The editorial form on /admin/questions.
 *
 * Imported drafts are exactly as trustworthy as the crowd that wrote them, so
 * the review form is where a question becomes usable: wording fixed, the right
 * option marked, a topic assigned. These rules are what "approved" means.
 */

const trimmed = z.string().trim();
const optional = (schema: z.ZodString) =>
  schema.optional().transform((value) => (value && value.length > 0 ? value : null));

export const questionEditSchema = z
  .object({
    prompt: trimmed.min(10, "The question needs to be at least 10 characters."),
    explanation: trimmed.min(
      10,
      "Write the method out. An approved question without working is just an answer key.",
    ),
    shortcutTip: optional(trimmed.max(600)),
    formulaUsed: optional(trimmed.max(300)),
    category: z.enum(
      Object.values(CATEGORY_BY_LABEL) as [string, ...string[]],
      { error: "Pick a category." },
    ),
    difficulty: z.enum(
      Object.values(DIFFICULTY_BY_LABEL) as [string, ...string[]],
      { error: "Pick a difficulty." },
    ),
    /** Empty string means "no topic yet" — allowed for a draft, not for approval. */
    topicId: optional(trimmed.max(64)),
    /** Comma-separated in the form, an array in the database. */
    companyTags: trimmed
      .max(300)
      .optional()
      .transform((value) =>
        (value ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
      ),
    options: z
      .array(trimmed.min(1, "An option cannot be empty."))
      .min(2, "A question needs at least two options.")
      .max(8, "Eight options is already more than any campus paper uses."),
    correctOption: z.coerce
      .number({ error: "Mark which option is correct." })
      .int()
      .min(0),
  })
  .refine((data) => data.correctOption < data.options.length, {
    message: "The correct option has to be one of the options listed.",
    path: ["correctOption"],
  });

export type QuestionEditInput = z.infer<typeof questionEditSchema>;

export type QuestionFieldErrors = Partial<
  Record<keyof QuestionEditInput | "form", string>
>;

export interface QuestionFormState {
  errors?: QuestionFieldErrors;
  success?: string;
}

/** What the review form can do with a question. */
export const REVIEW_INTENTS = ["save", "approve", "reject"] as const;
export type ReviewIntent = (typeof REVIEW_INTENTS)[number];

export function toReviewIntent(value: unknown): ReviewIntent {
  return REVIEW_INTENTS.includes(value as ReviewIntent)
    ? (value as ReviewIntent)
    : "save";
}

/**
 * Parses the review form.
 *
 * Options arrive as repeated `option` fields, in document order, which is how a
 * plain HTML form expresses a list — so the form still works without JavaScript
 * and the order of the inputs is the order of the options.
 */
export function parseQuestionForm(
  formData: FormData,
): { ok: true; data: QuestionEditInput } | { ok: false; errors: QuestionFieldErrors } {
  const raw = {
    prompt: String(formData.get("prompt") ?? ""),
    explanation: String(formData.get("explanation") ?? ""),
    shortcutTip: String(formData.get("shortcutTip") ?? ""),
    formulaUsed: String(formData.get("formulaUsed") ?? ""),
    category: String(formData.get("category") ?? ""),
    difficulty: String(formData.get("difficulty") ?? ""),
    topicId: String(formData.get("topicId") ?? ""),
    companyTags: String(formData.get("companyTags") ?? ""),
    options: formData.getAll("option").map((value) => String(value)),
    correctOption: String(formData.get("correctOption") ?? ""),
  };

  const result = questionEditSchema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };

  const errors: QuestionFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = (issue.path[0] ?? "form") as keyof QuestionFieldErrors;
    if (!errors[field]) errors[field] = issue.message;
  }
  return { ok: false, errors };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  parseQuestionForm,
  toReviewIntent,
  type QuestionFormState,
} from "@/lib/validation/question";

/**
 * Save, approve or reject one question.
 *
 * All three are the same write with a different `status`, so they share an action
 * and the intent comes from which submit button was pressed. Three things are
 * enforced here rather than in the form:
 *
 *  * ADMIN only — `requireRole` runs again even though the layout checked, because
 *    a server action is its own entry point and can be called directly.
 *  * An approved question must have a topic and a correct option. Approving
 *    without a topic would file it where no screen can reach it, and the servable
 *    filter would hide it anyway — a silent no-op is worse than a refusal.
 *  * Who decided. `reviewedById` and `reviewedAt` are stamped on every decision.
 */
export async function reviewQuestion(
  questionId: string,
  _prevState: QuestionFormState,
  formData: FormData,
): Promise<QuestionFormState> {
  const admin = await requireRole("ADMIN");
  const intent = toReviewIntent(formData.get("intent"));

  const parsed = parseQuestionForm(formData);
  if (!parsed.ok) return { errors: parsed.errors };

  const data = parsed.data;

  if (intent === "approve" && !data.topicId) {
    return {
      errors: {
        topicId:
          "Assign a topic before approving — an approved question with no topic is unreachable from practice.",
      },
    };
  }

  if (data.topicId) {
    const topic = await prisma.topic.findUnique({
      where: { id: data.topicId },
      select: { id: true },
    });
    if (!topic) return { errors: { topicId: "That topic no longer exists." } };
  }

  const status =
    intent === "approve" ? "APPROVED" : intent === "reject" ? "REJECTED" : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: { id: questionId },
      data: {
        prompt: data.prompt,
        explanation: data.explanation,
        shortcutTip: data.shortcutTip,
        formulaUsed: data.formulaUsed,
        category: data.category as "QUANTITATIVE" | "LOGICAL_REASONING" | "VERBAL_ABILITY",
        difficulty: data.difficulty as "EASY" | "MEDIUM" | "HARD",
        topicId: data.topicId,
        companyTags: data.companyTags,
        // "Save" leaves the status alone, so an editor can fix wording across
        // several visits without accidentally publishing half-edited text.
        ...(status ? { status, reviewedAt: new Date(), reviewedById: admin.id } : {}),
      },
    });

    // Options are replaced rather than patched: the form owns the whole list, and
    // matching up edited rows by index would quietly keep a deleted option.
    await tx.option.deleteMany({ where: { questionId } });
    await tx.option.createMany({
      data: data.options.map((text, order) => ({
        questionId,
        order,
        text,
        isCorrect: order === data.correctOption,
      })),
    });
  }, { maxWait: 15_000, timeout: 20_000 });

  // An approval changes what students are served, so the whole app's cached
  // content is stale, not just this page.
  revalidatePath("/", "layout");

  if (intent === "save") return { success: "Saved as a draft." };

  // After a decision, go back to the queue rather than sitting on a question
  // that is no longer in it.
  redirect(`/admin/questions?status=DRAFT&decided=${questionId}`);
}

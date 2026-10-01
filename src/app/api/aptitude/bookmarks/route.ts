import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiUser } from "@/lib/session";
import { servableQuestions } from "@/lib/aptitude";
import { bookmarkSchema } from "@/lib/validation/aptitude";

/**
 * Adds or removes a bookmark.
 *
 * Bookmarks used to be a `useState` array that emptied on navigation. They are
 * now rows keyed `@@unique([userId, questionId])`, which is what makes the write
 * idempotent: bookmarking twice is one row, and the student's list is the same
 * on their phone as on a lab machine.
 */
export async function POST(request: Request) {
  const user = await requireApiUser();
  if (user instanceof Response) return user;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Expected a JSON body." },
      { status: 400 },
    );
  }

  const parsed = bookmarkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Expected { questionId, bookmarked }." },
      { status: 400 },
    );
  }

  const { questionId, bookmarked } = parsed.data;

  if (!bookmarked) {
    // deleteMany, not delete: removing a bookmark that is already gone should
    // succeed quietly rather than 404 on a double click.
    await prisma.bookmark.deleteMany({ where: { userId: user.id, questionId } });
    return NextResponse.json({ success: true, data: { bookmarked: false } });
  }

  const exists = await prisma.question.findFirst({
    where: { ...servableQuestions, id: questionId },
    select: { id: true },
  });
  if (!exists) {
    return NextResponse.json(
      { success: false, error: "That question doesn't exist." },
      { status: 404 },
    );
  }

  await prisma.bookmark.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    create: { userId: user.id, questionId },
    update: {},
  });

  return NextResponse.json({ success: true, data: { bookmarked: true } });
}

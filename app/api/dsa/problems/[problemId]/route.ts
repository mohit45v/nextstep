import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const { problemId } = await params;
  try {
    const body = await request.json();
    return NextResponse.json({
      id: problemId,
      solved: !!body.solved,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag") || "dp";

  try {
    const cfRes = await fetch(
      `https://codeforces.com/api/problemset.problems?tags=${encodeURIComponent(tag)}`,
      { next: { revalidate: 300 } }
    );

    if (!cfRes.ok) {
      return NextResponse.json(
        { error: `Codeforces API returned HTTP ${cfRes.status}` },
        { status: cfRes.status }
      );
    }

    const data = await cfRes.json();

    if (data.status !== "OK") {
      return NextResponse.json(
        { error: data.comment || "Failed to fetch from Codeforces" },
        { status: 400 }
      );
    }

    const rawProblems = data.result.problems || [];
    const formatted = rawProblems.slice(0, 30).map((p: { contestId: number; index: string; name: string; rating?: number; tags: string[] }) => {
      let difficulty: "easy" | "medium" | "hard" = "medium";
      if (p.rating) {
        if (p.rating < 1200) difficulty = "easy";
        else if (p.rating >= 1700) difficulty = "hard";
      }

      return {
        id: `cf-${p.contestId}-${p.index}`,
        title: `${p.name} (CF ${p.contestId}${p.index})`,
        difficulty,
        rating: p.rating,
        tags: p.tags,
        solved: false,
        link: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
        source: "Codeforces API",
      };
    });

    return NextResponse.json({
      tag,
      totalCount: formatted.length,
      problems: formatted,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to Codeforces live API", details: String(error) },
      { status: 500 }
    );
  }
}

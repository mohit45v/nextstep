/**
 * Central route table for the aptitude module.
 *
 * The components were written against a `ScreenType` union back when
 * `app/page.tsx` swapped screens with `useState`. The screen names now map to
 * real URLs here — one place to change if the URL structure moves.
 *
 * Two of them take an id, because the thing they show lives in the database and
 * has to be linkable: a sitting of a pack, and a finished attempt. That is the
 * whole reason the in-memory `AptitudeSessionProvider` could be deleted — state
 * that belongs in a URL does not need a React context.
 */
export type ScreenType =
  | "dashboard"
  | "practice"
  | "company"
  | "history"
  | "formulas"
  | "analytics";

export const SCREEN_ROUTES: Record<ScreenType, string> = {
  dashboard: "/aptitude",
  practice: "/aptitude/practice",
  company: "/aptitude/companies",
  history: "/aptitude/review",
  formulas: "/aptitude/formulas",
  analytics: "/aptitude/analytics",
};

/** Practice route for one topic, e.g. practiceRoute("profit-loss"). */
export const practiceRoute = (topicId?: string, category?: string) => {
  const params = new URLSearchParams();
  if (topicId) params.set("topic", topicId);
  if (category && category !== "All") params.set("category", category);
  const query = params.toString();
  return query ? `${SCREEN_ROUTES.practice}?${query}` : SCREEN_ROUTES.practice;
};

/** One sitting of a company pack. */
export const examRoute = (packId: string) =>
  `/aptitude/exam/${encodeURIComponent(packId)}`;

/** A stored attempt's review — shareable, and survives a refresh. */
export const reviewRoute = (attemptId: string) =>
  `/aptitude/review/${encodeURIComponent(attemptId)}`;

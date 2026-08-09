/**
 * Central route table for the aptitude module.
 *
 * The components were written against a `ScreenType` union back when
 * `app/page.tsx` swapped screens with useState. Rather than rewrite every
 * onClick, the screen names now map to real URLs here — one place to change if
 * the URL structure moves.
 */
export type ScreenType =
  | "dashboard"
  | "practice"
  | "company"
  | "exam"
  | "review"
  | "formulas"
  | "analytics";

export const SCREEN_ROUTES: Record<ScreenType, string> = {
  dashboard: "/aptitude",
  practice: "/aptitude/practice",
  company: "/aptitude/companies",
  exam: "/aptitude/exam",
  review: "/aptitude/review",
  formulas: "/aptitude/formulas",
  analytics: "/aptitude/analytics",
};

/** Practice route for one topic, e.g. practiceRoute("percentages"). */
export const practiceRoute = (topicId?: string) =>
  topicId
    ? `${SCREEN_ROUTES.practice}?topic=${encodeURIComponent(topicId)}`
    : SCREEN_ROUTES.practice;

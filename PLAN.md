# NextStep — Implementation Plan

**Pace:** weekends only, ~8–10 hours across Saturday + Sunday.
**Span:** 13 weekends, 15 Aug → 8 Nov 2026.
**Goal:** a deployed platform running on real data, built in a way that teaches
you the stack rather than just producing files.

**Three headline features** are scheduled from Weekend 5 onward: an open-licensed
question bank, an in-browser code runner, and an animated algorithm visualiser.
They all hang off a user and a database, so Weekends 1–4 come first — building
them before persistence means building them twice.

Each weekend has a **Saturday** block (build), a **Sunday** block (build +
consolidate), a **Learn** section, and a **Done when** checklist. Do not move on
until the checklist passes — a half-finished weekend compounds.

---

## Weekend 0 — already done (9 Aug)

Foundation work completed for you:

- Fixed the broken build (`@next/swc-darwin-arm64` was a truncated download)
- Restructured to `src/` with `lib/ types/ hooks/ components/ data/`
- Replaced the fake `useState` screen-router with real Next.js routes
- Removed the duplicate NavDrawer and the fake `LoginModal`
- Unified the dark theme in the root layout
- Built domain-locked Google OAuth for `@ternaengg.ac.in`
- Added the Prisma schema, `session.ts` helpers, and route protection
- Lint errors: 11 → 0

**Nothing here is wired to a database yet.** That starts Weekend 1.

---

## Weekend 1 — Get the login actually working (15–16 Aug)

The code is written; you need to connect the two external services. This is the
weekend that turns a redirect loop into a real sign-in.

### Saturday (~4h)

1. Create a Neon project, copy the connection string into `DATABASE_URL`.
2. Create a Google Cloud OAuth client (README step 3). Take your time — a wrong
   redirect URI is the single most common failure.
3. `npx auth secret` → paste into `AUTH_SECRET`.
4. `npm run db:migrate` — watch it create the tables.
5. `npm run dev`, sign in with `dhangarmohit2425@ternaengg.ac.in`.
6. `npm run db:studio` — look at the `User`, `Account` and `Session` rows your
   login just created. Understand what each column is for.

### Sunday (~4h)

7. **Prove the domain lock works.** Sign out, then sign in with a personal Gmail.
   You should land back on `/login` with the "That account isn't a Terna one"
   message. If it lets you in, stop and fix it before doing anything else.
8. Read `src/lib/auth.config.ts` line by line. Write your own comment above each
   callback explaining what it does in your words.
9. Set yourself to `ADMIN` in Prisma Studio; confirm `session.user.role` reflects
   it after signing out and back in. (Ask yourself why signing out is required —
   the answer is in the `jwt` callback.)

### Learn
OAuth 2.0 authorization-code flow · why `hd` is a hint and the `signIn` callback
is the gate · JWT vs database sessions · what an ORM migration is.

### Done when
- [ ] You can sign in with your Terna account and see `/dashboard`
- [ ] A non-Terna Google account is rejected with a clear message
- [ ] `User` / `Account` rows exist in Neon
- [ ] You can explain, out loud, what happens between clicking the button and
      landing on the dashboard

---

## Weekend 2 — Profile & onboarding (22–23 Aug)

Right now a new user has no branch, roll number or graduation year. Everything
downstream (branch-wise DSA, leaderboards, TPO filtering) depends on this.

### Saturday
- Build `/onboarding`: a form for branch, graduation year, roll number.
- Write your first **server action** to save it (`src/app/onboarding/actions.ts`).
- Validate with **Zod** (already installed) — reject a roll number that doesn't
  match Terna's format, reject a graduation year in the past.

### Sunday
- Redirect users with an incomplete profile to `/onboarding` from `(app)/layout.tsx`.
- Build `/profile` to view and edit the same fields.
- Show the real name, branch and credits in the Navbar instead of the placeholders.

### Learn
Server actions vs API routes · Zod schema validation · `revalidatePath` ·
progressive enhancement (the form must work with JS disabled).

### Done when
- [x] A brand-new user is forced through onboarding exactly once — `(app)/layout.tsx`
      calls `requireProfileUser()`, so every route in the group is gated, and
      `/onboarding` redirects to the dashboard once the profile is complete
- [x] Invalid input shows a field-level error, not a crash — `parseProfileForm`
      returns one message per field; a duplicate roll number (P2002) is reported
      on the field rather than thrown
- [x] The Navbar shows your real name and branch — read from the database in the
      layout, not from the JWT, so it is correct immediately after onboarding

---

## Weekend 3 — Aptitude on real data (29–30 Aug)

`src/data/aptitudeData.ts` holds 360 lines of hardcoded questions. Move them into
Postgres.

### Saturday
- Add `Topic`, `Question`, `Option`, `FormulaCard`, `CompanyPack` models to
  `schema.prisma`. Think hard about relations before you write them.
- `npm run db:migrate`.
- Write `prisma/seed.ts` that imports `aptitudeData.ts` and inserts it.

### Sunday
- Rewrite `/api/aptitude` and `/api/aptitude/analytics` to query Prisma.
- Add `requireApiUser()` to both — they are currently open to the world.
- Delete the hardcoded arrays once the seed is verified.

### Learn
Relational modelling (one-to-many, many-to-many) · Prisma relations and
`include` · seeding · why you never ship secrets or data in client bundles.

### Done when
- [x] Questions render from the database, not the TS file — `src/data/aptitudeData.ts`
      is deleted; the content now lives in `prisma/seed-data.ts`, whose only
      consumer is the seed
- [x] Hitting `/api/aptitude` while signed out returns 401 JSON — verified for
      `/api/aptitude`, `/analytics`, `/evaluate`, `/practice` and `/bookmarks`
- [x] `npx prisma db seed` rebuilds the content from scratch — idempotent upserts;
      two consecutive runs leave the same row counts (8 / 6 / 4 / 4)

---

## Weekend 4 — Attempts & progress (5–6 Sep)

Currently a completed exam vanishes on refresh. This is the weekend NextStep
starts being genuinely useful.

### Saturday
- Models: `ExamAttempt`, `QuestionAttempt`, `Bookmark`.
- Rewrite `/api/aptitude/evaluate` to score server-side and persist the attempt.
  **Never trust the client's score** — recompute from the submitted answers.

### Sunday
- Load `/aptitude/review` from a stored attempt via `/aptitude/review/[attemptId]`,
  so results survive a refresh and can be shared.
- Add an attempt history list.
- Make `ProgressAnalytics` read real accuracy per topic.

### Learn
Why scoring belongs on the server · transactions (`prisma.$transaction`) ·
dynamic route segments · aggregation with `groupBy`.

### Done when
- [x] Finishing an exam writes rows you can see in Studio — `ExamAttempt` +
      `QuestionAttempt` in one transaction, scored from the `Option` rows
- [x] `/aptitude/review/<id>` works after a hard refresh — the review reads the
      stored attempt, scoped to `userId`, so another student's id gives a 404
- [x] Analytics numbers change when you actually practise — accuracy per topic is
      a `groupBy` over your own answers; topic practice records each checked
      answer, and re-answering a question overwrites its row rather than
      inflating the count

---

## Weekend 5 — Question bank: import & review (12–13 Sep)

Six questions is not a placement platform. This weekend gives you a supply of
properly-licensed questions **and** the editorial control to keep them good.

> **Not IndiaBix.** Their content is copyrighted and scraping it would infringe
> copyright and likely breach the IT Act 2000. Do not do it. The two datasets
> below are openly licensed and do the job.

| Dataset | Licence | Gives you |
| --- | --- | --- |
| [AQuA-RAT](https://github.com/google-deepmind/AQuA) | **Apache 2.0** (commercial use fine) | ~100k algebra word problems, MCQ + step-by-step rationale |
| [LogiQA 2.0](https://github.com/csitfun/LogiQA2.0_Chinese) | CC BY-NC-SA 4.0 | ~8.7k logical reasoning MCQs |

### Saturday

- Add `status` to `Question`: `DRAFT | APPROVED | REJECTED`, plus `source`,
  `sourceId`, `licence`. Only `APPROVED` is ever served to students.
- Write `scripts/import-aqua.ts` — streams the AQuA JSONL, maps each item to a
  `Question` with `status: DRAFT`, dedupes on `sourceId`, converts the `rationale`
  field into your existing `explanation`.
- Import a slice (say 500), not all 100k.

### Sunday

- Build `/admin/questions` behind `requireRole("ADMIN")`: list drafts, edit
  text/options/explanation, approve or reject.
- Approve ~100 good ones. **Read every one you approve.**
- Add `/attributions` listing each dataset, its licence and its authors.

### Learn

Why AQuA is *training* data, not exam content — crowd-sourced rationales, uneven
quality, some wrong answers. Streaming large files instead of `JSON.parse` on
100MB. Idempotent imports. What open licences actually require of you.

### Done when

- [x] A student only ever sees `APPROVED` questions — one filter,
      `servableQuestions` in `src/lib/aptitude.ts`, spread into every read
- [x] Re-running the importer creates zero duplicates — dedupe on a SHA-256 of the
      normalised question text, stored as `sourceId` under the unique index on
      `(source, sourceId)`; a second run reports 0 created / N updated
- [x] `/attributions` credits both datasets correctly — public page generated from
      the database, listing only sources that actually have approved questions,
      and flagging any source with no registry entry
- [ ] You have personally read every approved question — **yours to do.** Download
      AQuA, `npm run import:aqua -- --file <path> --limit 500`, then work through
      `/admin/questions`. The code cannot do this part and should not pretend to:
      approving without reading is exactly what the draft state exists to prevent

---

## Weekend 6 — DSA hub on real data (19–20 Sep)

### Saturday

- Models: `DsaTopic`, `DsaProblem`, `ProblemSolve` (`@@unique([userId, problemId])`).
- Seed the curated problems; rewrite `/api/dsa/topics` and `.../problems`.

### Sunday

- Make the solve tick persist per user. The UI currently says plainly that it
  does not — delete that notice once it does.
- Keep the Codeforces route cached (already `revalidate: 300`).

### Learn

Composite unique constraints · optimistic UI with rollback on failure · why the
old no-op PATCH route was worse than no route at all.

### Done when

- [x] Ticking a problem survives a refresh and a re-login — `ProblemSolve` is
      unique on `(userId, problemId)`, so the toggle is idempotent and the count
      on each sheet is a query
- [x] The "ticks aren't saved yet" notice is gone because it is no longer true

---

## Weekend 7 — Code runner, part 1: the seam (26–27 Sep)

[CodeBox](https://github.com/hiteshchoudhary/Codebox) is MIT-licensed and exposes
**Judge0-compatible endpoints**. That compatibility is the whole strategy: build
against the Judge0 API shape and the backend becomes swappable.

### Saturday

- Define `src/lib/code-runner/types.ts` — `submit(source, languageId, stdin)` →
  `{ stdout, stderr, status, timeMs, memoryKb }`. Nothing above this layer knows
  which engine is running.
- Implement `Judge0Runner` against the documented Judge0 REST shape.
- Config via env: `CODE_RUNNER_URL`, `CODE_RUNNER_TOKEN`.

### Sunday

- Run CodeBox locally with `docker-compose`. Point `CODE_RUNNER_URL` at it.
- Build `/playground`: Monaco editor, language picker, stdin box, output panel.
- Handle the states properly — queued, running, timed out, compile error,
  runtime error. Each needs distinct UI; "something went wrong" is useless.

### Learn

Programming against an interface rather than a vendor · why untrusted code needs
a sandbox (no network, memory/CPU/time caps, non-root) · polling vs webhooks.

### Done when

- [ ] You can run Python, JS, C++ and Java from the browser and see real output —
      **needs your Docker.** The seam, the playground and all four language
      templates are built; `docker compose up -d` then
      `CODE_RUNNER_URL="http://localhost:2358"` is what turns Run from "no runner
      configured" into real output
- [ ] An infinite loop times out cleanly instead of hanging the request — the
      adapter maps Judge0's time-limit status to its own `time-limit` state and
      gives up on its own 20s deadline if the judge never answers (both verified
      against a scripted fake judge); confirm it end to end once Docker is up
- [x] Swapping `CODE_RUNNER_URL` to a different Judge0 needs no code change — the
      engine is chosen from the environment in `src/lib/code-runner/index.ts`, and
      `judge0.ts` is the only file that knows Judge0 exists

---

## Weekend 8 — Code runner, part 2: judged problems (3–4 Oct)

### Saturday

- Models: `CodingProblem`, `TestCase` (with `isHidden`), `Submission`.
- Write 5 problems yourself with 3–5 test cases each. Two Sum, Valid Anagram,
  Contains Duplicate, Best Time to Buy/Sell, Valid Parentheses.

### Sunday

- Judge endpoint: run every test case, compare trimmed stdout, return
  pass/fail per case. **Never send hidden test cases to the browser.**
- Submission history per problem.

### Learn

Why hidden tests must stay server-side · batch execution · trailing-whitespace
bugs in output comparison (this will bite you) · storing submissions cheaply.

### Done when

- [ ] Solving a problem runs real tests and reports which failed
- [ ] Hidden test inputs never appear in the network tab
- [ ] A wrong answer shows the failing visible case, not just "failed"

---

## Weekends 9–11 — The visualiser (10 Oct – 25 Oct)

The most valuable thing you will build, and the most work. Modelled on
[dsa.chaicode.com](https://dsa.chaicode.com) — animated step-through with
narration, and **multiple approaches compared side by side**.

That comparison is the part that teaches. Watching op counts fall from 269,141
to 1,000 as you switch approach is a lesson a complexity table cannot give.

### Weekend 9 — the engine

The insight: an algorithm visualisation is **a list of frames**, not an
animation. Run the algorithm once, recording a frame at each meaningful step,
then let the UI scrub through them. No `setTimeout` choreography.

```ts
interface Frame {
  arrays: { name: string; values: number[]; }[];
  pointers: { label: string; index: number; colour: string }[];
  highlights: { index: number; kind: "compare" | "match" | "discard" }[];
  narration: string;   // "4 + 11 = 15 > 14 — move right in"
  opCount: number;     // cumulative, for the comparison view
}
```

- Build the recorder, the `Frame` renderer (SVG), and transport controls:
  play, pause, step forward/back, scrub, speed.
- Keyboard control and `prefers-reduced-motion` support.

### Weekend 10 — patterns

Implement as recorders, each emitting frames:

1. **Two pointers** — two-sum on a sorted array
2. **Sliding window** — longest substring without repeating characters
3. **Binary search** — with the `lo`/`hi`/`mid` collapse

### Weekend 11 — the comparison view

- Each problem gets 2–3 approaches (brute force → optimised).
- Tabs to switch; time/space complexity and **measured op count at n = 1,000**
  update as you switch.
- Op counts come from the recorder, not a lookup table — they are measured, the
  same way everything else in this app now is.

### Learn

Modelling animation as data · SVG and transforms · `requestAnimationFrame` vs
CSS transitions · accessibility for motion · measuring work instead of asserting
it.

### Done when

- [ ] You can scrub any visualisation forward and back with no glitches
- [ ] Switching approach updates complexity *and* a measured op count
- [ ] It respects `prefers-reduced-motion`
- [ ] A classmate watches two-pointers once and gets it

---

## Weekend 12 — Streaks, leaderboard & polish (31 Oct – 1 Nov)

### Saturday

- `DailyActivity` (`@@unique([userId, date])`), written on every attempt,
  solve and submission. The dashboard heatmap becomes real.
- Streak calculation. **Mind the timezone** — store UTC midnight, convert for
  display, or practising at 11:30pm IST lands on the wrong day.

### Sunday

- Leaderboard from aggregated scores, filterable by branch. Add the index.
- Error boundaries (`error.tsx`, `loading.tsx`) across route groups.
- Rate-limit the code runner per user — it executes arbitrary code, so it is the
  one endpoint where abuse actually costs you money.

### Done when

- [ ] The heatmap darkens on days you actually practised
- [ ] Practising at 11:30pm IST counts for the right day
- [ ] Hammering the runner gets throttled, not billed

---

## Weekend 13 — Testing, CI & deploy (7–8 Nov)

### Saturday

- **Vitest.** Test the pure functions first: streak calculation, output
  comparison, op counters, scoring. These have real consequences if wrong.
- GitHub Actions running `typecheck`, `lint`, `test` on every push.

### Sunday

- Deploy the Next.js app to Vercel. Add production env vars and the production
  Google callback URL.
- **The code runner cannot go on Vercel** — it needs Docker and long-running
  processes. Either put CodeBox on a VPS (Oracle Cloud's free ARM tier is worth
  checking) and point `CODE_RUNNER_URL` at it, or ship with the playground
  disabled behind a feature flag until you have a host.
- Verify a real Terna sign-in on production, and that a non-Terna account still
  cannot get in.

### Done when

- [ ] CI is green on `main`
- [ ] A classmate signs in on the live URL with their Terna email
- [ ] A non-Terna account is refused **on production**
- [ ] Either the runner works in production, or it is cleanly flagged off

---

## Deferred

From the original sixteen-module vision, these are parked. They are real
features, but they are not what makes this project distinctive, and a
half-built portal is worth less than three finished ones:

- TPO / faculty portal and role-based dashboards
- Resume builder and ATS checker
- Company drives, eligibility rules and notifications
- Alumni network, mock interviews, virtual GD

Pick them up after Weekend 13 if you still want them.

---

## A note on scope

This is thirteen weekends — roughly three months. The compiler, the question
bank and the visualiser are each a small project in their own right.

If you start slipping, cut in this order: visualiser comparison view → code
runner judged problems → leaderboard. Protect Weekends 1–4 absolutely. An app
where sign-in works and attempts are saved beats an app with three impressive
half-features and no persistence.

---

## Working habits

**Branch per weekend.** `git checkout -b week-3-aptitude-db`. Open a PR into
`main` even though you are solo — reading your own diff catches a surprising
number of mistakes.

**Commit at the end of each block**, not at the end of the weekend. If Sunday
goes wrong you want Saturday's work intact.

**Run this before every commit:**

```bash
npm run typecheck && npm run lint && npm run build
```

**Keep a `NOTES.md`.** One line per session on what broke and how you fixed it.
In an interview, "I fixed a stale-closure bug in a countdown timer that was
submitting empty answer sheets" is a far better answer than "I built a placement
portal."

**When you get stuck for more than 30 minutes**, write down what you expected,
what happened, and what you have already ruled out. You will often solve it while
writing. If not, you now have a good question to ask.

---

## Known issues not scheduled above

Pick these up in spare time, or slot them into a weekend that finishes early:

1. **`README.md` demo section** — screenshots and a live link, worth adding
   before you show this to recruiters.
2. **No `NOTES.md` yet.** Start one on Weekend 1; see Working habits above.
3. **Mobile check.** The layouts are responsive but have only been viewed at
   desktop width. Walk every screen at 375px once.

Already scheduled, listed here only so you know where they went:

| Gap | Fixed in |
| --- | --- |
| Only 6 questions exist (2 topics have none) | Weekend 5 |
| DSA solve ticks not persisted | Weekend 6 |
| No error boundaries | Weekend 12 |
| No rate limiting | Weekend 12 |
| Attempts vanish on refresh | Weekend 4 |

### Fixed on 9 Aug (UI rebuild)

- Whole app rebuilt on one light design system (`#FF6500` accent, Fira Sans),
  replacing the dark navy theme and the separate purple `/dsa` theme.
- All fabricated data removed — see the README "What is real" table.
- 15 mock API routes deleted; the remaining 6 all have auth guards.
- ESLint down to **0 errors, 0 warnings**.

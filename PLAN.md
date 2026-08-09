# NextStep — Implementation Plan

**Pace:** weekends only, ~8–10 hours across Saturday + Sunday.
**Span:** 10 weekends, 15 Aug → 18 Oct 2026.
**Goal:** a deployed platform running on real data, built in a way that teaches
you the stack rather than just producing files.

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
- [ ] A brand-new user is forced through onboarding exactly once
- [ ] Invalid input shows a field-level error, not a crash
- [ ] The Navbar shows your real name and branch

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
- [ ] Questions render from the database, not the TS file
- [ ] Hitting `/api/aptitude` while signed out returns 401 JSON
- [ ] `npx prisma db seed` rebuilds the content from scratch

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
- [ ] Finishing an exam writes rows you can see in Studio
- [ ] `/aptitude/review/<id>` works after a hard refresh
- [ ] Analytics numbers change when you actually practise

---

## Weekend 5 — DSA hub on real data (12–13 Sep)

### Saturday
- Models: `DsaTopic`, `DsaProblem`, `ProblemSolve`.
- Seed the curated problems; rewrite `/api/dsa/topics` and `.../problems`.

### Sunday
- Make the solved checkbox persist per user (it currently only PATCHes into a
  mock handler).
- Cache the Codeforces call — you are hitting a third-party API on every
  keystroke-triggered refetch. Use `next: { revalidate: 3600 }`.

### Learn
Composite unique constraints (`@@unique([userId, problemId])`) · optimistic UI ·
Next.js fetch caching and revalidation · being a good API citizen.

### Done when
- [ ] Ticking a problem solved survives a refresh and a re-login
- [ ] Codeforces is called at most once an hour per tag

---

## Weekend 6 — Streak & leaderboard (19–20 Sep)

### Saturday
- `DailyActivity` model (`@@unique([userId, date])`).
- Record activity whenever an attempt or solve happens.
- Make `StreakHeatmap` render real data.

### Sunday
- Real leaderboard from aggregated scores, filterable by branch.
- Compute the current streak correctly — mind the timezone. Store dates as UTC
  midnight and convert for display, or you will get off-by-one bugs at 11pm IST.

### Learn
Time and timezones (the classic source of production bugs) · SQL aggregation ·
database indexes and why the leaderboard needs one.

### Done when
- [ ] The heatmap darkens on days you actually practised
- [ ] Your leaderboard rank changes when you complete a test
- [ ] Practising at 11:30pm IST counts for the right day

---

## Weekend 7 — Roles: student / faculty / TPO (26–27 Sep)

### Saturday
- Build `/tpo` behind `requireRole("TPO", "ADMIN")`.
- Student roster with branch and readiness filters.

### Sunday
- Faculty view: review student attempts, leave feedback.
- Audit every API route for missing role checks. Write down what each one allows.

### Learn
Authorization vs authentication · the principle of least privilege · why UI
hiding is not security.

### Done when
- [ ] A STUDENT hitting `/tpo` is redirected, not shown a hidden page
- [ ] Every API route has an explicit auth decision

---

## Weekend 8 — Resume & ATS (3–4 Oct)

### Saturday
- `Resume` model; a builder form at `/resume`.
- PDF export.

### Sunday
- ATS keyword scoring against a job description.
- If you wire in a Claude API call for suggestions, keep the key server-side and
  rate-limit it against the user's `credits` field.

### Learn
File generation · never exposing API keys to the browser · usage metering.

### Done when
- [ ] You can produce your own real resume as a PDF
- [ ] The API key never appears in the network tab

---

## Weekend 9 — Companies, drives & notifications (10–11 Oct)

### Saturday
- `Company`, `Drive`, `Application` models. Replace the companies mock routes.
- Eligibility logic (CGPA, branch, backlogs) as a pure, testable function.

### Sunday
- `Notification` model + a bell in the Navbar.
- Notify on new drives matching a student's branch.

### Learn
Modelling business rules · keeping logic pure so it can be tested.

### Done when
- [ ] A drive only appears to eligible students
- [ ] Eligibility is a function you could unit test

---

## Weekend 10 — Testing, CI & deploy (17–18 Oct)

### Saturday
- Add **Vitest**; test the eligibility rules, scoring and streak logic first —
  they are pure functions with real consequences if wrong.
- GitHub Actions running `typecheck`, `lint`, `test` on every push.

### Sunday
- Deploy to Vercel. Add production env vars. Add the production redirect URI to
  the Google console (`https://<your-app>.vercel.app/api/auth/callback/google`).
- Run a real sign-in on production with your Terna account.
- Write the final README section and record a short demo.

### Learn
What is worth testing and what is not · CI · environments and secrets ·
production vs preview deploys.

### Done when
- [ ] CI is green on `main`
- [ ] A classmate can sign in on the live URL with their Terna email
- [ ] A non-Terna account still cannot get in — **verify this on production**

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

1. **No error boundaries.** Add `error.tsx` and `loading.tsx` to the route groups.
2. **No rate limiting** on any API route.
3. **Only 6 aptitude questions exist**, across 6 of the 8 topics. Coding &
   Decoding and Reading Comprehension have none and are shown as "no questions
   yet". Writing more questions is the highest-value non-code work you can do —
   the app is only as useful as its bank.
4. **DSA solve ticks aren't persisted.** The checkbox works for the current
   visit only; the screen says so plainly. Weekend 5 fixes it.
5. **`README.md` demo section** — worth adding before you show this to
   recruiters.

### Fixed on 9 Aug (UI rebuild)

- Whole app rebuilt on one light design system (`#FF6500` accent, Fira Sans),
  replacing the dark navy theme and the separate purple `/dsa` theme.
- All fabricated data removed — see the README "What is real" table.
- 15 mock API routes deleted; the remaining 6 all have auth guards.
- ESLint down to **0 errors, 0 warnings**.

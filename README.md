# NextStep

Placement preparation for **Terna Engineering College** — aptitude practice with
worked explanations, timed company mock tests scored on the server, a reviewed
question bank, and DSA drilling.

Sign-in is restricted to `@ternaengg.ac.in` Google Workspace accounts.

---

## Stack

| Layer    | Choice                                        |
| -------- | --------------------------------------------- |
| Framework| Next.js 16 (App Router, React 19, Turbopack)   |
| Language | TypeScript (strict)                           |
| Styling  | Tailwind CSS v4 + component-scoped CSS files   |
| Auth     | Auth.js v5 (NextAuth) — Google OAuth, domain-locked |
| Database | PostgreSQL (Neon) via Prisma 7                |
| Icons    | lucide-react                                  |

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Create a database

Sign up at [neon.tech](https://neon.tech) (free, no card), create a project, and
copy the connection string. It looks like:

```
postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### 3. Create a Google OAuth client

1. Open the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials)
2. Create a project (e.g. `nextstep`)
3. **Create Credentials → OAuth client ID → Web application**
4. Add these exactly (the port must match, or you get `redirect_uri_mismatch`):
   - Authorised JavaScript origin: `http://localhost:3001`
   - Authorised redirect URI: `http://localhost:3001/api/auth/callback/google`
5. Copy the Client ID and Client Secret

> **Why 3001?** Google matches the redirect URI character for character, port
> included. `npm run dev` is pinned to `-p 3001` in `package.json` so the URI is
> stable — without the flag, Next.js silently picks the next free port when
> something else holds 3000 and every sign-in fails. If you change the port, add
> the matching URI in the Google console too.

### 4. Configure environment

```bash
cp .env.example .env
```

Fill in `DATABASE_URL`, `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. Generate a
secret with:

```bash
npx auth secret
```

### 5. Create the tables, load the content, run

```bash
npm run db:migrate   # create the tables
npm run db:seed      # load topics, questions, formula cards, company packs
npm run dev
```

Open <http://localhost:3001> (the port is pinned in `package.json`, see below).

`db:seed` is idempotent — every write is an upsert keyed on the content's own id,
so you can run it after any schema change without duplicating anything. The
content it loads lives in [prisma/seed-data.ts](prisma/seed-data.ts).

The first time you sign in you are sent to `/onboarding` to set branch,
graduation year and roll number. Nothing behind the login renders until that is
done — see [src/app/(app)/layout.tsx](src/app/\(app\)/layout.tsx).

---

## Troubleshooting sign-in

**`Error 400: redirect_uri_mismatch`**

Google compares the redirect URI character for character, port included. The
`redirect_uri=` value in the error message is what your app actually sent —
register exactly that string in the Google console. `npm run dev` is pinned to
port 3001 so this stays stable; if you change the port, update the console too.

**`?error=Configuration` on the login page**

Auth.js reports database/adapter failures under this code, so check the database
first — the server terminal has the real error. Usual causes:

- `DATABASE_URL` still holds the placeholder from `.env.example`
- The migration was never applied → run `npm run db:migrate`
- The database is unreachable (a local `npx prisma dev` server that has stopped)

**No database yet?** `npx prisma dev --name nextstep` starts a local Postgres
with no signup. Note it picks a **new port each restart**, so you have to update
`DATABASE_URL` each time — fine for a quick start, but Neon is less friction and
you need it for deployment anyway.

**Shadow database.** `prisma migrate dev` needs a scratch database to detect
drift. Hosted Postgres like Neon lets Prisma create one on the fly, so leave
`SHADOW_DATABASE_URL` unset (an *empty string* is not "unset" to Prisma — it
errors with `P1013` — so `prisma.config.ts` normalises it). Only set it if a
provider forbids `CREATE DATABASE`.

**`Timed out trying to acquire a postgres advisory lock` on migrate.** Migrations
take a Postgres advisory lock, and Neon's *pooled* endpoint hands the next query
to a different backend, so the lock is taken on one connection and waited for on
another. [prisma.config.ts](prisma.config.ts) points the CLI at the direct
endpoint by dropping `-pooler` from the host; the app keeps using the pooled one.
Set `DIRECT_DATABASE_URL` if your provider names the pair differently. If a
migrate run is interrupted the lock can be left held by an idle connection — find
it with `select * from pg_locks where locktype = 'advisory'` and terminate that
pid.

---

## How the Terna-only login works

Three independent layers, all of which must agree:

1. **Google's account chooser** — the provider sends `hd=ternaengg.ac.in`, so
   Google only offers Terna accounts. This is a UX hint and *can* be bypassed by
   hand-crafting the OAuth URL, so it is never relied on alone.
2. **The `signIn` callback** ([src/lib/auth.config.ts](src/lib/auth.config.ts)) —
   the real gate. Rejects the sign-in unless Google reports
   `email_verified: true`, a hosted domain (`hd`) of exactly `ternaengg.ac.in`,
   and an email ending in `@ternaengg.ac.in`.
3. **The `createUser` event** ([src/lib/auth.ts](src/lib/auth.ts)) — deletes any
   user row that somehow gets created outside the domain.

Route protection is handled by [src/proxy.ts](src/proxy.ts) (Next.js 16 renamed
the `middleware` convention to `proxy`), which redirects anonymous visitors to
`/login`. The public list it allows through is `PUBLIC_ROUTES` in
[src/lib/constants.ts](src/lib/constants.ts).

Pages do not rely on the proxy alone. Every route in the `(app)` group renders
inside a layout that calls `requireProfileUser()` from
[src/lib/session.ts](src/lib/session.ts) — one call that enforces both a session
and a finished profile — and `/admin` adds `requireRole("ADMIN")` in its own
layout. Route handlers call `requireApiUser()` and return 401 JSON, so the
guarantee holds even if the proxy matcher is ever misconfigured. Server actions
re-check too: an action is its own entry point and can be invoked directly.

To change the allowed domain, edit `ALLOWED_EMAIL_DOMAIN` in
[src/lib/constants.ts](src/lib/constants.ts) — it is the single source of truth.

---

## Directory structure

```
prisma/
  schema.prisma            Database models (Auth.js, content, attempts)
  migrations/              Four so far: init, content, attempts, question bank
  seed-data.ts             The reviewed editorial content (seed's only consumer)
  seed.ts                  npm run db:seed — idempotent upserts

scripts/
  import-aqua.ts           Streaming AQuA-RAT importer → DRAFT questions

src/
  app/
    layout.tsx             Root layout — metadata template
    page.tsx               Public landing page (demo loop reads the live bank)
    login/                 Sign-in page (Google button, error messages)
    onboarding/            Outside (app): branch / grad year / roll number
    attributions/          Public: dataset credits, generated from the database
    (app)/                 Route group: everything behind auth
      layout.tsx           requireProfileUser() — session + finished profile
      dashboard/
      profile/             View and edit the same fields as onboarding
      aptitude/            page + practice/ companies/ exam/[packId]/
                           review/ review/[attemptId]/ formulas/ analytics/
      admin/               requireRole("ADMIN") in its layout
        questions/         Review queue + per-question edit form
    dsa/                   Ships its own navbar & drawer
    api/
      auth/[...nextauth]/  Auth.js endpoints
      aptitude/            index, evaluate, practice, bookmarks, analytics
      dsa/                 topics, problems, Codeforces proxy

  components/
    auth/                  AccountMenu (name, branch, credits, sign out)
    layout/                Navbar, NavDrawer, AppShell, nav-items
    profile/               ProfileForm — shared by onboarding and /profile
    admin/                 QuestionReviewForm
    dashboard/             DashboardMain
    aptitude/              The aptitude screens
    landing/               Hero preview, header, reveal
    dsa/                   DSAPage
    ui/                    Button, Card, Badge, Container, PageHeader, …

  lib/
    auth.ts                Full Auth.js config (Node runtime, Prisma adapter)
    auth.config.ts         Edge-safe half, shared with proxy.ts
    session.ts             requireUser / requireRole / requireApiUser /
                           requireProfileUser / getProfileUser
    prisma.ts              PrismaClient singleton
    aptitude.ts            Every student-facing content query (servableQuestions)
    attempts.ts            Server-side scoring, review, progress aggregation
    admin.ts               Review-queue queries (reads drafts — ADMIN only)
    aptitude-labels.ts     Enum ↔ display label, shared with the seed
    datasets.ts            Dataset registry: licences, authors, obligations
    profile.ts             saveProfile, shared by both profile actions
    format.ts              Server-side date/duration formatting
    constants.ts           Domain, branches, marking, roll-number pattern
    routes.ts              Route helpers (practiceRoute, examRoute, reviewRoute)
    validation/            Zod schemas: profile, aptitude API, question editor

  types/                   aptitude view models + next-auth augmentation
  hooks/                   useInView, usePrefersReducedMotion
  generated/prisma/        Prisma Client output (gitignored)

  proxy.ts                 Route protection (formerly middleware.ts)
```

**Import alias:** `@/*` maps to `src/*`, so `@/lib/auth` resolves to
`src/lib/auth.ts`.

---

## Scripts

| Command                | What it does                                        |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Dev server on :3001                                 |
| `npm run build`        | Production build                                    |
| `npm run typecheck`    | TypeScript, no emit                                 |
| `npm run lint`         | ESLint                                              |
| `npm run db:migrate`   | Create + apply a migration                          |
| `npm run db:push`      | Push schema without a migration (prototyping)       |
| `npm run db:seed`      | Load / refresh the editorial content (idempotent)   |
| `npm run db:studio`    | Browse the database in a GUI                        |
| `npm run import:aqua`  | Import AQuA-RAT questions as drafts (see below)     |
| `docker compose up -d` | Start the Judge0 code runner for `/playground`      |

---

## The question bank

Questions live in Postgres with an editorial status, and **only `APPROVED`
questions are ever served to a student**. That rule is one object —
`servableQuestions` in [src/lib/aptitude.ts](src/lib/aptitude.ts) — which every
read spreads into its `where` clause, so it cannot be forgotten at a call site:

```ts
export const servableQuestions = {
  status: "APPROVED",
  topicId: { not: null },
};
```

### Importing

> **Not IndiaBix.** Their content is copyrighted; scraping it would infringe
> copyright and likely breach the IT Act 2000. The datasets below are openly
> licensed and do the job.

[AQuA-RAT](https://github.com/google-deepmind/AQuA) (Apache-2.0) is ~100k algebra
word problems, each with options and a written rationale that becomes the
explanation a student sees. Download it, then import a slice:

```bash
curl -L -o /tmp/aqua-train.json https://raw.githubusercontent.com/google-deepmind/AQuA/master/train.json
npm run import:aqua -- --file /tmp/aqua-train.json --limit 500
```

Flags: `--limit` (default 500), `--topic <topicId>`, `--category`,
`--difficulty`, `--dry-run`.

The importer streams the file line by line — it is JSON Lines, and
`JSON.parse` on 160 MB to read 500 of its 100,000 items is a waste of memory.
AQuA items have no id, so the dedupe key is a SHA-256 of the normalised question
text stored as `sourceId`; with the unique index on `(source, sourceId)`,
**re-running the importer creates zero duplicates** and never resurrects
something you rejected.

### Reviewing

Everything imported arrives as `DRAFT` with no topic, which makes it unreachable
from practice and from every mock paper. Review it at `/admin/questions`
(`ADMIN` only — set your `role` in Prisma Studio, then sign out and back in,
because the role is carried in the JWT).

The review form will not let you approve a question without a topic and a marked
correct option, and it records who decided and when. **Read every question you
approve**: AQuA's rationales are crowd-sourced, quality is uneven and some stated
answers are simply wrong. That is the entire reason the draft state exists.

### Attribution

Both open datasets require credit, so [/attributions](http://localhost:3001/attributions)
is public — attribution behind a login is not attribution. The page is generated
from the database and lists only sources that actually have approved questions,
with the licence, the authors and what we changed. New source? Add it to
[src/lib/datasets.ts](src/lib/datasets.ts); the page flags any source serving
questions without a registry entry.

Note that LogiQA 2.0 is CC BY-NC-SA 4.0 — **non-commercial and share-alike**.
That restriction travels with the questions and constrains NextStep itself, so
read `obligations` in the registry before importing it.

---

## The DSA hub

Curated sheets live in `DsaTopic` / `DsaProblem`, and a tick is a row in
`ProblemSolve`, unique on `(userId, problemId)`. That composite unique is what
makes the toggle idempotent — ticking twice is one row, so a retried request
after a flaky connection cannot double-count progress. The UI updates
optimistically and rolls the tick back if the write fails, which is the opposite
of what the old screen did (it showed progress that was never stored, and said so
in a notice that is now gone).

Branch, topic and mode are URL parameters, so the page is server-rendered with
its sheet already in it. With no `?branch=`, your own degree programme picks the
first sheet — `defaultBranchForProgramme` in
[src/lib/dsa-labels.ts](src/lib/dsa-labels.ts) maps Terna's programmes onto the
sheets, and anything it cannot place falls back to all branches.

The **live feed** is proxied through `/api/dsa/external/codeforces`, which caches
each tag for five minutes, times out after eight seconds and only accepts tags
from a fixed list. Passing a query parameter straight through to a third party is
a small open proxy, and it would also shatter the cache one unique tag at a time.

---

## The code runner

`/playground` runs code in a sandboxed Judge0-compatible engine. The seam is
[src/lib/code-runner/types.ts](src/lib/code-runner/types.ts): nothing above it
knows which engine is running, and switching from local CodeBox to a hosted
Judge0 is a `CODE_RUNNER_URL` change.

```bash
docker compose up -d
```

Then put the URL in `.env.local`:

```
CODE_RUNNER_URL="http://localhost:2358"
```

Without it the editor still works and the page says plainly that nothing can
execute — a deployment with no Docker is a normal state for this project, not an
error. Judge0 needs privileged containers (it uses cgroups and namespaces to
isolate each submission), which is why the playground cannot run on Vercel.

Running untrusted code is the most dangerous thing this app does, so:

- Execution happens in a **separate service**, never in the Next.js process. An
  infinite loop costs the judge a container, not the app.
- Submissions are sent with `enable_network: false`, a CPU time limit and a
  memory cap (`RUN_LIMITS`).
- The route requires a session, bounds source and stdin length, accepts only the
  four language ids it offers, and rate-limits each student to 20 runs a minute.
- The adapter **polls** rather than holding a request open, and gives up on its
  own deadline — a judge that never answers must not hang a request forever.

Each outcome gets its own message: a compile error says the program never ran, a
time limit points at a loop that never ends, and a judge failure says plainly
that it is not your code.

---

## Performance notes

Numbers measured against this project's Neon database from India, because the
fix only makes sense once you know where the time goes:

| What | Cost |
| --- | --- |
| Opening a new connection to Neon | **~3.1 s** |
| A query on an already-open connection | ~255 ms |
| Eight parallel queries on a warm pool | ~330 ms |

Two consequences, both handled in [src/lib/prisma.ts](src/lib/prisma.ts):

- **The pool is kept warm.** node-postgres closes idle connections after ten
  seconds by default, so a quiet dev server paid three seconds on the next page —
  and a page firing three queries in parallel opened three connections and paid it
  three times. Connections now idle for five minutes, and a few are opened at
  startup instead of making the first visitor wait.
- **Transactions get a realistic deadline.** Prisma waits two seconds to acquire a
  connection; on a cold pool that expires before a connection even exists, and the
  work fails with a timeout that has nothing to do with the work. The importer
  lost 12 of 36 questions to exactly this before the limits were raised.

After that, the screens that were taking ~3.1 s settle at ~0.5 s, which is two
round trips to the other side of the planet.

**The remaining 255 ms is geography.** The database is in `us-east-2` and you are
in India. Creating the Neon project in `ap-south-1` or `ap-southeast-1` would cut
every query to tens of milliseconds — worth doing before the first real intake,
and it costs a `db:migrate` plus a `db:seed` against the new project. In
production, keep the app and the database in the same region and this disappears
either way.

Elsewhere the same principle applies: round trips are the latency, so pages fetch
in parallel (`Promise.all`), per-topic accuracy is one grouped SQL query rather
than a tally over every answer loaded into Node, an exam paper draws its
candidates with one `IN` query rather than one per section, and the importer
writes in batches of eight concurrent transactions (500 questions: ~11 minutes
before, ~3 after). Routes that wait on the database stream a skeleton first via
`loading.tsx`.

---

## What is real

The app deliberately shows nothing it cannot back up. Where a number isn't
measured, the screen says so instead of inventing one.

| Area | Status |
| --- | --- |
| Google sign-in, Terna domain lock, sessions | Real — Postgres via Prisma |
| Onboarding and profile (branch, grad year, roll number) | Real — Zod-validated server actions, roll number `@unique` |
| Aptitude topics, questions, formula cards, company packs | Real — in Postgres, seeded from `prisma/seed-data.ts` |
| Mock test scoring (+4 / −1), timing | Real — recomputed server-side from the option rows in `/api/aptitude/evaluate`; the paper sent to the browser contains no answer key |
| Attempt history and review | Real — stored; `/aptitude/review/<id>` survives a refresh |
| Per-topic accuracy, overall accuracy, time practised | Real — aggregated from your own `QuestionAttempt` rows |
| Bookmarks | Real — one row per student per question |
| Draft/approve question bank, importer, attributions | Real — `/admin/questions`, `/attributions` |
| DSA curated sheets | Real — in Postgres; sheets, problems and per-student ticks |
| DSA solve ticks | Real — `ProblemSolve` rows; they survive a refresh and a re-login |
| Codeforces live problems | Real — proxied, cached 5 min, 8s timeout, fixed tag list |
| Code playground | Real **when a runner is configured**; without one the page says so and nothing executes |
| Judged coding problems with test cases | **Not built.** Weekend 8 in [PLAN.md](PLAN.md) |
| Streaks and leaderboard | **Not built.** Weekend 12 in [PLAN.md](PLAN.md) |

A few deliberate honesty details worth knowing:

- A company pack card shows **both** the paper's real question count and how many
  the approved bank can currently fill, and the paper you sit is the smaller
  number rather than a padded one.
- A topic with no approved questions is listed under "Coming soon" instead of
  being shown with a question count it does not have.
- A practice session serves at most 20 questions; when a topic holds more, the
  screen says which fraction you are getting.
- `Stat` renders an em-dash, not a zero, when a number has not been measured yet.

### Known assumption

The roll-number format in `ROLL_NUMBER_PATTERN`
([src/lib/constants.ts](src/lib/constants.ts)) is a guess: 6–12 uppercase
alphanumerics containing at least two digits. Check it against a real ID card and
tighten it — the whole rule is that one constant.

### Planned

Still to come (see [PLAN.md](PLAN.md)):

- **Judged problems** — `CodingProblem`, `TestCase` (with `isHidden`) and
  `Submission`, plus a judge endpoint that runs every test case server-side.
  Hidden test cases must never reach the browser. Needs the code runner running.
- **Algorithm visualiser** — step-through animations recorded as frames, with
  narration and a brute-force-vs-optimised comparison showing measured operation
  counts.

## Design system

One light theme across every screen, defined once in
[src/app/globals.css](src/app/globals.css) as Tailwind v4 `@theme` tokens:

| Token | Value | Use |
| --- | --- | --- |
| `accent` | `#FF6500` | Primary actions, active nav |
| `canvas` | `#F2F2F2` | Page background |
| `surface` | `#FFFFFF` | Cards and panels |
| `ink` / `ink-muted` / `ink-subtle` | `#111` / `#5C5C5C` / `#8A8A8A` | Text hierarchy |
| `line` / `line-strong` | `#E5E5E5` / `#D4D4D4` | Borders |
| `success` / `danger` / `warn` / `info` | — | Answer states, difficulty chips |

Screens compose the primitives in [src/components/ui](src/components/ui)
(`Button`, `Card`, `Badge`, `Container`, `PageHeader`, `EmptyState`, `Stat`)
rather than writing one-off Tailwind. If a screen needs a hex literal, the
palette is missing something — extend the tokens rather than working around
them locally.

# NextStep

AI placement & career development platform for **Terna Engineering College** —
aptitude practice, DSA drilling, company test series, skill-gap analysis and ATS
resume tooling.

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

### 5. Create the tables and run

```bash
npm run db:migrate
npm run dev
```

Open <http://localhost:3000>.

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
`SHADOW_DATABASE_URL` unset. Only set it if a provider forbids `CREATE DATABASE`.

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
`/login`. Server components additionally call `requireUser()` from
[src/lib/session.ts](src/lib/session.ts), so the guarantee holds even if the
matcher is ever misconfigured.

To change the allowed domain, edit `ALLOWED_EMAIL_DOMAIN` in
[src/lib/constants.ts](src/lib/constants.ts) — it is the single source of truth.

---

## Directory structure

```
prisma/
  schema.prisma            Database models (Auth.js + app tables)

src/
  app/
    layout.tsx             Root layout — dark theme, metadata template
    page.tsx               Public landing page
    login/                 Sign-in page (Google button, error messages)
    (app)/                 Route group: everything behind auth
      layout.tsx           Calls requireUser(), renders the AppShell
      dashboard/
      aptitude/            page + practice/ companies/ exam/ review/
                           formulas/ analytics/
    dsa/                   Outside (app) — ships its own navbar & drawer
    api/                   Route handlers
      auth/[...nextauth]/  Auth.js endpoints

  components/
    auth/                  SignOutButton
    layout/                Navbar, NavDrawer, AppShell
    dashboard/             DashboardMain, StreakHeatmap
    aptitude/              The seven aptitude screens + session provider
    dsa/                   DSAPage
    ui/                    (shared primitives — currently empty)

  lib/
    auth.ts                Full Auth.js config (Node runtime, Prisma adapter)
    auth.config.ts         Edge-safe half, shared with proxy.ts
    session.ts             requireUser / requireRole / requireApiUser
    prisma.ts              PrismaClient singleton
    constants.ts           ALLOWED_EMAIL_DOMAIN and friends
    routes.ts              ScreenType → URL map

  data/                    Static seed data (aptitude questions, formulas)
  types/                   Shared types + next-auth module augmentation
  hooks/                   (custom hooks — currently empty)
  generated/prisma/        Prisma Client output (gitignored)

  proxy.ts                 Route protection (formerly middleware.ts)
```

**Import alias:** `@/*` maps to `src/*`, so `@/lib/auth` resolves to
`src/lib/auth.ts`.

---

## Scripts

| Command              | What it does                                  |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Dev server on :3000                           |
| `npm run build`      | Production build                              |
| `npm run typecheck`  | TypeScript, no emit                           |
| `npm run lint`       | ESLint                                        |
| `npm run db:migrate` | Create + apply a migration                    |
| `npm run db:push`    | Push schema without a migration (prototyping) |
| `npm run db:studio`  | Browse the database in a GUI                  |

---

## What is real

The app deliberately shows nothing it cannot back up. Where a number isn't
measured, the screen says so instead of inventing one.

| Area | Status |
| --- | --- |
| Google sign-in, Terna domain lock, sessions | Real — Postgres via Prisma |
| Aptitude questions, explanations, formula cards | Real content, served from `src/data` (not yet in the DB) |
| Mock test scoring (+4 / −1), timing, review | Real — scored server-side in `/api/aptitude/evaluate` |
| DSA curated problems and LeetCode links | Real content, served from a route handler |
| Codeforces live problems | Real — proxied from the Codeforces API, cached 5 min |
| Practice history, accuracy, streaks, leaderboard | **Not built.** Shown as empty states |
| DSA solve ticks | Session-only, not persisted. The screen says so |

Attempts are not written to the database yet, so results vanish on refresh.
That is Weekend 4 in [PLAN.md](PLAN.md).

### Planned

Three larger features are scheduled from Weekend 5 (see [PLAN.md](PLAN.md)):

- **Question bank** — importer for [AQuA-RAT](https://github.com/google-deepmind/AQuA)
  (Apache 2.0) and [LogiQA 2.0](https://github.com/csitfun/LogiQA2.0_Chinese)
  (CC BY-NC-SA 4.0), behind a draft/approve review screen so nothing unreviewed
  reaches a student. Both datasets require attribution — an `/attributions` page
  ships with the importer.
- **Code runner** — a `CodeRunner` interface written against the Judge0 API
  shape, so the backend is swappable between self-hosted
  [CodeBox](https://github.com/hiteshchoudhary/Codebox) (MIT), Judge0 CE, or a
  hosted Judge0. It needs Docker and cannot run on Vercel.
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

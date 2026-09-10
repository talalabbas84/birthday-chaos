# Birthday Chaos 🔥

A self-running party game for ~50–60 guests: mobile challenge app, a fullscreen
laptop scoreboard, anonymous voting, and a minimal host control panel. Built
with Next.js (App Router), TypeScript, Tailwind, Drizzle ORM, and Neon
Postgres. Realtime-ish updates are done entirely via polling — no
websockets/Redis/third-party auth.

## Surfaces

- `/party/[slug]` — guest mobile app (join → challenges / vote / leaderboard)
- `/party/[slug]/display` — fullscreen laptop scoreboard (rotates automatically)
- `/host/[slug]` — passcode-protected host controls
- `/admin` — **no passcode**, data cleanup dashboard (see below)

## Testing data & cleanup

`/admin` lists every party with guest/completion/point counts and two buttons:

- **Reset test data** — deletes all guests (and everything that cascades off
  them: completions, completion-people, votes), then puts the party back to a
  fresh `LIVE` state. Challenges and vote questions are untouched. This is the
  button to press after you're done test-joining and want a clean party for
  real guests, without re-seeding the challenge catalog.
- **Full reseed** — deletes the party entirely and recreates it from the
  built-in seed data (same as `npm run db:seed`), for when you've also edited
  challenges/vote questions while testing and want to start completely over.

⚠️ **`/admin` has no authentication at all, by design** (you asked for no
password). Anyone with the URL can wipe your party's data — don't share the
link, and consider removing the page (or adding your own gate) once the event
data is finalized and you're done testing.

## 1. Set up Neon Postgres

1. Create a free project at [neon.tech](https://neon.tech) and copy its
   pooled connection string.
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — the Neon connection string
   - `SESSION_SECRET` — any long random string (signs host sessions)
   - `HOST_PASSCODE` — whatever the host should type at `/host/[slug]`
   - `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000` locally, your
     Vercel URL in production (used to render the join QR code)

## 2. Install, migrate, seed

```bash
npm install
npm run db:migrate   # creates tables from the committed drizzle/ migrations
npm run db:seed      # creates the "virgo" party + all challenges + 5 vote questions
```

Re-running `npm run db:seed` is safe — it deletes and recreates the party
with the seeded slug (`SEED_PARTY_SLUG`, default `virgo`) each time, which is
handy for resetting during development. It never touches other parties.

If you change `src/db/schema.ts`, run `npm run db:generate` to create a new
migration file in `drizzle/`, commit it, then `npm run db:migrate` to apply
it locally. (`npm run db:push` still exists for quick schema-diff iteration
against a throwaway dev database, but don't mix it with a database that also
uses migrations — drizzle tracks applied migrations in a table, and `push`
doesn't update that, so the two can drift out of sync.)

## 3. Run it

```bash
npm run dev
```

- Guests: `http://localhost:3000/party/virgo`
- Laptop: `http://localhost:3000/party/virgo/display`
- Host: `http://localhost:3000/host/virgo`

## Deploying

Push to Vercel and set the same four environment variables in the project
settings. No other infra is required — Neon + Vercel is the whole stack.

**Migrations run automatically on every deployment**: `npm run build` is
`npm run db:migrate && next build`, so every Vercel build applies any
pending migrations in `drizzle/` to `DATABASE_URL` before building. This is
what was missing initially (the very first deploy 500'd with `relation
"parties" does not exist` because nothing had ever created the tables) —
now schema changes just need a committed migration file and a normal git
push. Seeding is **not** part of this and stays manual (`npm run db:seed`
locally against the same `DATABASE_URL`, or the `/admin` "Full reseed"
button) so a redeploy mid-party can never wipe live guest data.

One consequence: `npm run build` now needs a **reachable** `DATABASE_URL`,
not just a set one — locally, that means your Neon DB has to actually be
online for `npm run build` (and therefore Vercel deploys) to succeed.

## Testing

```bash
npm run typecheck
npm test
```

`npm test` always runs the pure business-logic tests (levels, name
normalization, session hashing). The database-backed rule tests
(max-completions, unique-person dedupe, idempotent submits, self-vote
prevention, editable one-vote-per-question, quick-check authorization) live in
`tests/business-rules.integration.test.ts` and are skipped unless you point
`TEST_DATABASE_URL` at a disposable Postgres/Neon branch — they create their
own party, run the real rules against it, and delete it afterwards.

## Notes / known trade-offs

- **Database driver**: uses `drizzle-orm/neon-http` (plain HTTP, one request
  per query) rather than the WebSocket `Pool`/`neon-serverless` driver. The
  WebSocket driver doesn't reliably survive Vercel's serverless freeze/thaw
  cycle or Neon's scale-to-zero cold starts and will intermittently throw
  "Connection terminated unexpectedly". The trade-off is no interactive
  multi-statement transactions — `completeChallenge` and
  `respondToVerification` run as sequential statements instead. The unique
  constraint on `requestId` still makes double-submits safe; the only
  residual risk is a very small race window on `maxCompletions` under
  simultaneous duplicate taps, an acceptable trade for a casual party game.
- **Anonymous comments were dropped** from this build per request — the data
  model and "SAY SOMETHING ANONYMOUS" flow from the original spec are not
  implemented.
- **`npm audit`**: `drizzle-orm` currently has an open advisory about SQL
  identifier escaping; this app never builds identifiers from user input (only
  drizzle's query builder / parameterized `sql` templates are used), so
  exposure is low, but run `npm audit fix` and re-test before a from-scratch
  production deploy if you want to be extra safe.
- The app was verified with `npm run typecheck`, `npm run lint`, `npm run
  build`, and the unit test suite in this environment (no live Neon database
  was available to exercise the integration suite or click through the actual
  guest/display/host flows end-to-end) — do a real walkthrough against your
  own Neon database before the party.

# fintrack-recap

Month-end recap for FinTrack: a Hono app with **one** endpoint, called by Vercel Cron, that fans out durable
[Vercel Workflow](https://vercel.com/docs/workflows) runs and emails each opted-in user one PDF per ledger.

## Flow

```
Vercel Cron ── GET /api/cron/month-end-recap ──► Hono (auth, validate, start, return 202)
                                                    │
                                     monthEndRecapInitWorkflow(periodKey)                       WFInit
                                       1. ensurePeriod      → canonical snapshot cutoff (DB)
                                       2. fetchRecipients   → ONE call to the existing users API
                                                              (users + their opted-in ledgers)
                                       3. start one WFUser per user with the whole user record
                                          (bursts of 10, 30s apart), then finish
                                                    │
                          userRecapWorkflow({ id, email, username, ledgers }, periodKey, cutoff)  WFUser
                            1. claim delivery (DB, atomic)            → duplicate/restarted runs stop here
                            2. fetchEntries: all the user's ledgers, in batches, grouped by ledger
                            3. drop ledgers with no entries in that data
                            4. per remaining ledger, in parallel: render PDF → Supabase Storage
                               (a failing ledger never aborts its siblings)
                            5. ONE email with every PDF that succeeded (partial recap)
                            6. finalize delivery row (sent | skipped_empty | failed)
```

Why report generation is a *step*, not its own workflow: it is a single bounded unit of work, steps already give
retries and persisted results, and it avoids ~1,000 extra runs per month. The seam is kept:
`buildLedgerReportStep` can be promoted to a child workflow (`start()` works inside workflows in v5) later.

## Data sources (ports and adapters)

| Port | Production adapter | Notes |
|---|---|---|
| `UserDirectory` | `HttpUserDirectory` | Calls `FINTRACK_USERS_API_URL` once. Response shape lives in `adapters/http/contract.ts`. |
| `EntrySource` | `SupabaseEntrySource` | `ledger_id in (…)`, keyset batches of 1000 by `id`, grouped by ledger. Table/columns in `adapters/supabase/schema.ts`. |
| `RecapLog` | `SupabaseRecapLog` | `recap_periods` (snapshot cutoff) and `recap_deliveries` (claim + outcomes). |
| `ReportStorage` | `SupabaseReportStorage` | Private `recap-reports` bucket. |
| `ReportRenderer` | `ReactPdfRenderer` | Your existing react-pdf components. |
| `Mailer` | `NodemailerMailer` | Gmail SMTP. |

## Idempotency (what guarantees what)

| Concern | Mechanism |
|---|---|
| One data snapshot per month | `recap_periods.cutoff` is assigned by the DB on first insert and never changes; every run reads it back. Entries are filtered by `created_at <= cutoff`. The users+ledgers list is persisted as WFInit's step result. |
| Duplicate cron / manual rerun | Starting WFInit again is harmless: `recap_claim_delivery` (atomic `INSERT … ON CONFLICT`) lets only one run own a `(period, user)`. A finished delivery returns `done`. |
| Crashed run | The claim has a 30 min lease. A `failed` delivery or an expired lease can be reclaimed by the next trigger. |
| Retried step | Deterministic storage key (`{period}/{user}/{ledger}.pdf`) and overwrite, so a retry converges on one object. |
| Email | **At-least-once, effectively once.** SMTP has no idempotency key. The claim prevents concurrent duplicates; a crash in the tiny window between SMTP accepting the message and the `sent` write can re-send after the lease expires. Chosen deliberately: a rare duplicate beats a missing report. |

## Failure policy

- A ledger whose **report** still fails after its retries is recorded (`recap_deliveries.ledger_outcomes`) and left out.
  The email goes out with the rest and names what is missing.
- The **entries fetch** is all-or-nothing per user (one batched read): if it fails after its retries nothing is
  sent and the delivery is `failed`, which the next trigger can reclaim.
- If every ledger with activity fails to render, the delivery is `failed` (reclaimable). A user whose ledgers have
  no entries is `skipped_empty` (final, no email).
- Attachments are capped at 15 MB raw per email; anything over is reported as omitted instead of blocking the send.

## Setup

1. **Database:** apply `supabase/migrations/0001_recap_tables.sql` (tables, claim function, private `recap-reports` bucket).
2. **Users API:** set `FINTRACK_USERS_API_URL` (and `FINTRACK_API_TOKEN` if it needs a bearer token).
3. **Entries:** `src/adapters/supabase/schema.ts` encodes an assumed `entries` table. Adjust it. If entries are
   served by an API instead, add an `EntrySource` adapter and wire it in `container.ts`.
4. **Gmail:** enable 2-Step Verification and create an App Password. Set `SMTP_USER`, `SMTP_APP_PASSWORD`.
   Consumer Gmail allows roughly 500 recipients/day: fine for monthly volume, not for a large user base.
5. **Env:** see `.env.example`. `CRON_SECRET` is required: Vercel sends it as `Authorization: Bearer …`.
6. **Cron:** `vercel.json` runs at `0 1 1 * *` (01:00 UTC on the 1st). Pick `RECAP_TIME_ZONE` so the month has
   *ended* in that zone by then (the endpoint refuses unfinished periods). For zones behind UTC, schedule later.

## Assumptions to confirm

- **Users API shape** (`adapters/http/contract.ts`): an array (or `{ users }` / `{ data }`) of
  `{ id, email, username, locale?, ledgers: [{ id, name, currency }] }`. `currency` is read as an ISO code, or an
  object carrying it as `code`. Malformed records are skipped and counted; if *every* record is malformed the run
  fails loudly (the contract has probably changed). The API sends no `locale`, so `en-US` applies.
- **User ids are UUIDs** (`recap_deliveries.user_id` is `uuid`). Change the column and the `recap_claim_delivery`
  parameter if they are not.
- The users API returns everything in one response (about 100 users x 10 ledgers). If it grows large, page it
  inside `HttpUserDirectory`; nothing else changes.
- Entries are checkpointed twice: once as the fetch step's result and once as each render step's input
  (hundreds of KB per user at most). If that ever matters, fetch inside the render step instead.

## Things to check in your monorepo

- **`@fintrack/report` must be built JavaScript.** The workflow bundler leaves workspace packages as external
  imports and Node loads them as-is, so a package that exports raw `.ts/.tsx` fails at load. Build it to `dist`
  (tsup/tsc/esbuild) and point `main`/`exports` at it.
- **No JSX in code reachable from a step.** The builder preserves JSX, so the renderer adapter uses `createElement`.
- **Template drift** (not changed): the components default to the titles `FINTRACK REPORT` / `SUMMARY` (template
  PDFs say `FINANCIAL REPORT` / `CATEGORY SUMMARY`) and order columns DATE, CATEGORY, DEBIT, CREDIT (template:
  CATEGORY, DATE, CREDIT, DEBIT).
- **Time zones in the PDF:** the date formatters in the components do not pin a zone. Dates are anchored to UTC
  midnight here and rendered on a UTC server (Vercel), which is correct; add a `timeZone` option if that changes.
- Number formatting is fixed at two decimals, which is wrong for zero-decimal currencies such as IDR/JPY.
- Nitro 3 builds with rolldown itself; no `rollup` dependency is needed.

## Operations

- **Rerun a month:** `GET /api/cron/month-end-recap?period=2026-10` with the bearer secret. Already-sent users are skipped.
- **Inspect:** `npx workflow web` / `npx workflow inspect runs`; per-user state is in `recap_deliveries`.
- **Tuning:** `src/workflows/policy.ts` (burst size/delay, lease, attachment budget).
- **Storage growth:** PDFs are kept. Add a retention policy (e.g. delete after 90 days) if you do not need them.

## Develop and test

```bash
npm run typecheck && npm test                 # 33 tests: domain logic, API contract, batching, real PDF rendering
CRON_SECRET=dev RECAP_ADAPTERS=memory npm run dev
curl -H 'Authorization: Bearer dev' 'localhost:3000/api/cron/month-end-recap?period=2026-10'
```

`RECAP_ADAPTERS=memory` seeds four users (normal, one ledger that always fails to render, inactive, no ledgers)
and prints the emails.

## What was verified, and what was not

Verified locally: type-check; 33 unit tests; PDF rendering with the real components; the full Hono + Nitro +
Workflow pipeline on in-memory adapters (user with no ledgers never started, partial recap, inactive user skipped,
three triggers including a concurrent duplicate gave exactly 2 emails); the SQL migration and claim function on
Postgres (PGlite); production `nitro build`.

**Not** verified: the real users API (the contract is assumed), the Supabase entries/storage adapters against a live
project, real Gmail SMTP, and a Vercel deployment (cron delivery, Workflow on the Vercel World, function timeouts).

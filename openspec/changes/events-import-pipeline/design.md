## Context

CSV at `docs/events-research/cycling-events-2026.csv` — 87 rows, 28 columns. Current `events` table has ~11 placeholder rows from `0002_seed.sql`. Public calendar is not useful until real data is loaded.

Supabase Storage bucket `covers` already exists (public). Cover images need to be fetched from external `image_url` values and re-hosted to avoid URL rot.

## Goals / Non-Goals

**Goals:**
- Insert all 87 CSV rows into the `events` table (skipping or flagging competitive-only rows as appropriate)
- Fetch each `image_url`, upload to `covers/{uuid}-{filename}`, write `cover_image_key` back to the event row
- Patch `contact_email`, `contact_phone`, `registration_fee`, `participant_limit` where researchable
- Manually resolve `image_url` for ~26 events currently missing it

**Non-Goals:**
- Schema changes to `events` table
- Automating ongoing event ingestion (this is a one-shot seed)
- Importing the extra CSV columns not in the DB schema

## Decisions

**Standalone Node script over a new Supabase migration**
A migration is for schema changes. Seeding real content via a script (`scripts/seed-events.ts`) is reversible, re-runnable with `--dry-run`, and doesn't pollute the migration history with data. Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.

**Cover image pipeline as second script, not inline**
Two separate scripts: `seed-events.ts` (CSV → DB rows) and `seed-covers.ts` (DB rows → fetch URL → upload Storage → update row). Decoupled so either can be re-run independently if it fails mid-way. Cover upload depends on event rows existing, so ordering is enforced by convention not code.

**Upsert on `name + date_start`, not plain insert**
Re-running the seed must be idempotent. Upsert on `(name, date_start)` unique key prevents duplicates without needing to truncate first.

**Skip competitive events by default, flag via CLI option**
CSV rows with `competitive=true` are skipped unless `--include-competitive` flag is passed. Keeps the public calendar clean while preserving the data.

## Risks / Trade-offs

- **External URL rot** → `image_url` values may already be dead. Mitigation: `seed-covers.ts` logs 404s to a report file; those events remain without cover.
- **Rate limiting** → Fetching 61 images sequentially avoids hammering hosts. Mitigation: 500 ms delay between fetches.
- **Duplicate events on re-run** → Mitigated by upsert strategy.
- **`contact_email` / `contact_phone` enrichment is manual** → No automation possible; researcher fills gaps directly in CSV before running seed.

## Migration Plan

1. Patch CSV manually: fill `contact_email`, `contact_phone`, `registration_fee`, `participant_limit` where findable; resolve ~26 missing `image_url` values.
2. Run `pnpm seed:events` — inserts/upserts all non-competitive rows.
3. Run `pnpm seed:covers` — fetches images, uploads to Storage, patches `cover_image_key`.
4. Verify via admin panel (`/gestore`) that events appear correctly.
5. Optionally delete placeholder seed rows from `0002_seed.sql` era.

Rollback: `DELETE FROM events WHERE created_at > '<seed run timestamp>'`.

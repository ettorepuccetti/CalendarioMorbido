## Why

The 2026 cycling events CSV (`docs/events-research/cycling-events-2026.csv`, 87 rows) exists but is not yet in the database. The public calendar still runs on placeholder seed data. This change closes the gap: load real events into Supabase, upload cover images to Storage, and patch remaining data gaps in the CSV.

## What Changes

- **New**: Supabase seed script that reads the CSV and inserts rows into the `events` table
- **New**: Cover image pipeline — fetch `image_url` per event, upload to Supabase Storage `covers/` bucket, write back `cover_image_key`
- **New**: Enrichment pass for sparse fields (`registration_fee`, `participant_limit`, `contact_email`, `contact_phone`) on aggregator-only rows
- **New**: Manual image resolution for ~26 events without `image_url` (small ciclostoriche — Facebook/Instagram photo pick)

## Capabilities

### New Capabilities

- `csv-seed`: Script to import CSV rows into the `events` table via Supabase
- `cover-image-pipeline`: Fetch remote `image_url` → upload to Supabase Storage `covers/{uuid}-{filename}` → store key in `events.cover_image_key`

### Modified Capabilities

*(none — no existing spec-level behavior changes)*

## Impact

- `supabase/migrations/` or a standalone seed script (TBD in design)
- Supabase Storage bucket `covers` (already exists, public)
- `events` table rows (inserts only, no schema change)
- `docs/events-research/cycling-events-2026.csv` (may be patched with resolved image keys)

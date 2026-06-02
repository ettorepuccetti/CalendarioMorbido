## 1. CSV Preparation

- [ ] 1.1 Manually resolve ~26 missing `image_url` values (Facebook/Instagram photo pick for small ciclostoriche)
- [ ] 1.2 Enrich sparse fields: fill `contact_email`, `contact_phone`, `registration_fee`, `participant_limit` where researchable
- [ ] 1.3 Verify all non-competitive rows have required DB fields (`name`, `date_start`, `date_end`, `event_type`, `city`, `region`, `country`, `website`)

## 2. Seed Script — CSV → events table

- [ ] 2.1 Create `scripts/seed-events.ts` with CSV parser (using `csv-parse` or similar)
- [ ] 2.2 Implement upsert logic on `(name, date_start)` conflict key via Supabase service role client
- [ ] 2.3 Add `--dry-run` flag support (log planned operations, no DB writes)
- [ ] 2.4 Add `--include-competitive` flag support (default: skip `competitive=true` rows)
- [ ] 2.5 Add `seed:events` script to `package.json`
- [ ] 2.6 Run seed, verify row count in Supabase dashboard

## 3. Cover Image Pipeline

- [ ] 3.1 Create `scripts/seed-covers.ts` — fetch `image_url`, upload to `covers/` bucket, update `cover_image_key`
- [ ] 3.2 Skip events with existing non-null `cover_image_key`
- [ ] 3.3 Add 500 ms delay between fetches
- [ ] 3.4 Log failed/skipped URLs to `scripts/cover-failures.log`
- [ ] 3.5 Add `seed:covers` script to `package.json`
- [ ] 3.6 Run pipeline, verify Storage bucket and `cover_image_key` populated on event rows

## 4. Verification

- [ ] 4.1 Check public calendar (`/`) displays real events with correct dates and regions
- [ ] 4.2 Check event detail pages render cover images
- [ ] 4.3 Optionally remove / archive placeholder rows from original seed

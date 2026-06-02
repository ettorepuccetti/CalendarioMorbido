## 1. CSV Preparation

- [ ] 1.1 Manually resolve ~26 missing `image_url` values (Facebook/Instagram photo pick for small ciclostoriche)
- [ ] 1.2 Enrich sparse fields: fill `contact_email`, `contact_phone`, `registration_fee`, `participant_limit` where researchable
- [ ] 1.3 Verify all non-competitive rows have required DB fields (`name`, `date_start`, `date_end`, `event_type`, `city`, `region`, `country`, `website`)

## 2. Seed Script — CSV → events table

- [ ] 2.1 Create `scripts/seed-events.mjs` (ESM, no build step needed)
  - Load `.env.local` manually via `fs.readFileSync` + line-by-line parse (no `dotenv` dep) — same pattern as seed-covers below
  - Use `csv-parse/sync` to read `docs/events-research/cycling-events-2026.csv`
  - Field mapping: `name→title`, `date_start→start_date`, `date_end→end_date`, `website→official_url`, `start_city→start_comune`, `province→start_provincia`; all other CSV columns drop (no DB column)
  - `end_date`: if empty in CSV, set equal to `start_date`
  - Init Supabase client with `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 2.2 Upsert on `(title, start_date)` conflict key — `onConflict: 'title,start_date', ignoreDuplicates: false`
- [ ] 2.3 `--dry-run` flag: log planned rows to console, no DB writes
- [ ] 2.4 `--include-competitive` flag: default skip rows where `competitive === 'competitive'`; keep `non-competitive` and `mixed`
- [ ] 2.5 Add `"seed:events": "node scripts/seed-events.mjs"` to `package.json`
- [ ] 2.6 Run seed, verify row count in Supabase dashboard

## 3. Cover Image Pipeline

- [ ] 3.1 Create `scripts/seed-covers.mjs` (ESM, no build step)
  - Load `.env.local` manually (same pattern as seed-events)
  - Query all events where `cover_image_key IS NULL AND official_url IS NOT NULL`
  - For each event: fetch the `official_url` HTML page with a browser-like `User-Agent`; extract `og:image` or `twitter:image` meta tag via regex (try both `property=og:image` and `content=` attribute orderings)
  - Fallback: if `og:image` not found on `official_url`, try `image_url` column value directly as image source
  - Download image bytes, detect extension from `Content-Type` header
  - Upload to Supabase Storage `covers` bucket at path `covers/{uuid}-{slugified-name}.{ext}` using service role client
  - `UPDATE events SET cover_image_key = '<path>' WHERE id = '<id>'`
- [ ] 3.2 Skip events where `cover_image_key IS NOT NULL`
- [ ] 3.3 `await new Promise(r => setTimeout(r, 500))` between each fetch
- [ ] 3.4 Append failed event names + URLs to `scripts/cover-failures.log` (don't throw — continue to next)
- [ ] 3.5 Add `"seed:covers": "node scripts/seed-covers.mjs"` to `package.json`
- [ ] 3.6 Run pipeline, verify Storage bucket and `cover_image_key` populated on event rows

## 4. Verification

- [ ] 4.1 Check public calendar (`/`) displays real events with correct dates and regions
- [ ] 4.2 Check event detail pages render cover images
- [ ] 4.3 Optionally remove / archive placeholder rows from original seed

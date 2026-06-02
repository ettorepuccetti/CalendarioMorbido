# Tasks: Real 2026 Cycling Events Dataset

## Research

- [x] Scrape Battistrada for Italian cyclo-tourism events (bulk pass)
- [x] Add QuiCicloturismo / Prestigio circuit events
- [x] Add Fiera del Cicloturismo entries (gravel, bikepacking, festivals)
- [x] Add Eroica / Nova Eroica events
- [x] Hand-pick round 2 events: Tuscany Trail, La Chianina UBA, AUGH, G.Round Parma/Padova, Sterro Appalla

## Filtering

- [x] Remove competitive granfondo (24 events dropped — Prestigio circuit, Nove Colli, Maratona dles Dolomites, Fausto Coppi, Strade Bianche GF, …)
- [x] Flag borderline competitive entries in `competitive` column rather than dropping

## Enrichment (pass 2)

- [x] Populate `image_url` — reached 61/87 (70 %)
- [x] Populate `instagram` — reached 58/87
- [x] Populate `facebook` — combined social coverage 65/87
- [x] Confirm `website` is official (not aggregator) — 74/87

## Documentation

- [x] Write `docs/events-research/README.md` with column reference, sources, caveats

## Pending (not in scope of this change)

- [ ] Import pipeline: load CSV rows into `events` table via Supabase seed script
- [ ] Cover image pipeline: fetch `image_url` → upload to Supabase Storage `covers/` bucket
- [ ] Enrich sparse fields: `registration_fee`, `participant_limit`, `email`, `phone` for aggregator-only rows
- [ ] Resolve ~26 events without `image_url` (small ciclostoriche — requires manual Facebook/Instagram photo pick)

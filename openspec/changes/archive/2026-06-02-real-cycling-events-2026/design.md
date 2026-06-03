## Context

Placeholder seed data (`0002_seed.sql`, ~11 events) was insufficient for a real product demo or user testing. A curated 2026 dataset was needed to make the public calendar useful and credible.

Research sources: Battistrada aggregator, QuiCicloturismo, Fiera del Cicloturismo, Nova Eroica/Eroica official sites, per-event official websites.

## Goals / Non-Goals

**Goals:**
- Produce a CSV dataset of real Italian non-competitive cycling events for 2026
- Cover all macro-regions of Italy
- Capture fields needed by the `events` DB schema plus enrichment columns for future pipelines
- Reach ≥ 60 % `image_url` coverage to enable automated cover seeding

**Non-Goals:**
- Automated import into Supabase (separate pipeline, out of scope)
- Cover image upload to Storage (separate pipeline, out of scope)
- Ongoing maintenance or scraping automation

## Decisions

**Manual research over automated scraping**
Aggregators (Battistrada, QuiCicloturismo) do not expose public APIs and use anti-scraping measures. Manual two-pass research produced higher-quality data with per-row source attribution. Trade-off: slower, not repeatable without effort.

**CSV wider than DB schema**
Extra columns (`competitive`, `terrain`, `bike_type`, `distances_km`, `elevation_gain_m`, `instagram`, `facebook`, `source`, etc.) are captured now at low marginal cost. Importing only what the schema needs today and discarding the rest would waste research effort. Future import pipelines read the same CSV without re-research.

**Flag competitive events, don't drop silently**
24 granfondo (Prestigio circuit, Nove Colli, Maratona dles Dolomites, Fausto Coppi, Strade Bianche GF…) were excluded from the target audience but marked `competitive=true` rather than removed. Keeps the dataset auditable; future filter UI can surface or hide them.

**Two-pass enrichment**
Pass 1: bulk fields from aggregators (name, date, region, website). Pass 2: per-event official site + Instagram search for `image_url`, social handles, missing details. Avoids re-visiting aggregators for enrichment fields.

## Risks / Trade-offs

- **URL rot** → `image_url` values point to third-party domains; some will break before the import pipeline runs. Mitigation: import pipeline fetches + uploads to Supabase Storage, decoupling the app from external URLs.
- **Data accuracy** → Event details (dates, distances) sourced from early-season announcements; organizers may update. Mitigation: `source` column per row enables re-verification.
- **Coverage gaps** → ~26 events without `image_url` (mostly small ciclostoriche with no web presence). Mitigation: manual Facebook/Instagram photo pick deferred to import pipeline work.

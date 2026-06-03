# Proposal: Real 2026 Cycling Events Dataset

**Status:** implemented (commit 9bfaa84)
**Source doc:** `docs/events-research/`

## Intent

Replace placeholder/seed events with a real, curated dataset of 87 Italian non-competitive cycling events for the 2026 season. Also prepare cover image seeding by capturing `image_url` per event.

## Scope

- **In:** cicloturistiche, ciclostoriche, randonnée, gravel, bikepacking, festival, night rides
- **Out:** competitive granfondo (Prestigio circuit, Nove Colli, Maratona dles Dolomites, etc.) — 24 dropped
- **Border cases:** events flagged `competitive` in the dataset are kept but filterable

## Requirements

1. Dataset covers all Italian macro-regions.
2. Each row maps to the current `events` table schema (plus extra research columns for future use).
3. `image_url` populated where possible — target ≥ 60 % coverage — to enable automated cover seeding.
4. Social fields (`instagram`, `facebook`) captured for outreach and fallback images.
5. Source documented per row for traceability.
6. Competitive events clearly flagged, not silently removed.

## Design approach

Manual web research across aggregators (Battistrada, QuiCicloturismo, Fiera del Cicloturismo) and official event sites. Dataset intentionally wider than the DB schema — extra columns available for a future import pipeline without re-research.

Two-pass enrichment:
1. Bulk scrape from aggregators → core fields
2. Per-event official site + Instagram search → `image_url`, social handles, missing details

## Artifact

`docs/events-research/cycling-events-2026.csv` — 87 rows, 28 columns.

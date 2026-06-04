## ADDED Requirements

### Requirement: CSV rows inserted into events table
The seed script SHALL read `docs/events-research/cycling-events-2026.csv` and upsert each non-competitive row into the `events` table using `(name, date_start)` as the conflict key.

#### Scenario: Successful seed run
- **WHEN** `pnpm seed:events` is executed with valid Supabase credentials
- **THEN** all non-competitive CSV rows are present in the `events` table

#### Scenario: Re-run is idempotent
- **WHEN** `pnpm seed:events` is run a second time without CSV changes
- **THEN** no duplicate rows are created and existing rows are updated in place

---

### Requirement: Competitive events skipped by default
The seed script SHALL skip rows where `competitive=true` unless `--include-competitive` flag is passed.

#### Scenario: Default run excludes competitive events
- **WHEN** `pnpm seed:events` is run without flags
- **THEN** no row with `competitive=true` is inserted

#### Scenario: Flag includes competitive events
- **WHEN** `pnpm seed:events --include-competitive` is run
- **THEN** rows with `competitive=true` are also upserted

---

### Requirement: Dry-run mode available
The seed script SHALL support a `--dry-run` flag that logs planned inserts without writing to the database.

#### Scenario: Dry run produces no DB changes
- **WHEN** `pnpm seed:events --dry-run` is executed
- **THEN** no rows are inserted or updated in the `events` table and planned operations are logged to stdout

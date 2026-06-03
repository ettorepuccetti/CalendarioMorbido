## ADDED Requirements

### Requirement: Dataset covers all Italian macro-regions
The dataset SHALL include events distributed across all Italian macro-regions (Nord-Ovest, Nord-Est, Centro, Sud, Isole).

#### Scenario: Regional coverage verified
- **WHEN** the CSV is inspected by region
- **THEN** at least one event exists for each Italian macro-region

---

### Requirement: Each row maps to the events DB schema
Every row in `docs/events-research/cycling-events-2026.csv` SHALL include all fields required by the `events` table (`name`, `date_start`, `date_end`, `event_type`, `city`, `region`, `country`, `website`).

#### Scenario: Schema-required fields present
- **WHEN** the CSV is loaded and validated
- **THEN** no row has a null value in any DB-required column

---

### Requirement: image_url coverage ≥ 60%
The dataset SHALL have `image_url` populated for at least 60% of rows to enable automated cover image seeding.

#### Scenario: Image URL coverage threshold met
- **WHEN** the CSV rows are counted
- **THEN** at least 60% of rows have a non-empty `image_url` value

---

### Requirement: Competitive events flagged, not dropped
Events identified as competitive granfondo SHALL be marked with `competitive=true` in the dataset rather than silently removed.

#### Scenario: Competitive flag present on excluded events
- **WHEN** a competitive event (e.g. Nove Colli, Maratona dles Dolomites) is in the dataset
- **THEN** its `competitive` column is set to `true`

#### Scenario: Non-competitive events have flag false or empty
- **WHEN** a cicloturistica or randonneé event is in the dataset
- **THEN** its `competitive` column is `false` or empty

---

### Requirement: Source attribution per row
Each row SHALL have a `source` column documenting where the event data was obtained (aggregator URL or official site URL) for traceability and re-verification.

#### Scenario: Source column populated
- **WHEN** any row is inspected
- **THEN** the `source` column is non-empty

---

### Requirement: Extra enrichment columns captured
The CSV SHALL include enrichment columns beyond the current `events` schema (`instagram`, `facebook`, `terrain`, `bike_type`, `distances_km`, `elevation_gain_m`, `registration_url`, etc.) to avoid re-research when import pipelines are built.

#### Scenario: Enrichment columns present in CSV header
- **WHEN** the CSV header is read
- **THEN** all 28 documented columns are present

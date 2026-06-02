## ADDED Requirements

### Requirement: Cover images fetched and uploaded to Supabase Storage
The cover image script SHALL fetch the remote image at each event's `image_url`, upload it to the `covers` Storage bucket at path `covers/{uuid}-{original-filename}`, and update `events.cover_image_key` with the resulting key.

#### Scenario: Successful image upload
- **WHEN** `pnpm seed:covers` is executed and an event has a reachable `image_url`
- **THEN** the image is uploaded to Storage and `cover_image_key` is set on the event row

#### Scenario: Unreachable URL is skipped
- **WHEN** fetching an `image_url` returns a 4xx or 5xx response
- **THEN** that event is skipped, a warning is logged, and the script continues with remaining events

---

### Requirement: Already-uploaded covers are not re-fetched
The script SHALL skip events that already have a non-null `cover_image_key`.

#### Scenario: Re-run skips already-uploaded events
- **WHEN** `pnpm seed:covers` is run after a partial upload
- **THEN** only events with null `cover_image_key` are processed

---

### Requirement: Rate-limited fetching
The script SHALL wait at least 500 ms between successive HTTP fetches to avoid overloading source hosts.

#### Scenario: Delay between fetches
- **WHEN** the script processes multiple events sequentially
- **THEN** each fetch is separated by at least 500 ms

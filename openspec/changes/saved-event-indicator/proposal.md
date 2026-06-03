## Why

`EventCard` already supports a `saved` prop and renders a "Nel mio calendario" badge. `EventCalendar` (public home) already passes `saved` correctly. But `EventGrid` — used in `/calendario` tab "Salvati" — has no `savedIds` prop, so cards on the personal calendar never show the saved badge. Users can't tell at a glance that an event is saved when viewing their own calendar.

## What Changes

- Add optional `savedIds?: string[]` prop to `EventGrid`
- Pass `saved={savedIds.includes(event.id)}` down to each `EventCard`
- Update `/calendario` page to pass `savedIds` derived from the fetched saved events

## Capabilities

### New Capabilities

- `saved-event-indicator`: EventGrid can receive a saved-IDs set and renders the saved badge on matching EventCard instances

### Modified Capabilities

<!-- none — EventCard already supports `saved`; no spec-level behavior change there -->

## Impact

- Modified: `src/components/events/EventGrid.tsx`
- Modified: `src/app/calendario/page.tsx`
- No DB, no auth, no API changes

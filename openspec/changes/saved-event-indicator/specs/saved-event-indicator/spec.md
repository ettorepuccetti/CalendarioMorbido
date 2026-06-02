## ADDED Requirements

### Requirement: EventGrid accepts saved context
`EventGrid` SHALL accept an optional `savedIds` prop (string array, default empty) and pass `saved={savedIds.includes(event.id)}` to each rendered `EventCard`.

#### Scenario: Saved event in grid shows badge
- **WHEN** `EventGrid` renders with `savedIds` containing an event's ID
- **THEN** the corresponding `EventCard` renders with `saved={true}` and the "Nel mio calendario" badge is visible

#### Scenario: Default behaviour unchanged
- **WHEN** `EventGrid` renders without `savedIds` prop
- **THEN** no card shows the saved badge (backwards-compatible default)

### Requirement: Personal calendar wires saved IDs
The `/calendario` page SHALL pass the IDs of all saved events to `EventGrid` so the badge renders in the "Salvati" tab.

#### Scenario: Saved tab shows badge on all cards
- **WHEN** authenticated user views `/calendario?tab=salvati`
- **THEN** every event card displays the "Nel mio calendario" badge

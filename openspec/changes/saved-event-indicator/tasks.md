## 1. EventGrid

- [ ] 1.1 Add `savedIds?: string[]` prop to `EventGrid` (default `[]`)
- [ ] 1.2 Pass `saved={savedIds.includes(event.id)}` to each `<EventCard>` inside the grid

## 2. Personal Calendar Page

- [ ] 2.1 In `src/app/calendario/page.tsx`, derive `savedIds = savedEvents.map(e => e.id)`
- [ ] 2.2 Pass `savedIds={savedIds}` to `<EventGrid>` in the "Salvati" tab render path

## 3. Verify

- [ ] 3.1 Run `pnpm dev`, open `/calendario?tab=salvati` as logged-in user with saved events — confirm badge "Nel mio calendario" appears on every card
- [ ] 3.2 Open `/` — confirm public calendar cards are unaffected (no badge on unsaved events)

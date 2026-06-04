## Context

`EventCard` (line 41-45) renders a `chip chip-active` badge when `saved=true`. `EventCalendar` already wires this for the public calendar. `EventGrid` does not accept saved context. On `/calendario` tab "Salvati", all listed events ARE saved — the IDs come from the `saved_events` join — but the badge never shows because `saved` is never passed.

## Goals / Non-Goals

**Goals:**
- Badge renders on EventCard inside EventGrid when the event is in the user's saved set
- Zero visual change to EventCard or badge styling

**Non-Goals:**
- No changes to EventCalendar, EventCard, or the public home page
- No new DB queries — the IDs are already fetched in `calendario/page.tsx`
- No SaveButton interaction changes

## Decisions

**Add `savedIds?: string[]` to EventGrid (not `allSaved: boolean`)**
Using IDs is consistent with how EventCalendar does it (`saved.has(e.id)`). `allSaved` would be a shortcut that only works for this one page; if EventGrid is ever reused elsewhere the IDs approach is correct. Overhead: negligible for small datasets.

**Pass IDs from `calendario/page.tsx`**
The page already has `savedEvents` array. Derive: `savedEvents.map(e => e.id)`. No extra query needed.

## Risks / Trade-offs

None. Two-file change, purely additive — default `savedIds=[]` means existing callers unchanged.

## Migration Plan

Static change, no migration. Deploy = Vercel auto-deploy.

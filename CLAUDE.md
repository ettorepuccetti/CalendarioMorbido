# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

CalendarioMorbido is a **web application for tracking non-competitive cyclo-tourism events in Italy**. The project is currently in the **design/planning phase** — functional analysis, wireframes, and architectural decisions are complete, but no implementation code exists yet. There are no build commands, test suites, or package configuration files.

## Repository Structure

```
docs/
├── functional-analysis.md               # MVP requirements, user roles, feature specs
└── implementation-analysis/
    ├── implementation-analysis.md       # Index — stack, auth, data model, API surface
    ├── stack.md                         # Hosting, framework, DB, map, migrations
    ├── authentication.md               # Auth options comparison and decision
    ├── model-proposal.md               # Drizzle schema, tables, enums, design notes
    └── api-surface.md                  # REST endpoints, pagination, approval flow

prototype/wireframes/SINTESI.md          # Wireframe analysis with pros/cons per screen
prototype/wireframes/calendariomorbido-wireframes.html  # Interactive HTML prototype
```

## Tech Stack (decided)

| Layer | Choice |
| --- | --- |
| Hosting | Railway (all services) |
| Frontend | Next.js (TypeScript), server-side rendered |
| Backend | Fastify (TypeScript), separate Railway service |
| Database | PostgreSQL on Railway |
| ORM / Migrations | Drizzle ORM + drizzle-kit |
| Auth | Better Auth (self-hosted, runs inside Fastify) |
| Map rendering | MapLibre GL JS |
| Map tiles | MapTiler (free tier, OSM-based) |
| Blob storage | Provider-agnostic via `StorageService` interface (key-based, not URL-based) |

Migrations run as a pre-start command on Railway: `npx drizzle-kit migrate && node server.js`.

## Domain

### User Roles

- **Guest**: browse public event calendar, apply filters, view event details and map
- **Registered User**: save events to personal calendar, propose new events, track proposal status (pending / approved / rejected)
- **Administrator**: approve or reject proposals via direct DB access (MVP)

### Data Model (summary)

- **`events`** — published events only. Created atomically when an admin approves a proposal.
- **`proposals`** — user submissions. Status: `pending | approved | rejected`. Mirrors all event fields.
- **`saved_events`** — junction table (userId × eventId) for personal calendars.
- Better Auth manages `user`, `session`, `account`, `verification` tables. The `user` table is extended with a `role` field (`user | admin`).

Blob storage uses a `coverImageKey` (e.g. `"covers/abc123.jpg"`) rather than a full URL. The `StorageService` resolves keys to presigned URLs at runtime — swapping providers requires no DB migration.

### API Surface (summary)

REST API under `/api`. Paginated responses use an envelope: `{ data, total, page, limit }`.

- `GET /api/events` — public event list (filters: region, type)
- `GET /api/events/map` — lightweight marker payload for the map
- `GET /api/events/:id` — event detail
- `GET|PUT|DELETE /api/me/saved-events` — personal calendar management
- `GET|POST /api/me/proposals` — user's own proposals
- `GET|PATCH /api/admin/proposals` — admin approval queue
- `POST /api/uploads/presign` — presigned URL for direct image upload

Full endpoint details: `docs/implementation-analysis/api-surface.md`.

## Design (open decisions)

The wireframes explore two layout variants per screen — none have been chosen yet:

| Screen | Variant A | Variant B |
| --- | --- | --- |
| Public Calendar | Density (list-heavy) | Visual exploration (card grid) |
| Map View | Immersive (map primary) | Hybrid (split map/list) |
| Event Details | Hero image layout | Structured card layout |
| Personal Calendar | Agenda view | Grid with tabs |
| Propose Event | Single long form | Step wizard |
| Admin Queue | Inline actions | Single-event review |

Other open design questions: mandatory vs optional fields in the proposal form, login/registration flow.

Mobile-first. Warm paper aesthetic with cycling-green hi-vis accent. Italian-language UI throughout.

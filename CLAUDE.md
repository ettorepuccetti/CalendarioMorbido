# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

CalendarioMorbido is a **web application for tracking non-competitive cyclo-tourism events in Italy**. The project is currently in the **design/planning phase** — functional analysis and wireframes are complete, but no implementation code exists yet. There are no build commands, test suites, or package configuration files.

## Repository Structure

```
docs/functional-analysis.md              # MVP requirements, user roles, feature specs
prototype/wireframes/SINTESI.md          # Wireframe analysis with pros/cons per screen
prototype/wireframes/calendariomorbido-wireframes.html  # Interactive HTML prototype
```

## Domain & Architecture

### User Roles

- **Guest**: browse public event calendar, apply filters, view event details and map
- **Registered User**: save events to personal calendar, propose new events, track proposal status (pending/approved/rejected)
- **Administrator**: review and approve/reject user-submitted proposals

### Core Data Model

Events have: date range, start/end location, official link, cover image. Filters operate on duration (single-day vs multi-day) and region.

### Key Design Decisions (from wireframes)

The wireframes explore two layout variants per screen (6 screens total). These remain **undecided** and must be chosen before implementation:

| Screen | Variant A | Variant B |
|--------|-----------|-----------|
| Public Calendar | Density (list-heavy) | Visual exploration (card grid) |
| Map View | Immersive (map primary) | Hybrid (split map/list) |
| Event Details | Hero image layout | Structured card layout |
| Personal Calendar | Agenda view | Grid with tabs |
| Propose Event | Single long form | Step wizard |
| Admin Queue | Inline actions | Single-event review |

Open questions before implementation: mandatory vs optional fields in the proposal form, login/registration flow design, map's role (primary vs secondary navigation).

### Design Language

Mobile-first. Warm paper aesthetic with cycling-green hi-vis accent. Italian-language UI throughout.

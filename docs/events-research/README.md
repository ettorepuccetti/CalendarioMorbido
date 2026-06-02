# Cycling events research (2026 season)

Web/social research of Italian (and a few cross-border reference) cycling events
aligned with CalendarioMorbido's scope: **non-competitive cyclo-tourism** —
cicloturistiche, ciclostoriche, randonnée, gravel gatherings, bikepacking trails,
bike festivals/bike days, charity/night pedalate.

- Data file: [`cycling-events-2026.csv`](./cycling-events-2026.csv)
- Events: 87 — predominantly Italy, all macro-regions represented.
- Collected: June 2026. Editions refer to the **2026** season.

> **Competitive granfondo were removed** on request: the dataset now keeps only
> events with a non-competitive spirit. The 24 dropped granfondo (Prestigio
> circuit etc. — Nove Colli, Maratona dles Dolomites, Fausto Coppi, Strade
> Bianche GF, …) can be re-added later if a competitive section is ever wanted.
> A few non-granfondo competitive entries (MTB race, ultra, climb TT) are kept
> but flagged in `competitive` so they are easy to filter.

## Purpose

This is a research dataset, **not** an import file. It intentionally captures
more fields than the current data model (`docs/implementation-analysis/model-proposal.md`)
so the extra columns are available when we later build an import pipeline.

## Columns

| Column | Notes |
| --- | --- |
| `name` | Event name (kept in original Italian where that is the brand). |
| `edition_year` | Always 2026 here. |
| `date_start` / `date_end` | ISO `YYYY-MM-DD`. `date_end` empty for single-day events. |
| `event_type` | cicloturistica, ciclostorica, randonnee, granfondo, gravel, bikepacking, trail, festival/bike days, night ride/pedalata, MTB, etc. |
| `competitive` | `non-competitive` \| `mixed` (timed + free, or granfondo with a cicloturistica option) \| `competitive`. Useful to filter what truly fits the portal. |
| `terrain` | road / gravel / MTB / white roads / mixed. |
| `bike_type` | road / gravel / MTB / vintage / e-bike / any. |
| `start_city`, `province`, `region`, `country` | Region names in Italian (Toscana, Lombardia, …) to match an IT portal. |
| `distances_km` | Slash-separated route options, longest first (e.g. `205/130/60`). |
| `elevation_gain_m` | Per route, same order as distances, when known. |
| `start_time`, `participant_limit`, `registration_fee`, `registration_deadline` | Filled only where the source exposed them. |
| `registration_url`, `website`, `email`, `phone` | Contact / sign-up channels. `website` is often the aggregator when no official domain was confirmed. |
| `instagram`, `facebook` | Social profiles (split out from a single `social` column). |
| `image_url` | A characteristic image for the event (hero photo where possible, otherwise the event logo/poster). Direct image URL, ready to fetch/cache. |
| `organizer` | Club / società organizzatrice. |
| `circuit` | Series the event belongs to (Prestigio di Cicloturismo, Eroica & Nova Eroica, Giro d'Italia d'Epoca, …). |
| `first_edition` | Year of first edition when known. |
| `description` | Short editorial note. |
| `source` | Where the row was sourced (aggregator or official site). |

## Sources

- **Battistrada** — battistrada.com (large IT cyclo-tourism calendar; rich detail pages)
- **QuiCicloturismo** — quicicloturismo.it (Gran Fondo 2026 calendar + Prestigio circuit)
- **Fiera del Cicloturismo** — fieradelcicloturismo.it (events map, gravel/bikepacking/festival)
- **Eroica** — eroica.cc (L'Eroica + Nova Eroica)
- **Bikeitalia** — bikeitalia.it (2026 highlights)
- **Maratona dles Dolomites** — maratona.it (official detail)
- Plus single-event official sites and local press (ideawebtv.it, sportiamoci.it, comune.arignano.to.it).

## Recently added (round 2)

Hand-picked events sourced mainly via Instagram/official sites:
**Tuscany Trail**, **La Chianina UBA** (Unconventional Bike Adventure),
**AUGH – Umbria Bikepacking**, **G.Round Parma** & **G.Round Padova** and
**Sterro Appalla** (both by BBP Gravel Firenze).

## Image & social coverage

After a dedicated enrichment pass (per-event official sites + Instagram search):

- `image_url`: **61/87** (hero photo where available, otherwise event poster/logo)
- `instagram`: **58/87**
- any social (`instagram` OR `facebook`): **65/87**
- official website (non-aggregator): **74/87**

The ~26 events still without an image are small local **ciclostoriche** whose
sites expose only a logo or no `og:image` at all — each would need a manual photo
pick from their Facebook/Instagram feed. They all carry a website/social link as
fallback. Note: many small ciclostoriche use **Facebook**, not Instagram, so the
`facebook` column is the right channel for those.

## Caveats / TODO

- Some dates are provisional (organizers had not confirmed 2026 at research time);
  ciclostorica dates in particular may shift by a week.
- `registration_fee`, `participant_limit`, `email`, `phone` are still sparse for
  aggregator-only events; enrich from official sites/Instagram before import.
- A handful of clearly **competitive** entries (MTB races, ultra, climb TT) are kept
  but flagged in `competitive` so they can be filtered out of the public calendar.
- 1 non-Italy reference row (Nova Eroica Svizzera) is flagged in `country`.
- Battistrada lists ~560 IT events; this set is a curated, well-filled sample across
  all types/regions, not an exhaustive dump.

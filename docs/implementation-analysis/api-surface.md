# API Surface

Protocollo: **REST**. Base path: `/api`.

## Convenzioni

### Paginazione

Tutte le liste paginate restituono un envelope standard:

```json
{
  "data": [...],
  "total": 120,
  "page": 1,
  "limit": 20
}
```

### Autenticazione

Gli endpoint protetti richiedono il JWT di sessione rilasciato da Better Auth nell'header:

```
Authorization: Bearer <token>
```

### Errori

```json
{
  "error": "PROPOSAL_NOT_FOUND",
  "message": "La proposta richiesta non esiste."
}
```

---

## Events (pubblici)

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/events` | No |
| `GET` | `/api/events/map` | No |
| `GET` | `/api/events/:id` | No |

### `GET /api/events`

Query params:

| Param | Tipo | Default |
| --- | --- | --- |
| `region` | `RegionEnum` | — |
| `type` | `"single" \| "multi"` | — |
| `page` | `number` | `1` |
| `limit` | `number` | `20` |

### `GET /api/events/map`

Payload leggero per i marker della mappa, senza paginazione.

```json
[
  {
    "id": "...",
    "title": "...",
    "startDate": "2026-06-01",
    "endDate": "2026-06-03",
    "startLat": 46.07,
    "startLng": 11.12,
    "endLat": 45.90,
    "endLng": 10.89
  }
]
```

---

## Auth (gestito da Better Auth)

```
POST  /api/auth/sign-up
POST  /api/auth/sign-in
POST  /api/auth/sign-out
POST  /api/auth/reset-password
POST  /api/auth/verify-email
```

---

## Calendario personale (utente autenticato)

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/me/saved-events` | Sì |
| `PUT` | `/api/me/saved-events/:eventId` | Sì |
| `DELETE` | `/api/me/saved-events/:eventId` | Sì |

---

## Proposte (utente autenticato)

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/me/proposals` | Sì |
| `GET` | `/api/me/proposals/:id` | Sì |
| `POST` | `/api/proposals` | Sì |

### `POST /api/proposals`

```json
{
  "title": "Granfondo Dolomiti",
  "description": "...",
  "startDate": "2026-06-01",
  "endDate": "2026-06-03",
  "region": "Trentino-Alto Adige",
  "officialUrl": "https://...",
  "coverImageKey": "covers/abc123.jpg",
  "startLocationName": "Trento, TN",
  "startLat": 46.07,
  "startLng": 11.12,
  "endLocationName": "Riva del Garda, TN",
  "endLat": 45.88,
  "endLng": 10.84
}
```

`endLocationName`, `endLat`, `endLng` sono opzionali — omessi per percorsi circolari.

---

## Admin

| Method | Path | Auth |
| --- | --- | --- |
| `GET` | `/api/admin/proposals` | Admin |
| `GET` | `/api/admin/proposals/:id` | Admin |
| `PATCH` | `/api/admin/proposals/:id` | Admin |

### `GET /api/admin/proposals`

Query params:

| Param | Tipo | Default |
| --- | --- | --- |
| `status` | `"pending" \| "approved" \| "rejected"` | `"pending"` |
| `page` | `number` | `1` |
| `limit` | `number` | `20` |

### `PATCH /api/admin/proposals/:id`

```json
{ "action": "approve" }
```

```json
{ "action": "reject", "rejectionReason": "Evento già presente nel calendario." }
```

Quando `action: "approve"`, il backend esegue in un'unica transazione:
1. Copia i campi dalla proposta e crea il record in `events`
2. Imposta `proposals.status = "approved"`, `proposals.reviewedAt = now()`, `proposals.eventId = <nuovo id>`

---

## Storage

| Method | Path | Auth |
| --- | --- | --- |
| `POST` | `/api/uploads/presign` | Sì |

### `POST /api/uploads/presign`

Il backend genera una presigned URL tramite il `StorageService`. Il frontend carica direttamente sul provider e poi include la `key` nel body della proposta.

**Response:**
```json
{
  "key": "covers/abc123.jpg",
  "uploadUrl": "https://..."
}
```

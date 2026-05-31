# Data Model — Proposta

## Decisioni preliminari

| Tema | Decisione |
| --- | --- |
| Proposals vs Events | Tabelle separate — la tabella pubblica `events` contiene solo eventi approvati |
| Coordinate | Map picker (lat/lng espliciti); campo `locationName` compatibile con geocoding futuro senza migrazioni |
| Blob storage | Chiave opaca (`coverImageKey`) risolta in URL dal `StorageService` — provider intercambiabile |

---

## Tabelle Better Auth (generate automaticamente)

Better Auth con Drizzle genera e gestisce autonomamente:

- `user` — id, email, name, emailVerified, createdAt — estesa con il campo `role`
- `session`, `account`, `verification`

Il campo `role: 'user' | 'admin'` viene aggiunto come estensione sulla tabella `user` tramite il sistema di plugin di Better Auth.

---

## Schema Drizzle

### Enums

```ts
const regionEnum = pgEnum('region', [
  'Valle d\'Aosta', 'Piemonte', 'Lombardia', 'Trentino-Alto Adige',
  'Veneto', 'Friuli-Venezia Giulia', 'Liguria', 'Emilia-Romagna',
  'Toscana', 'Umbria', 'Marche', 'Lazio', 'Abruzzo', 'Molise',
  'Campania', 'Puglia', 'Basilicata', 'Calabria', 'Sicilia', 'Sardegna',
])

const proposalStatusEnum = pgEnum('proposal_status', [
  'pending', 'approved', 'rejected',
])
```

### events

Solo eventi approvati e pubblicati.

```ts
const events = pgTable('events', {
  id:                uuid().primaryKey().defaultRandom(),
  proposalId:        uuid().references(() => proposals.id).unique(),

  title:             text().notNull(),
  description:       text(),
  startDate:         date().notNull(),
  endDate:           date().notNull(),
  region:            regionEnum().notNull(),
  officialUrl:       text(),
  coverImageKey:     text(),            // es. "covers/abc123.jpg"

  startLocationName: text().notNull(),  // label display + input geocoding futuro
  startLat:          numeric({ precision: 9, scale: 6 }).notNull(),
  startLng:          numeric({ precision: 9, scale: 6 }).notNull(),

  endLocationName:   text(),            // null = percorso circolare
  endLat:            numeric({ precision: 9, scale: 6 }),
  endLng:            numeric({ precision: 9, scale: 6 }),

  createdAt:         timestamp().defaultNow().notNull(),
  updatedAt:         timestamp().defaultNow().notNull(),
})
```

### proposals

Proposte utente con ciclo di vita pending → approved | rejected.

```ts
const proposals = pgTable('proposals', {
  id:                uuid().primaryKey().defaultRandom(),
  userId:            text().notNull().references(() => user.id),
  status:            proposalStatusEnum().default('pending').notNull(),
  rejectionReason:   text(),

  title:             text().notNull(),
  description:       text(),
  startDate:         date().notNull(),
  endDate:           date().notNull(),
  region:            regionEnum().notNull(),
  officialUrl:       text(),
  coverImageKey:     text(),

  startLocationName: text().notNull(),
  startLat:          numeric({ precision: 9, scale: 6 }).notNull(),
  startLng:          numeric({ precision: 9, scale: 6 }).notNull(),

  endLocationName:   text(),
  endLat:            numeric({ precision: 9, scale: 6 }),
  endLng:            numeric({ precision: 9, scale: 6 }),

  submittedAt:       timestamp().defaultNow().notNull(),
  reviewedAt:        timestamp(),
})
```

### saved_events

Calendario personale degli utenti registrati.

```ts
const savedEvents = pgTable('saved_events', {
  userId:  text().notNull().references(() => user.id),
  eventId: uuid().notNull().references(() => events.id),
  savedAt: timestamp().defaultNow().notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.eventId] })])
```

---

## Note di design

**`startLocationName` / `endLocationName`** — nel map picker l'utente digita un'etichetta testuale e sceglie le coordinate sulla mappa. Con il geocoding server-side futuro, lo stesso campo riceve l'indirizzo digitato e le coordinate vengono calcolate dal backend. Nessuna migrazione necessaria.

**`coverImageKey`** — stringa opaca (es. `"covers/abc123.jpg"`). Il `StorageService` nel backend la risolve in una presigned URL. Il frontend non conosce mai il provider sottostante.

**`proposalId` su `events`** — FK opzionale verso la proposta originale per tracciabilità. Impostato dall'admin al momento dell'approvazione.

**`endLocationName/Lat/Lng` nullable** — supporta percorsi circolari in cui partenza e arrivo coincidono.

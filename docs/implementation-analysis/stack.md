# Architettura Tecnica — CalendarioMorbido

## Stack Finale

```
Railway
├── Next.js (TypeScript)        → Frontend
├── Fastify (TypeScript)        → API Backend
└── PostgreSQL + Drizzle        → Database + Migrations

MapLibre GL JS                  → Rendering mappa (frontend)
MapTiler                        → Tile hosting (free tier, OSM-based)
```

Tutto il deployment avviene su **Railway**, unica piattaforma. I servizi comunicano tramite la rete privata interna di Railway.

---

## Frontend — Next.js (TypeScript)

- Server-side rendering per il calendario pubblico e le pagine evento (SEO + performance mobile)
- Sezioni auth-gated (calendario personale, form proposta) renderizzate client-side
- Mobile-first, lingua italiana
- Deploy su Railway come servizio separato dal backend

---

## Backend — Fastify (TypeScript)

Layer API esplicito, separato dal frontend. Scelta rispetto alle API routes di Next.js per:
- Separazione netta delle responsabilità
- Maggiore controllo sulla logica backend
- Scalabilità indipendente

### Autenticazione

Implementata direttamente in Fastify per l'MVP:
- `@fastify/jwt` per la gestione dei token JWT
- `bcrypt` per l'hashing delle password
- Tabella `users` nel database
- Email/password come unico metodo di accesso per l'MVP

Per il reset password è necessario un provider email esterno (es. Resend o SendGrid).
OAuth (Google, GitHub, ecc.) rimandato a post-MVP.

> Alternativa considerata e scartata per l'MVP: **Supabase Auth** (troppo overhead) o **Clerk** (costo e dipendenza esterna). L'auth custom in Fastify richiede ~1-2 giorni di lavoro ed è sufficiente per il MVP.

---

## Database — PostgreSQL + Drizzle ORM

### Perché Drizzle

- Schema definito in TypeScript — fonte di verità unica
- `drizzle-kit generate` produce file di migrazione SQL a partire dal diff dello schema
- `drizzle-kit migrate` applica le migrazioni pendenti
- I file di migrazione sono SQL puro, facili da revisionare in PR
- Lightweight, senza magie nascoste, compatibile con Fastify

### Gestione delle migrazioni in deploy

```
git push
  → Railway builda il servizio Fastify
  → esegue: npx drizzle-kit migrate   ← applica le migrazioni pendenti
  → avvia: node server.js
```

Il comando di migrazione viene configurato come pre-start command nelle impostazioni del servizio Railway.

> Attenzione: evitare migrazioni distruttive (DROP COLUMN, RENAME) senza un periodo di transizione se frontend e backend deployano in modo indipendente. Per l'MVP non è un problema rilevante.

---

## Mappa — MapLibre GL JS + MapTiler

Mapbox è stato considerato ma scartato per:
- Licenza proprietaria (GL JS v2+)
- Pricing basato su Monthly Active Users (50k map loads/mese nel free tier)

**MapLibre GL JS** è il fork open-source di Mapbox GL JS v1:
- API quasi identica a Mapbox
- Completamente gratuito, nessun vendor lock-in
- Supporta clustering, stili custom, interazione fluida su mobile

**MapTiler** fornisce i tile (immagini/strade basate su OSM):
- Free tier: 100.000 tile requests/mese
- Eventuale migrazione ad altro provider semplice grazie a MapLibre

La mappa è una feature di primo piano nell'applicazione, non accessoria.

---

## Ruoli Utente e Permessi

| Ruolo | Capacità |
| --- | --- |
| **Guest** | Visualizza calendario pubblico, filtra eventi, vede dettagli e mappa |
| **Utente registrato** | Salva eventi nel calendario personale, propone nuovi eventi, monitora stato proposte |
| **Amministratore** | Accesso diretto al DB per approvare/rifiutare proposte (MVP) |

I permessi sono applicati a livello di middleware Fastify tramite il ruolo codificato nel JWT.

---

## Decisioni Aperte

- Struttura esatta del data model (da definire)
- Superficie API (endpoint da definire)
- Obbligatorietà dei campi nel form di proposta evento
- Flusso di registrazione/login (ancora da progettare nei wireframe)
- Strategia di autenticazione: auth custom in Fastify (`@fastify/jwt` + `bcrypt`) vs soluzione gestita (Clerk, Better Auth). Da valutare complessità, tempi di sviluppo e necessità di OAuth

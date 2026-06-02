# CalendarioMorbido

Web app per il calendario di eventi cicloturistici non competitivi in Italia.

**Stack MVP**: Next.js 15 (App Router) + Supabase (Postgres, Auth, Storage) + Vercel.

---

## Sviluppo locale

### Prerequisiti

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — richiesto da Supabase CLI
- Node.js + pnpm

### Prima volta

**1. Installa le dipendenze**

```bash
pnpm install
```

**2. Avvia il database locale**

```bash
pnpm db:start
```

Docker scarica le immagini Supabase (solo la prima volta, ~2 min) e avvia lo stack locale: Postgres, Auth, Storage. Al termine vengono stampati URL e chiavi, per esempio:

```
API URL: http://127.0.0.1:54321
anon key: eyJ...
service_role key: eyJ...
```

**3. Configura le variabili d'ambiente**

```bash
cp .env.local.example .env.local
```

Apri `.env.local` e incolla i valori stampati al passo precedente (recuperabili in qualsiasi momento con `pnpm db:status`).

**4. Avvia Next.js**

```bash
pnpm dev   # http://localhost:3000
```

L'app ora punta al database locale con i dati di esempio già caricati.

---

### Workflow quotidiano

```bash
pnpm db:start   # avvia il DB locale (se non è già attivo)
pnpm dev        # avvia Next.js
```

```bash
pnpm db:stop    # ferma tutto quando hai finito
```

---

### Testare le migration

Ogni volta che scrivi o modifichi un file in `supabase/migrations/`, verificala in locale prima di applicarla in produzione:

```bash
pnpm db:reset
```

Questo comando azzera il database locale e riesegue **tutte** le migration in ordine. Se non va in errore, la migration è pronta per la produzione.

---

### Strumenti inclusi

| Strumento | URL | Descrizione |
|---|---|---|
| App | http://localhost:3000 | Next.js in dev mode |
| Supabase Studio | http://localhost:54323 | Dashboard locale (tabelle, auth, storage) |
| Inbucket | http://localhost:54324 | Intercetta le email inviate (non le invia davvero) |

---

### Comandi DB

| Comando | Descrizione |
|---|---|
| `pnpm db:start` | Avvia lo stack Supabase locale |
| `pnpm db:stop` | Ferma lo stack |
| `pnpm db:reset` | Azzera e riesegue tutte le migration |
| `pnpm db:status` | Stampa URL e chiavi del DB locale |

---

## Deploy su Vercel (produzione)

Per il deploy completo vedi **[SETUP.md](SETUP.md)**.

---

## Struttura del progetto

```
src/app/          # Pagine (App Router): calendario, dettaglio, auth, personale, proponi, gestore
src/components/   # Componenti UI
src/lib/          # Client Supabase, server actions, costanti, utilità
supabase/
  migrations/     # Schema, RLS, funzioni SQL e dati di esempio
  config.toml     # Configurazione stack locale
messages/         # Traduzioni (next-intl): it.json, en.json
```

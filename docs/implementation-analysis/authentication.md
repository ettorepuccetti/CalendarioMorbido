# Autenticazione — Analisi e Decisione

## Contesto

Due librerie popolari sono state escluse a priori:

- **Lucia** — deprecato ufficialmente a inizio 2025, ora solo risorsa didattica
- **Auth.js v5** — in beta da quasi 2 anni, nessun supporto Fastify rilasciato, manutenzione trasferita al team di Better Auth. Scartato.

---

## Confronto

| Criterio | Clerk | Auth0 | Better Auth (self-hosted) | Custom @fastify/jwt + bcrypt |
| --- | --- | --- | --- | --- |
| **Free tier** | 50K MAU | 25K MAU | Illimitato (solo infrastruttura) | Illimitato |
| **Costo** | $25/mo (Pro) | $35/mo (Essentials) | Gratis (MIT) | Gratis |
| **Email/password** | Sì | Sì | Sì | DIY |
| **Email verification** | Sì | Sì | Sì (serve email sender) | DIY |
| **Password reset** | Sì | Sì | Sì (serve email sender) | DIY |
| **OAuth providers** | Sì (Pro per illimitati) | Sì | Sì (molti built-in) | DIY |
| **MFA** | Solo piano Pro | Solo Essentials+ | Sì (plugin gratuito) | DIY |
| **Dove stanno i dati utente** | Server Clerk (EU) | Server Auth0 (EU) | PostgreSQL proprio | PostgreSQL proprio |
| **TypeScript** | Eccellente | Buono | Eccellente | Dipende dall'implementazione |
| **Supporto Fastify** | SDK ufficiale | SDK ufficiale (apr 2025) | Guida ufficiale + plugin community | Nativo |
| **Tempo al funzionante** | 2–4 ore | 4–8 ore | 4–6 ore | 2–4 settimane |
| **Manutenzione ongoing** | Quasi zero | Bassa | Bassa-media | Alta |
| **Vendor lock-in** | Alto | Alto | Nessuno | Nessuno |

---

## Analisi per opzione

### Clerk

Il migliore dei servizi gestiti. SDK Fastify ufficiale, 50K MAU gratis, setup in poche ore. I dati utente risiedono sui server Clerk (EU, GDPR-compliant), ma non sono propri. MFA disponibile solo dal piano Pro ($25/mo).

### Auth0

Più complesso da configurare, free tier più basso (25K MAU), MFA a pagamento. Nessun vantaggio concreto rispetto a Clerk per questo caso d'uso.

### Better Auth (self-hosted)

Libreria MIT, gira all'interno del processo Fastify, i dati utente stanno nel PostgreSQL già su Railway. OAuth, MFA, email verification e password reset inclusi come plugin gratuiti. Integrazione nativa con Drizzle. YC-backed ($5M funding), rischio abbandono basso. Unico overhead: configurare un email sender per verification e reset (Resend: gratis fino a 3K email/mese).

### Custom @fastify/jwt + bcrypt

Controllo totale, zero dipendenze esterne. Implementare correttamente refresh token rotation, revocation, rate limiting e tutti i flow di sicurezza richiede però 2–4 settimane. Non giustificato per l'MVP.

---

## Decisione

**Better Auth self-hosted** è la scelta raccomandata per questo progetto:

- I dati utente restano nel PostgreSQL su Railway — GDPR risolto, nessun vendor lock-in
- Zero costo per-utente, nessuna sorpresa con la crescita
- Fastify supportato ufficialmente, esistono template Railway pronti con questo stack
- Integrazione diretta con Drizzle (già scelto per le migrazioni)

**Alternativa** se si vuole zero manutenzione e si accetta che i dati utente risiedano su server terzi: **Clerk** (SDK Fastify ufficiale, 50K MAU gratis).

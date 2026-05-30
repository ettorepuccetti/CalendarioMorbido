# CalendarioMorbido — Sintesi della prima esplorazione wireframe

> Webapp calendario per eventi **cicloturistici non competitivi** in Italia.
> Output di questa fase: wireframe **mobile-first, low-fi**, in italiano, vibe sportivo/energico.
> 6 schermate × 2 varianti, affiancate su canvas per il confronto.

---

## 1. Input e direzione condivisa

Decisioni emerse dall'intervista iniziale, usate come vincoli di progetto:

| Tema | Scelta |
| --- | --- |
| **Dispositivo** | Mobile-first (consultazione in mobilità) |
| **Schermate in scope** | Tutte: calendario pubblico, mappa, dettaglio evento, calendario personale, proponi evento, area gestore |
| **Vista calendario** | Griglia mensile classica + lista di card scorrevoli sotto |
| **Filtri** | Componente espandibile coerente col mobile (giornata / più giorni, regione) |
| **Mappa** | Vista alternativa secondaria — toggle lista/mappa |
| **Varianti** | 2 per schermata, a confronto |
| **Pubblico** | Mix ampio di appassionati |
| **Fedeltà** | Wireframe puliti ma low-fi |
| **Tono** | Sportivo ed energico |
| **Lingua** | Italiano |

**Sistema visivo adottato:** bianco/nero su carta calda + un accento hi-vis (verde ciclismo, regolabile), font a mano leggibile (Patrick Hand / Caveat), icone a tratto, placeholder a tratteggio per le immagini. Aspetto e tono sono modificabili dal pannello **Tweaks** (accento, testo a mano/leggibile, tono carta).

### Modello dei ruoli

- **Ospite / utente** → consulta il calendario pubblico, filtri e mappa.
- **Utente registrato** → salva eventi nel calendario personale e propone eventi al gestore.
- **Gestore** → revisiona ed approva/rifiuta le proposte.

---

## 2. Le schermate e il confronto tra varianti

Per ogni schermata sono state esplorate due direzioni. Sotto, cosa cambia e quando preferire l'una o l'altra.

### 2.1 Calendario pubblico

Griglia mensile + lista card; nodo centrale = come gestire i filtri sul mobile.

| | **Variante A — Griglia + filtri a chip** | **Variante B — Pannello filtri aperto + feed** |
| --- | --- | --- |
| Filtri | Chip rapidi in linea + bottone "Filtri" (stato **chiuso**) | Pannello espandibile **aperto** con Durata e Regione |
| Calendario | Griglia mese piena | Griglia mese compatta |
| Lista | Card compatte (riga: data, mini-cover, luogo, tag) | Feed con **cover grandi** per evento |
| Toggle vista | Segmented Lista/Mappa in linea | — |
| **Quando** | Massima densità, scorri molti eventi in fretta | Esplorazione filtrata, più visiva ed editoriale |

### 2.2 Vista mappa

Attivata dal toggle lista/mappa; ruolo secondario ma presente ovunque.

| | **Variante A — Mappa full + bottom sheet** | **Variante B — Mappa + lista sotto** |
| --- | --- | --- |
| Layout | Mappa a tutto schermo con pin numerati | Mappa a metà schermo + lista compatta |
| Dettaglio | Bottom sheet "peek" con card singola scorribile | Lista scrollabile sincronizzata coi pin |
| Filtri | Search + chip flottanti sopra la mappa | Chip sulla mappa, lista filtrata sotto |
| **Quando** | Esplorazione geografica immersiva | Ponte tra mappa e lista, meno modale |

### 2.3 Dettaglio evento

Tutti i dati richiesti: date inizio/fine, partenza→arrivo, link sito, immagine di copertina.

| | **Variante A — Hero immersivo** | **Variante B — Scheda strutturata** |
| --- | --- | --- |
| Cover | Full-bleed in alto | Cover contenuta + card dati |
| Dati | Righe icona+valore (quando, percorso, durata) | Tabella chiave/valore ordinata |
| Extra | Descrizione + link ufficiale | **Mini-mappa del percorso** A→B + link |
| CTA | "Aggiungi al mio calendario" sticky in basso | CTA sticky in basso |
| **Quando** | Impatto visivo, evento "da copertina" | Lettura rapida e scansionabile dei dati |

### 2.4 Calendario personale (area riservata)

Eventi salvati dall'utente; aggancio allo stato delle proposte inviate.

| | **Variante A — Agenda salvati** | **Variante B — Griglia + Le mie proposte** |
| --- | --- | --- |
| Focus | Card "Prossimo evento" in evidenza + lista salvati | Griglia personale + **tab Salvati / Le mie proposte** |
| Stato proposte | — | Badge **In attesa / Approvato / Da rivedere** |
| Navigazione | Lista cronologica dei salvati | Switch tra ciò che seguo e ciò che ho proposto |
| **Quando** | "Cosa ho in programma adesso" | Vista a 360° anche sul contributo dell'utente |

### 2.5 Proponi un evento

Invio di una proposta al gestore del calendario pubblico (con avviso di revisione).

| | **Variante A — Form unico** | **Variante B — Wizard a step** |
| --- | --- | --- |
| Struttura | Tutti i campi in un'unica schermata scorrevole | 3 passi: Info base · Luogo · Media |
| Campi | Cover, nome, date, durata, partenza/arrivo, regione, link, descrizione | Pochi campi per passo, con barra di avanzamento |
| Carico cognitivo | Più alto ma tutto a vista | Più basso, guidato |
| **Quando** | Utenti esperti, compilazione veloce | Onboarding morbido, meno abbandoni |

### 2.6 Area gestore — richieste da approvare

Coda delle proposte da revisionare.

| | **Variante A — Coda con azioni inline** | **Variante B — Revisione singola** |
| --- | --- | --- |
| Layout | Lista di card con **Approva / Rifiuta** in linea | Una proposta a tutto schermo (1 di N) |
| Filtri stato | Segmented In attesa / Approvate / Rifiutate | Avanzamento della coda a barre |
| Dettaglio | Sintetico per scorrere in fretta | Completo: dati, autore, link, "Modifica prima di pubblicare" |
| **Quando** | Smaltire molte richieste rapidamente | Valutazione attenta caso per caso |

---

## 3. Domande aperte / prossimi passi

- Scegliere la variante preferita **per ogni schermata** (anche mix tra le due).
- Decidere se la mappa resta secondaria o diventa più centrale.
- Definire i campi obbligatori vs facoltativi nel form di proposta.
- Stato registrazione/login (non ancora wireframizzato): come si entra nell'area riservata.
- Alzare la fedeltà sulle scelte vincenti **oppure** trasformarle in un prototipo cliccabile.

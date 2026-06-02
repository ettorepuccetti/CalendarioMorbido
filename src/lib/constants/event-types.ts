// Single source of truth per i tipi di evento (event_type).
// Deve combaciare con il CHECK in 0001_init.sql / 0005_event_attributes.sql.
// Le etichette tradotte stanno in messages/{it,en}.json sotto "eventTypes".
export const EVENT_TYPES = [
  "ciclostorica",
  "cicloturistica",
  "gravel",
  "bikepacking",
  "mtb",
  "randonnee",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

// Mappa i valori grezzi e disomogenei del CSV (docs/events-research) sulle
// categorie canoniche. Usata dallo script di import. Tutto ciò che non matcha
// resta non normalizzato (null) e va corretto a mano.
const RAW_EVENT_TYPE_MAP: Record<string, EventType> = {
  ciclostorica: "ciclostorica",

  bikepacking: "bikepacking",
  "trail/bikepacking": "bikepacking",
  "bikepacking/gravel": "bikepacking",

  gravel: "gravel",
  "gravel/gathering": "gravel",
  "trail/gravel": "gravel",

  cicloturistica: "cicloturistica",
  "granfondo/cicloturistica": "cicloturistica",
  "cicloturistica/gathering": "cicloturistica",
  "mtb/cicloturistica": "cicloturistica",
  // pedalata e festival/bike day confluiscono in cicloturistica
  "night ride/pedalata": "cicloturistica",
  "pedalata/community": "cicloturistica",
  "night ride/series": "cicloturistica",
  "festival/bike days": "cicloturistica",
  "festival/gathering": "cicloturistica",
  "bike day/festival": "cicloturistica",
  "cycling route/festival": "cicloturistica",
  "cicloturistica/bike day": "cicloturistica",

  "mtb stage race": "mtb",
  "mtb race": "mtb",
  "mtb/gathering": "mtb",
  "trail/mtb": "mtb",

  randonnee: "randonnee",
  "randonnee/ultra": "randonnee",
  "randonnee/challenge": "randonnee",
};

// Normalizza un valore grezzo di event_type sulla categoria canonica.
// Ritorna null se il valore è vuoto o non riconosciuto.
export function normalizeEventType(raw: string | null | undefined): EventType | null {
  if (!raw) return null;
  return RAW_EVENT_TYPE_MAP[raw.trim().toLowerCase()] ?? null;
}

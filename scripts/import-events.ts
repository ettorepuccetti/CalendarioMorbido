/**
 * Import degli eventi da docs/events-research/cycling-events-2026.csv nella
 * tabella `events`. Usa il service role (bypassa la RLS: events non ha policy
 * di insert lato client).
 *
 * Uso:
 *   pnpm db:import                # importa (salta i duplicati title+start_date)
 *   pnpm db:import -- --dry-run   # mostra cosa farebbe, senza scrivere
 *
 * Variabili d'ambiente richieste (lette da .env.local / .env o dall'ambiente):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { REGIONS, type Region } from "../src/lib/constants/regions";
import { normalizeEventType } from "../src/lib/constants/event-types";

const CSV_PATH = resolve(
  process.cwd(),
  "docs/events-research/cycling-events-2026.csv",
);
const DRY_RUN = process.argv.includes("--dry-run");

// --- env --------------------------------------------------------------------
// Carica un file .env minimale (KEY=VALUE per riga) se le variabili non ci sono.
function loadEnvFile(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    )
      val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Mancano NEXT_PUBLIC_SUPABASE_URL e/o SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

// --- CSV parser (RFC4180: virgole e newline dentro le virgolette, "" escape) -
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // ignora: il \n successivo chiude la riga
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// --- helpers ----------------------------------------------------------------
const clean = (v: string | undefined): string | null => {
  const s = (v ?? "").trim();
  return s === "" ? null : s;
};

// Le URL nel CSV sono spesso senza schema ("turinhills.it").
const asUrl = (v: string | undefined): string | null => {
  const s = clean(v);
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s : `https://${s}`;
};

// Chiamate REST verso PostgREST col service role (niente client realtime →
// nessun problema di WebSocket su Node < 22).
const restHeaders = {
  apikey: SERVICE_KEY!,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
};

async function restGet(path: string): Promise<unknown[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: restHeaders,
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function restInsert(rows: Record<string, unknown>[]): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
    method: "POST",
    headers: { ...restHeaders, Prefer: "return=minimal" },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`INSERT → ${res.status} ${await res.text()}`);
}

// --- main -------------------------------------------------------------------
async function main() {
  const raw = readFileSync(CSV_PATH, "utf8");
  const [header, ...dataRows] = parseCsv(raw);
  const col = (name: string) => header.indexOf(name);
  const idx = {
    name: col("name"),
    date_start: col("date_start"),
    date_end: col("date_end"),
    event_type: col("event_type"),
    competitive: col("competitive"),
    terrain: col("terrain"),
    bike_type: col("bike_type"),
    start_city: col("start_city"),
    province: col("province"),
    region: col("region"),
    distances_km: col("distances_km"),
    elevation_gain_m: col("elevation_gain_m"),
    registration_fee: col("registration_fee"),
    website: col("website"),
    email: col("email"),
    phone: col("phone"),
    instagram: col("instagram"),
    facebook: col("facebook"),
    organizer: col("organizer"),
    circuit: col("circuit"),
    description: col("description"),
    image_url: col("image_url"),
    source: col("source"),
  };

  // Idempotenza: salta gli eventi già presenti (stesso title + start_date).
  // In dry-run non si tocca il DB.
  const seen = new Set<string>();
  if (!DRY_RUN) {
    const existing = (await restGet(
      "events?select=title,start_date",
    )) as { title: string; start_date: string }[];
    for (const e of existing) seen.add(`${e.title}::${e.start_date}`);
  }

  const toInsert: Record<string, unknown>[] = [];
  const skipped: string[] = [];

  for (const r of dataRows) {
    const name = clean(r[idx.name]);
    const startDate = clean(r[idx.date_start]);
    const region = clean(r[idx.region]);

    if (!name || !startDate) {
      skipped.push(`riga senza nome/data: ${name ?? "?"}`);
      continue;
    }
    if (!region || !REGIONS.includes(region as Region)) {
      skipped.push(`${name}: regione non valida (${region ?? "vuota"})`);
      continue;
    }
    if (seen.has(`${name}::${startDate}`)) {
      skipped.push(`${name}: già presente`);
      continue;
    }

    toInsert.push({
      title: name,
      description: clean(r[idx.description]),
      start_date: startDate,
      end_date: clean(r[idx.date_end]) ?? startDate, // NOT NULL, >= start
      region,
      official_url: asUrl(r[idx.website]),
      cover_image_key: clean(r[idx.image_url]), // URL esterno: coverUrl fa pass-through
      start_comune: clean(r[idx.start_city]) ?? "—",
      start_provincia: clean(r[idx.province]) ?? "—",
      end_comune: null,
      end_provincia: null,
      // campi pubblici
      event_type: normalizeEventType(r[idx.event_type]),
      terrain: clean(r[idx.terrain]),
      distances_km: clean(r[idx.distances_km]),
      elevation_gain_m: clean(r[idx.elevation_gain_m]),
      instagram_url: asUrl(r[idx.instagram]),
      facebook_url: asUrl(r[idx.facebook]),
      organizer: clean(r[idx.organizer]),
      circuit: clean(r[idx.circuit]),
      // campi admin-only
      bike_type: clean(r[idx.bike_type]),
      competitive: clean(r[idx.competitive]),
      registration_fee: clean(r[idx.registration_fee]),
      contact_email: clean(r[idx.email]),
      contact_phone: clean(r[idx.phone]),
      // solo DB
      source: clean(r[idx.source]),
    });
  }

  console.log(`Da importare: ${toInsert.length} · saltati: ${skipped.length}`);
  if (skipped.length) skipped.forEach((s) => console.log(`  - skip: ${s}`));

  if (DRY_RUN) {
    console.log("\n[dry-run] nessuna scrittura. Esempio prima riga:");
    console.log(JSON.stringify(toInsert[0], null, 2));
    return;
  }
  if (!toInsert.length) {
    console.log("Niente da inserire.");
    return;
  }

  await restInsert(toInsert);
  console.log(`✓ Inseriti ${toInsert.length} eventi.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

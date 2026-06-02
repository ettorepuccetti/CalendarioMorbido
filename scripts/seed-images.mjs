/**
 * seed-images.mjs
 *
 * For each event in the DB that has official_url but no cover_image_key:
 *   1. Fetches the og:image from the official URL
 *   2. Downloads the image
 *   3. Uploads it to the Supabase "covers" bucket
 *   4. Updates cover_image_key on the event row
 *
 * Usage:
 *   node scripts/seed-images.mjs
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Load .env.local
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");

function loadEnv(path) {
  try {
    const lines = readFileSync(path, "utf8").split("\n");
    const result = {};
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      result[key] = val;
    }
    return result;
  } catch {
    return {};
  }
}

const env = loadEnv(envPath);
const SUPABASE_URL =
  env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchOgImage(pageUrl) {
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // og:image (two attribute orderings)
    const patterns = [
      /property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];
    for (const pat of patterns) {
      const m = html.match(pat);
      if (m?.[1] && m[1].startsWith("http")) return m[1];
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function downloadImage(imageUrl) {
  const res = await fetch(imageUrl, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${imageUrl}`);
  const buffer = await res.arrayBuffer();
  const ct = res.headers.get("content-type") || "image/jpeg";
  return { buffer, contentType: ct };
}

function extFromContentType(ct) {
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  return "jpg";
}

async function uploadToSupabase(buffer, contentType, key) {
  const { error } = await supabase.storage
    .from("covers")
    .upload(key, buffer, { contentType, upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

async function updateEventCoverKey(eventId, key) {
  const { error } = await supabase
    .from("events")
    .update({ cover_image_key: key, updated_at: new Date().toISOString() })
    .eq("id", eventId);
  if (error) throw new Error(`DB update failed: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Fetch events without a cover that have an official URL
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, official_url, cover_image_key")
    .is("cover_image_key", null)
    .not("official_url", "is", null)
    .order("start_date");

  if (error) {
    console.error("❌  Could not fetch events:", error.message);
    process.exit(1);
  }

  if (!events.length) {
    console.log("✅  No events without cover found — nothing to do.");
    return;
  }

  console.log(`Found ${events.length} events without cover image.\n`);

  for (const ev of events) {
    process.stdout.write(`⏳  ${ev.title} … `);

    // 1. Get og:image from official page
    const ogImage = await fetchOgImage(ev.official_url);
    if (!ogImage) {
      console.log(`⚠️   no og:image found at ${ev.official_url}`);
      continue;
    }

    // 2. Download image
    let buffer, contentType;
    try {
      ({ buffer, contentType } = await downloadImage(ogImage));
    } catch (err) {
      console.log(`⚠️   download failed: ${err.message}`);
      continue;
    }

    // 3. Upload to Supabase Storage
    const ext = extFromContentType(contentType);
    const key = `seed/${ev.id}.${ext}`;
    try {
      await uploadToSupabase(buffer, contentType, key);
    } catch (err) {
      console.log(`⚠️   upload failed: ${err.message}`);
      continue;
    }

    // 4. Update DB
    try {
      await updateEventCoverKey(ev.id, key);
    } catch (err) {
      console.log(`⚠️   DB update failed: ${err.message}`);
      continue;
    }

    console.log(`✅  ${key}`);
  }

  console.log("\nDone.");
}

main();

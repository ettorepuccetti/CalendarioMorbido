import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/require-user";

export const dynamic = "force-dynamic";
// Allow up to 5 minutes — fetching + uploading many images can be slow
export const maxDuration = 300;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function fetchOgImage(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    const html = await res.text();
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
  } catch {
    return null;
  }
}

async function downloadImage(
  imageUrl: string
): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    return { buffer, contentType };
  } catch {
    return null;
  }
}

function extFrom(ct: string) {
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("gif")) return "gif";
  return "jpg";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Use service-role client to bypass RLS for updates
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const adminClient = createAdminClient();
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, official_url, cover_image_key")
    .is("cover_image_key", null)
    .not("official_url", "is", null)
    .order("start_date");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { title: string; status: string; key?: string }[] = [];

  for (const ev of events ?? []) {
    const ogImage = await fetchOgImage(ev.official_url!);
    if (!ogImage) {
      results.push({ title: ev.title, status: "no og:image" });
      continue;
    }

    const img = await downloadImage(ogImage);
    if (!img) {
      results.push({ title: ev.title, status: "download failed" });
      continue;
    }

    const ext = extFrom(img.contentType);
    const key = `seed/${ev.id}.${ext}`;

    const { error: uploadErr } = await adminClient.storage
      .from("covers")
      .upload(key, img.buffer, { contentType: img.contentType, upsert: true });

    if (uploadErr) {
      results.push({ title: ev.title, status: `upload error: ${uploadErr.message}` });
      continue;
    }

    const { error: dbErr } = await adminClient
      .from("events")
      .update({ cover_image_key: key, updated_at: new Date().toISOString() })
      .eq("id", ev.id);

    if (dbErr) {
      results.push({ title: ev.title, status: `db error: ${dbErr.message}` });
      continue;
    }

    results.push({ title: ev.title, status: "ok", key });
  }

  return NextResponse.json({ processed: results.length, results });
}

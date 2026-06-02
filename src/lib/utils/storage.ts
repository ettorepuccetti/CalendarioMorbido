// Risolve una chiave dello storage (es. "covers/abc.jpg") in URL pubblico.
// Il bucket "covers" è pubblico, quindi l'URL è costruibile senza chiamate.
export function coverUrl(key: string | null | undefined): string | null {
  if (!key) return null;
  // Gli eventi importati dal CSV hanno un URL esterno completo come cover:
  // in quel caso lo si usa direttamente, senza passare dal bucket.
  if (/^https?:\/\//i.test(key)) return key;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/covers/${key}`;
}

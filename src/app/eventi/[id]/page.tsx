import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import SaveButton from "@/components/events/SaveButton";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import { coverUrl } from "@/lib/utils/storage";
import { formatDateRange, isSingleDay } from "@/lib/utils/dates";
import { formatPlace } from "@/lib/utils/location";
import type { EventRow } from "@/lib/types/db";
import type { Locale } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [t, locale, supabase] = await Promise.all([
    getTranslations(),
    getLocale(),
    createClient(),
  ]);

  const [{ data: { user } }, { data: detail }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("get_event_detail", { p_event_id: id }),
  ]);

  if (!detail) notFound();
  const ev = (detail as { event: EventRow }).event;
  const saved = (detail as { saved: boolean }).saved;
  const admin = (detail as { is_admin: boolean }).is_admin;

  const cover = coverUrl(ev.cover_image_key);

  return (
    <article className="space-y-4 pb-24">
      <Link href="/" className="font-body text-sm text-accent-deep">
        {t("event.back")}
      </Link>

      <div className="card overflow-hidden">
        <div className="relative aspect-[16/9] w-full bg-paper-soft">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={ev.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_14px,var(--paper-soft)_14px,var(--paper-soft)_28px)]">
              <span className="font-head text-5xl text-ink-soft">🚲</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <span className="chip mb-2">
            {isSingleDay(ev.start_date, ev.end_date)
              ? t("card.oneDay")
              : t("card.multiDay")}
          </span>
          <h1 className="font-head text-4xl font-bold leading-none">{ev.title}</h1>
          <p className="mt-1 font-body text-accent-deep">
            📅 {formatDateRange(ev.start_date, ev.end_date, locale)}
          </p>
          <p className="font-body text-ink-soft">📍 {ev.region}</p>
        </div>
      </div>

      {ev.description && (
        <div className="card p-4">
          <h2 className="mb-1 font-head text-2xl">{t("event.description")}</h2>
          <p className="font-body">{ev.description}</p>
        </div>
      )}

      <div className="card p-4">
        <h2 className="mb-2 font-head text-2xl">{t("event.route")}</h2>
        <div className="flex flex-wrap items-center gap-2 font-body">
          <span className="chip">
            🟢 {formatPlace(ev.start_comune, ev.start_provincia)}
          </span>
          {ev.end_comune && (
            <>
              <span className="text-ink-soft">→</span>
              <span className="chip">
                🏁 {formatPlace(ev.end_comune, ev.end_provincia)}
              </span>
            </>
          )}
        </div>
      </div>

      {ev.official_url && (
        <a
          href={ev.official_url}
          target="_blank"
          rel="noopener noreferrer"
          className="card flex items-center justify-between p-4 font-body hover:bg-paper-soft"
        >
          <span>{t("event.officialSite")}</span>
          <span className="text-accent-deep">{t("event.open")}</span>
        </a>
      )}

      {admin && (
        <div className="space-y-2">
          <Link
            href={`/gestore/eventi/${ev.id}/modifica`}
            className="btn btn-ghost w-full"
          >
            {t("event.edit")}
          </Link>
          <DeleteEventButton eventId={ev.id} />
        </div>
      )}

      {/* CTA sticky in basso */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper/95 p-3 backdrop-blur">
        <div className="mx-auto w-full max-w-3xl px-1">
          {user ? (
            <SaveButton eventId={ev.id} initialSaved={saved} />
          ) : (
            <Link href="/accedi" className="btn btn-primary w-full">
              {t("event.loginToSave")}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

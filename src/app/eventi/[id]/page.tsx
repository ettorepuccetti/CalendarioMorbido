import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import SaveButton from "@/components/events/SaveButton";
import DeleteEventButton from "@/components/admin/DeleteEventButton";
import { isAdmin } from "@/lib/auth/require-user";
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
  const t = await getTranslations();
  const locale = (await getLocale()) as Locale;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!event) notFound();
  const ev = event as EventRow;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = user ? await isAdmin() : false;

  let saved = false;
  if (user) {
    const { data: savedRow } = await supabase
      .from("saved_events")
      .select("event_id")
      .eq("user_id", user.id)
      .eq("event_id", id)
      .maybeSingle();
    saved = !!savedRow;
  }

  const cover = coverUrl(ev.cover_image_key);

  return (
    <article className="space-y-4 pb-24">
      <Link href="/" className="font-body text-sm text-accent-deep">
        {t("event.back")}
      </Link>

      <div className="card overflow-hidden">
        <div className="relative aspect-[16/9] w-full bg-paper-soft">
          {cover ? (
            <Image
              src={cover}
              alt={ev.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_14px,var(--paper-soft)_14px,var(--paper-soft)_28px)]">
              <span className="font-head text-5xl text-ink-soft">🚲</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="chip">
              {isSingleDay(ev.start_date, ev.end_date)
                ? t("card.oneDay")
                : t("card.multiDay")}
            </span>
            {ev.event_type && (
              <span className="chip">{t(`eventTypes.${ev.event_type}`)}</span>
            )}
          </div>
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

      {(ev.terrain ||
        ev.distances_km ||
        ev.elevation_gain_m ||
        ev.organizer ||
        ev.circuit) && (
        <div className="card p-4">
          <h2 className="mb-2 font-head text-2xl">{t("event.details")}</h2>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-body">
            {ev.terrain && (
              <>
                <dt className="text-ink-soft">{t("event.terrain")}</dt>
                <dd>{ev.terrain}</dd>
              </>
            )}
            {ev.distances_km && (
              <>
                <dt className="text-ink-soft">{t("event.distances")}</dt>
                <dd>{ev.distances_km} km</dd>
              </>
            )}
            {ev.elevation_gain_m && (
              <>
                <dt className="text-ink-soft">{t("event.elevation")}</dt>
                <dd>{ev.elevation_gain_m} m</dd>
              </>
            )}
            {ev.organizer && (
              <>
                <dt className="text-ink-soft">{t("event.organizer")}</dt>
                <dd>{ev.organizer}</dd>
              </>
            )}
            {ev.circuit && (
              <>
                <dt className="text-ink-soft">{t("event.circuit")}</dt>
                <dd>{ev.circuit}</dd>
              </>
            )}
          </dl>
        </div>
      )}

      {(ev.instagram_url || ev.facebook_url) && (
        <div className="flex gap-2">
          {ev.instagram_url && (
            <a
              href={ev.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex-1 p-3 text-center font-body hover:bg-paper-soft"
            >
              📷 Instagram
            </a>
          )}
          {ev.facebook_url && (
            <a
              href={ev.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="card flex-1 p-3 text-center font-body hover:bg-paper-soft"
            >
              👍 Facebook
            </a>
          )}
        </div>
      )}

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

      {admin &&
        (ev.bike_type ||
          ev.competitive ||
          ev.registration_fee ||
          ev.contact_email ||
          ev.contact_phone) && (
          <div className="card border-2 border-dashed border-line p-4">
            <h2 className="mb-2 font-head text-2xl">{t("event.adminInfo")}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-body">
              {ev.bike_type && (
                <>
                  <dt className="text-ink-soft">{t("event.bikeType")}</dt>
                  <dd>{ev.bike_type}</dd>
                </>
              )}
              {ev.competitive && (
                <>
                  <dt className="text-ink-soft">{t("event.competitive")}</dt>
                  <dd>{ev.competitive}</dd>
                </>
              )}
              {ev.registration_fee && (
                <>
                  <dt className="text-ink-soft">{t("event.fee")}</dt>
                  <dd>{ev.registration_fee}</dd>
                </>
              )}
              {ev.contact_email && (
                <>
                  <dt className="text-ink-soft">{t("event.email")}</dt>
                  <dd>
                    <a
                      href={`mailto:${ev.contact_email}`}
                      className="text-accent-deep underline"
                    >
                      {ev.contact_email}
                    </a>
                  </dd>
                </>
              )}
              {ev.contact_phone && (
                <>
                  <dt className="text-ink-soft">{t("event.phone")}</dt>
                  <dd>{ev.contact_phone}</dd>
                </>
              )}
            </dl>
          </div>
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

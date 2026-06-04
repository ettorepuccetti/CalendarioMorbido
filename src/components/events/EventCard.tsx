"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { EventRow } from "@/lib/types/db";
import { formatDateRange, isSingleDay } from "@/lib/utils/dates";
import { formatRoute } from "@/lib/utils/location";
import { coverUrl } from "@/lib/utils/storage";
import { eventTypeColor } from "@/lib/constants/event-types";
import type { Locale } from "@/i18n/config";

export default function EventCard({
  event,
  saved = false,
}: {
  event: EventRow;
  saved?: boolean;
}) {
  const url = coverUrl(event.cover_image_key);
  const t = useTranslations("card");
  const tTypes = useTranslations("eventTypes");
  const locale = useLocale() as Locale;
  const single = isSingleDay(event.start_date, event.end_date);

  return (
    <Link href={`/eventi/${event.id}`} className="card group block overflow-hidden">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-paper-soft">
        {url ? (
          <Image
            src={url}
            alt={event.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,var(--paper),var(--paper)_12px,var(--paper-soft)_12px,var(--paper-soft)_24px)]">
            <span className="font-head text-3xl text-ink-soft">🚲</span>
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          <span className="chip bg-paper/90 text-xs">
            {single ? t("oneDay") : t("multiDay")}
          </span>
          {event.event_type && (
            <span className="chip bg-paper/90 text-xs">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: eventTypeColor(event.event_type).bg }}
              />
              {tTypes(event.event_type)}
            </span>
          )}
        </div>
        {saved && (
          <span className="chip chip-active absolute right-2 top-2 text-xs font-medium shadow-sm">
            {t("savedBadge")}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-body text-sm text-accent-deep">
          {formatDateRange(event.start_date, event.end_date, locale)}
        </p>
        <h3 className="font-head text-xl font-semibold leading-tight">
          {event.title}
        </h3>
        <p className="mt-1 font-body text-sm text-ink-soft">
          📍 {formatRoute(event)} · {event.region}
        </p>
      </div>
    </Link>
  );
}

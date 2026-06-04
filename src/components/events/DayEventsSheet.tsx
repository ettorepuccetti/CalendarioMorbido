"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { EventRow } from "@/lib/types/db";
import { isSingleDay, formatDateRange, formatLongDate } from "@/lib/utils/dates";
import { formatRoute } from "@/lib/utils/location";
import type { Locale } from "@/i18n/config";

// Overlay con il dettaglio degli eventi di un giorno: bottom sheet su mobile,
// dialog centrato su desktop (≥ sm). Mostra TUTTI gli eventi del giorno, anche
// quelli nascosti nella griglia per mancanza di spazio.
export default function DayEventsSheet({
  day,
  events,
  savedIds,
  onClose,
}: {
  day: string | null;
  events: EventRow[];
  savedIds: Set<string>;
  onClose: () => void;
}) {
  const t = useTranslations("calendar");
  const locale = useLocale() as Locale;
  const open = day !== null;
  const [shown, setShown] = useState(false);

  // Animazione di entrata + chiusura con Escape + blocco dello scroll del body.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      setShown(false);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-modal="true"
      aria-label={formatLongDate(day, locale)}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 bg-ink/30 transition-opacity duration-200 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Pannello: bottom sheet su mobile, dialog centrato su desktop */}
      <div
        className={`card absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-b-none rounded-t-card bg-paper-soft p-4 shadow-xl transition-all duration-300 ease-out sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md sm:rounded-card ${
          shown
            ? "translate-y-0 sm:scale-100 sm:opacity-100"
            : "translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
        }`}
      >
        {/* Maniglia (solo mobile) */}
        <span className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-line sm:hidden" />

        {/* Intestazione: data + chiudi */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-head text-xl font-semibold capitalize">
            {formatLongDate(day, locale)}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-paper-soft hover:text-ink"
          >
            ✕
          </button>
        </div>

        {/* Lista eventi del giorno */}
        <ul className="space-y-2 overflow-y-auto">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/eventi/${e.id}`}
                onClick={onClose}
                className="card flex items-center gap-3 p-3 hover:bg-paper-soft"
              >
                <span
                  className={`inline-block h-3 w-3 shrink-0 rounded-full ${
                    isSingleDay(e.start_date, e.end_date)
                      ? "bg-accent"
                      : "bg-accent-alt"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-head text-lg leading-tight">
                    {e.title}
                    {savedIds.has(e.id) && (
                      <span
                        className="ml-1 text-accent-deep"
                        title={t("savedTitle")}
                      >
                        ✓
                      </span>
                    )}
                  </span>
                  <span className="block font-body text-sm text-ink-soft">
                    {formatDateRange(e.start_date, e.end_date, locale)} ·{" "}
                    {formatRoute(e)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

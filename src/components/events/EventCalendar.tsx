"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { EventRow } from "@/lib/types/db";
import { isSingleDay } from "@/lib/utils/dates";
import EventCard from "@/components/events/EventCard";
import DayEventsSheet from "@/components/events/DayEventsSheet";
import { BCP47, type Locale } from "@/i18n/config";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// "YYYY-MM-DD" da componenti locali (m è 0-indexed).
function ymd(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function occursOn(ev: EventRow, dayStr: string): boolean {
  return ev.start_date <= dayStr && dayStr <= ev.end_date;
}

type Cell = { date: Date; dayStr: string; inMonth: boolean };

// Posizionamento di un evento all'interno di una settimana (7 celle lun→dom).
type Segment = {
  event: EventRow;
  startIdx: number; // 0-6
  span: number;
  continuesLeft: boolean;
  continuesRight: boolean;
};

// Assegna i segmenti a corsie (lane) evitando sovrapposizioni di colonne.
function assignLanes(segments: Segment[]): Segment[][] {
  const lanes: { lastEnd: number; items: Segment[] }[] = [];
  for (const seg of segments) {
    let lane = lanes.find((l) => seg.startIdx > l.lastEnd);
    if (!lane) {
      lane = { lastEnd: -1, items: [] };
      lanes.push(lane);
    }
    lane.items.push(seg);
    lane.lastEnd = seg.startIdx + seg.span - 1;
  }
  return lanes.map((l) => l.items);
}

// Stile "Google Calendar": righe ad altezza fissa. Numero massimo di corsie
// mostrate per settimana; le eccedenze diventano "+N altri" per giorno.
const MAX_LANES = 3;
const LANE_H = 18; // px, altezza di una corsia/evento
const LANE_GAP = 2; // px, spazio verticale tra corsie

export default function EventCalendar({
  events,
  savedIds = [],
}: {
  events: EventRow[];
  savedIds?: string[];
}) {
  const saved = useMemo(() => new Set(savedIds), [savedIds]);
  const t = useTranslations("calendar");
  const locale = useLocale() as Locale;
  const weekdays = t.raw("weekdays") as string[];
  const monthFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(BCP47[locale], { month: "long", year: "numeric" }),
    [locale],
  );

  // Mese iniziale: quello del primo evento futuro, altrimenti il mese corrente.
  const today = new Date();
  const todayStr = ymd(today.getFullYear(), today.getMonth(), today.getDate());
  const initial = useMemo(() => {
    const next = events.find((e) => e.end_date >= todayStr) ?? events[0];
    const ref = next ? new Date(next.start_date) : today;
    return { year: ref.getFullYear(), month: ref.getMonth() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [{ year, month }, setView] = useState(initial);
  const [selected, setSelected] = useState<string | null>(null);

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setView({ year: d.getFullYear(), month: d.getMonth() });
    setSelected(null);
  }

  // Costruzione delle settimane (lun→dom).
  const weeks = useMemo(() => {
    const first = new Date(year, month, 1);
    const startOffset = (first.getDay() + 6) % 7; // lunedì = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    const cells: Cell[] = [];
    for (let i = 0; i < totalCells; i++) {
      const date = new Date(year, month, 1 - startOffset + i);
      cells.push({
        date,
        dayStr: ymd(date.getFullYear(), date.getMonth(), date.getDate()),
        inMonth: date.getMonth() === month,
      });
    }
    const rows: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [year, month]);

  // Eventi che ricadono (anche parzialmente) nel mese visualizzato.
  const monthEvents = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthStart = ymd(year, month, 1);
    const monthEnd = ymd(year, month, daysInMonth);
    return events
      .filter((e) => e.start_date <= monthEnd && e.end_date >= monthStart)
      .sort((a, b) => a.start_date.localeCompare(b.start_date));
  }, [events, year, month]);

  const monthLabel = monthFmt.format(new Date(year, month, 1));

  const selectedEvents = selected
    ? events.filter((e) => occursOn(e, selected))
    : [];

  return (
    <div className="space-y-3">
      {/* Header mese + navigazione */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => shiftMonth(-1)}
          className="chip"
          aria-label={t("prevMonth")}
        >
          ←
        </button>
        <h2 className="font-head text-2xl font-semibold capitalize">
          {monthLabel}
        </h2>
        <button
          onClick={() => shiftMonth(1)}
          className="chip"
          aria-label={t("nextMonth")}
        >
          →
        </button>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 font-body text-xs text-ink-soft">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent" />{" "}
          {t("oneDay")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-6 rounded bg-accent-alt" />{" "}
          {t("multiDay")}
        </span>
        {savedIds.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="text-accent-deep">✓</span> {t("saved")}
          </span>
        )}
      </div>

      {/* Griglia calendario */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-line bg-paper-soft">
          {weekdays.map((w) => (
            <div
              key={w}
              className="py-1.5 text-center font-body text-xs text-ink-soft"
            >
              {w}
            </div>
          ))}
        </div>

        {weeks.map((cells, wi) => {
          const weekStart = cells[0].dayStr;
          const weekEnd = cells[6].dayStr;
          const segments: Segment[] = events
            .filter((e) => e.start_date <= weekEnd && e.end_date >= weekStart)
            .sort(
              (a, b) =>
                a.start_date.localeCompare(b.start_date) ||
                b.end_date.localeCompare(a.end_date),
            )
            .map((e) => {
              const f = cells.findIndex((c) => c.dayStr === e.start_date);
              const l = cells.findIndex((c) => c.dayStr === e.end_date);
              const startIdx = f === -1 ? 0 : f;
              const endIdx = l === -1 ? 6 : l;
              return {
                event: e,
                startIdx,
                span: endIdx - startIdx + 1,
                continuesLeft: e.start_date < weekStart,
                continuesRight: e.end_date > weekEnd,
              };
            });
          const lanes = assignLanes(segments);

          // Se le corsie superano lo spazio disponibile, l'ultima riga è
          // riservata ai contatori "+N altri" per giorno.
          const overflowing = lanes.length > MAX_LANES;
          const visibleLanes = lanes.slice(
            0,
            overflowing ? MAX_LANES - 1 : lanes.length,
          );
          const hiddenLanes = lanes.slice(visibleLanes.length);
          const overflow = Array<number>(7).fill(0);
          for (const lane of hiddenLanes) {
            for (const seg of lane) {
              for (let i = seg.startIdx; i < seg.startIdx + seg.span; i++) {
                overflow[i] += 1;
              }
            }
          }

          return (
            <div key={wi} className="border-b border-line last:border-b-0">
              {/* Numeri dei giorni */}
              <div className="grid grid-cols-7">
                {cells.map(({ date, dayStr, inMonth }) => {
                  const isToday = dayStr === todayStr;
                  const isSelected = dayStr === selected;
                  const hasEvents = events.some((e) => occursOn(e, dayStr));
                  return (
                    <button
                      key={dayStr}
                      onClick={() => hasEvents && setSelected(dayStr)}
                      className={`flex justify-center pt-1 ${
                        hasEvents ? "cursor-pointer" : "cursor-default"
                      } ${isSelected ? "bg-accent/10" : ""}`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full font-body text-sm ${
                          inMonth ? "" : "text-ink-soft/50"
                        } ${isToday ? "bg-ink text-paper" : ""}`}
                      >
                        {date.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Eventi: righe ad altezza fissa con titolo visibile */}
              <div
                className="px-0.5 pb-1"
                style={{ height: MAX_LANES * (LANE_H + LANE_GAP) }}
              >
                {visibleLanes.map((lane, li) => (
                  <div
                    key={li}
                    className="grid grid-cols-7"
                    style={{ height: LANE_H, marginTop: LANE_GAP }}
                  >
                    {lane.map((seg) => {
                      const single = isSingleDay(
                        seg.event.start_date,
                        seg.event.end_date,
                      );
                      const isSaved = saved.has(seg.event.id);
                      const color = single
                        ? "bg-accent text-ink"
                        : "bg-accent-alt text-ink";
                      const ring = isSaved ? "ring-1 ring-ink/50" : "";
                      return (
                        <Link
                          key={seg.event.id}
                          href={`/eventi/${seg.event.id}`}
                          title={seg.event.title}
                          aria-label={seg.event.title}
                          style={{
                            gridColumn: `${seg.startIdx + 1} / span ${seg.span}`,
                            marginLeft: seg.continuesLeft ? 0 : 1,
                            marginRight: seg.continuesRight ? 0 : 1,
                          }}
                          className={`flex min-w-0 items-center overflow-hidden px-1 font-body text-[11px] leading-none hover:brightness-95 ${color} ${ring} ${
                            seg.continuesLeft ? "rounded-l-none" : "rounded-l"
                          } ${seg.continuesRight ? "rounded-r-none" : "rounded-r"}`}
                        >
                          {isSaved && <span className="mr-0.5 shrink-0">✓</span>}
                          <span className="truncate">{seg.event.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}

                {/* Riga "+N altri" per i giorni con eventi eccedenti */}
                {overflowing && (
                  <div
                    className="grid grid-cols-7"
                    style={{ height: LANE_H, marginTop: LANE_GAP }}
                  >
                    {cells.map(({ dayStr }, i) =>
                      overflow[i] > 0 ? (
                        <button
                          key={dayStr}
                          onClick={() => setSelected(dayStr)}
                          className="flex items-center px-1 font-body text-[11px] leading-none text-ink-soft hover:text-ink"
                        >
                          <span className="truncate">
                            {t("more", { count: overflow[i] })}
                          </span>
                        </button>
                      ) : (
                        <div key={dayStr} />
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card del mese a scorrimento orizzontale */}
      {events.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-head text-lg font-semibold capitalize">
            {t("eventsOf", { month: monthLabel })}
          </h3>
          {monthEvents.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-0.5 pb-2 pt-1">
              {monthEvents.map((e) => (
                <div key={e.id} className="w-64 shrink-0 snap-start sm:w-72">
                  <EventCard event={e} saved={saved.has(e.id)} />
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-ink-soft">
              {t("noEventsMonth")}
            </p>
          )}
        </div>
      )}

      {events.length === 0 && (
        <p className="py-8 text-center font-body text-ink-soft">
          {t("noEventsFilters")}
        </p>
      )}

      {/* Dettaglio giorno selezionato: bottom sheet / dialog */}
      <DayEventsSheet
        day={selected}
        events={selectedEvents}
        savedIds={saved}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

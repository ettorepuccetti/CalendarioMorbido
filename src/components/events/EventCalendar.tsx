"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import type { EventRow } from "@/lib/types/db";
import { coverUrl } from "@/lib/utils/storage";
import { formatDateRange, isSingleDay } from "@/lib/utils/dates";
import { formatPlace } from "@/lib/utils/location";
import {
  buildWeeks,
  packWeek,
  eventsInMonth,
  eventsOnDay,
  todayIso,
  type CalDay,
  type PackedBar,
} from "@/lib/utils/calendar";
import { makePlaceholder } from "@/lib/utils/placeholder";
import { eventTypeColor } from "@/lib/constants/event-types";
import DaySheet, { type FanAnchor } from "@/components/events/DaySheet";
import type { Locale } from "@/i18n/config";
import { BCP47 } from "@/i18n/config";

// ── Density config ────────────────────────────────────────────────────────
const D = { laneH: 18, gap: 2, max: 3, headerH: 36, badgeH: 22, pad: 8 };
const CELL_H = D.headerH + D.max * (D.laneH + D.gap) + D.badgeH + D.pad;
const laneTop = (lane: number) => D.headerH + lane * (D.laneH + D.gap);

// ── Bar component ─────────────────────────────────────────────────────────
function Bar({
  b,
  dimmed,
  hovIso,
}: {
  b: PackedBar;
  dimmed: boolean;
  hovIso: string | null;
}) {
  const span = b.endCol - b.startCol + 1;
  const left = `calc(${(b.startCol / 7) * 100}% + ${b.continuesLeft ? 0 : 4}px)`;
  const width = `calc(${(span / 7) * 100}% - ${(b.continuesLeft ? 0 : 4) + (b.continuesRight ? 0 : 4)}px)`;
  const typeColor = eventTypeColor(b.ev.event_type);
  const cls = [
    "cal-bar",
    "multi",
    b.continuesLeft ? "cl" : "",
    b.continuesRight ? "cr" : "",
    dimmed ? "dim" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      style={
        {
          left,
          width,
          top: laneTop(b.lane),
          height: D.laneH,
          ["--c"]: typeColor.bg,
          color: typeColor.fg,
          fontSize: 12.5,
        } as React.CSSProperties
      }
      title={b.ev.title}
    >
      <span className="cal-bar-label">{b.ev.title}</span>
      {b.continuesRight && <span className="cal-bar-arrow">→</span>}
    </div>
  );
}

// ── Slideshow card ────────────────────────────────────────────────────────
function SlideCard({
  ev,
  saved,
  onClick,
}: {
  ev: EventRow;
  saved: boolean;
  onClick: () => void;
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("calendar");
  const single = isSingleDay(ev.start_date, ev.end_date);
  const img = coverUrl(ev.cover_image_key);
  const fallback = makePlaceholder(ev.id);
  const city = formatPlace(ev.start_comune, ev.start_provincia);
  const typeColor = eventTypeColor(ev.event_type);

  return (
    <article
      className="ecard"
      style={
        {
          flex: "0 0 300px",
          scrollSnapAlign: "start",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 20,
          overflow: "hidden",
          cursor: "pointer",
          transition: "transform .2s, box-shadow .2s, border-color .2s",
          boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        } as React.CSSProperties
      }
      onClick={onClick}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          height: 172,
          backgroundImage: img ? undefined : `url("${fallback}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "var(--paper-soft)",
        }}
      >
        {img && (
          <Image
            src={img}
            alt={ev.title}
            fill
            sizes="300px"
            className="object-cover"
          />
        )}
        <span
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            padding: "5px 11px",
            borderRadius: 999,
            background: "rgba(255,255,255,.90)",
            backdropFilter: "blur(4px)",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--ink)",
            whiteSpace: "nowrap",
          }}
        >
          {single ? t("oneDay") : t("multiDay")}
        </span>
        {saved && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              padding: "5px 11px",
              borderRadius: 999,
              background: "var(--accent)",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--ink)",
              whiteSpace: "nowrap",
            }}
          >
            ✓
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px 18px" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 5,
            color: typeColor.bg,
          }}
        >
          {formatDateRange(ev.start_date, ev.end_date, locale)}
        </div>
        <h3
          className="font-head"
          style={{
            fontSize: 19,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.12,
            margin: "0 0 10px",
          }}
        >
          {ev.title}
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--ink-soft)",
            fontSize: 14,
            fontWeight: 500,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50% 50% 50% 0",
              transform: "rotate(-45deg)",
              background: "#e0573c",
              flexShrink: 0,
              boxShadow: "inset 0 0 0 2px rgba(255,255,255,.6)",
              display: "inline-block",
            }}
          />
          {city} · {ev.region}
        </div>
        {ev.event_type && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 10px",
              borderRadius: 999,
              background: typeColor.bg,
              color: typeColor.fg,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "capitalize",
            }}
          >
            {ev.event_type}
          </span>
        )}
      </div>
    </article>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function EventCalendar({
  events,
  savedIds = [],
}: {
  events: EventRow[];
  savedIds?: string[];
}) {
  const saved = useMemo(() => new Set(savedIds), [savedIds]);
  const t = useTranslations("calendar");
  const tTypes = useTranslations("eventTypes");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const monthFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(BCP47[locale], { month: "long", year: "numeric" }),
    [locale],
  );

  const today = todayIso();

  // Initial month: first month with a future/current event, else today.
  const initial = useMemo(() => {
    const next = events.find((e) => e.end_date >= today) ?? events[0];
    const ref = next ? new Date(next.start_date + "T00:00:00") : new Date();
    return { year: ref.getFullYear(), month: ref.getMonth() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [ym, setYm] = useState(initial);
  const [hovIso, setHovIso] = useState<string | null>(null);
  const [fan, setFan] = useState<{
    day: CalDay;
    anchor: FanAnchor;
    events: EventRow[];
  } | null>(null);

  const weeks = useMemo(
    () => buildWeeks(ym.year, ym.month),
    [ym.year, ym.month],
  );

  const monthEvents = useMemo(
    () => eventsInMonth(events, ym.year, ym.month),
    [events, ym.year, ym.month],
  );

  const packed = useMemo(
    () => weeks.map((w) => packWeek(w, events)),
    [weeks, events],
  );

  const monthLabel = monthFmt.format(new Date(ym.year, ym.month, 1));

  // Close fan on resize.
  useEffect(() => {
    if (!fan) return;
    const close = () => setFan(null);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [fan]);

  // Lock body scroll while fan is open.
  useEffect(() => {
    document.body.style.overflow = fan ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [fan]);

  const nav = useCallback((delta: number) => {
    setFan(null);
    setYm((s) => {
      const m = s.month + delta;
      return { year: s.year + Math.floor(m / 12), month: ((m % 12) + 12) % 12 };
    });
  }, []);

  const onCellClick = useCallback(
    (day: CalDay, rect: DOMRect) => {
      const dayEvs = eventsOnDay(events, day.iso);
      if (dayEvs.length === 0) return;
      setFan({ day, anchor: rect, events: dayEvs });
    },
    [events],
  );

  // ── Slideshow scroll ───────────────────────────────────────────────────
  const scrollerRef = useRef<HTMLDivElement>(null);

  const nudge = (dir: number) => {
    scrollerRef.current?.scrollTo({
      left: (scrollerRef.current.scrollLeft ?? 0) + dir * 340,
      behavior: "smooth",
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav(-1)}
          className="chip"
          aria-label={t("prevMonth")}
        >
          ←
        </button>
        <h2 className="font-head text-2xl font-semibold capitalize">
          {monthLabel}
        </h2>
        <button
          onClick={() => nav(1)}
          className="chip"
          aria-label={t("nextMonth")}
        >
          →
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 font-body text-sm text-ink-soft">
        {(["ciclostorica", "gravel", "cicloturistica", "mtb", "bikepacking", "randonnee"] as const).map((type) => {
          const c = eventTypeColor(type);
          return (
            <span key={type} className="flex items-center gap-1.5">
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: c.bg,
                  flexShrink: 0,
                }}
              />
              <span>{tTypes(type)}</span>
            </span>
          );
        })}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 18,
          overflow: "hidden",
          background: "var(--paper)",
          boxShadow: "0 1px 0 rgba(0,0,0,.02)",
        }}
      >
        {/* Weekday headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            background: "var(--paper-soft)",
            borderBottom: "1px solid var(--line)",
          }}
        >
          {(t.raw("weekdays") as string[]).map((wd) => (
            <div
              key={wd}
              style={{
                padding: "12px 8px",
                color: "var(--ink-soft)",
                fontSize: 13,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {weeks.map((week, wi) => {
            const placed = packed[wi]!;

            // Count hidden events per day (lanes ≥ max)
            const hiddenByDay: Record<number, number> = {};
            const totalByDay: Record<number, number> = {};
            for (const b of placed) {
              for (let c = b.startCol; c <= b.endCol; c++) {
                totalByDay[c] = (totalByDay[c] ?? 0) + 1;
                if (b.lane >= D.max) hiddenByDay[c] = (hiddenByDay[c] ?? 0) + 1;
              }
            }

            return (
              <div
                key={wi}
                style={{
                  position: "relative",
                  height: CELL_H,
                  borderBottom:
                    wi < weeks.length - 1 ? "1px solid var(--line)" : "none",
                }}
              >
                {/* Day cells */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7,1fr)",
                    height: "100%",
                  }}
                >
                  {week.days.map((day) => {
                    const isToday = day.iso === today;
                    const total = totalByDay[day.col] ?? 0;
                    const hidden = hiddenByDay[day.col] ?? 0;
                    const isHov = hovIso === day.iso;
                    const isOpen = fan?.day.iso === day.iso;

                    return (
                      <div
                        key={day.iso}
                        style={{
                          position: "relative",
                          borderRight:
                            day.col < 6
                              ? "1px solid var(--paper-soft)"
                              : "none",
                          padding: "5px 4px 0",
                          cursor: total ? "pointer" : "default",
                          background: isOpen
                            ? "oklch(0.95 0.04 250 / 0.25)"
                            : isHov && total
                              ? "var(--paper-soft)"
                              : day.inMonth
                                ? undefined
                                : "repeating-linear-gradient(135deg,var(--paper),var(--paper) 6px,var(--paper-soft) 6px,var(--paper-soft) 12px)",
                          transition: "background .15s",
                        }}
                        data-daycell=""
                        onMouseEnter={() => setHovIso(day.iso)}
                        onMouseLeave={() =>
                          setHovIso((v) => (v === day.iso ? null : v))
                        }
                        onClick={(e) =>
                          total &&
                          onCellClick(
                            day,
                            e.currentTarget.getBoundingClientRect(),
                          )
                        }
                      >
                        {/* Day number */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 24,
                            height: 24,
                            margin: "0 auto",
                            fontSize: 13,
                            fontWeight: 600,
                            color: day.inMonth
                              ? "var(--ink)"
                              : "var(--ink-soft)",
                            borderRadius: isToday ? "50%" : undefined,
                            background: isToday ? "var(--ink)" : undefined,
                            ...(isToday ? { color: "var(--paper)" } : {}),
                          }}
                        >
                          {day.dayNum}
                        </div>

                        {/* +N overflow badge */}
                        {hidden > 0 && (
                          <button
                            className="cal-badge"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCellClick(
                                day,
                                e.currentTarget
                                  .closest("[data-daycell]")!
                                  .getBoundingClientRect(),
                              );
                            }}
                          >
                            <span className="cal-badge-fan">
                              <i />
                              <i />
                              <i />
                            </span>
                            +{hidden}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bar layer */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                  }}
                >
                  {placed
                    .filter((b) => b.lane < D.max)
                    .map((b, i) => {
                      const onHovDay =
                        hovIso != null &&
                        b.ev.start_date <= hovIso &&
                        b.ev.end_date >= hovIso;
                      return (
                        <Bar
                          key={`${b.ev.id}-${i}`}
                          b={b}
                          dimmed={hovIso != null && !onHovDay}
                          hovIso={hovIso}
                        />
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slideshow */}
      {monthEvents.length > 0 && (
        <section style={{ marginTop: 36 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h2
              className="font-head"
              style={{
                fontSize: "clamp(20px,2.6vw,28px)",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: 0,
                textTransform: "capitalize",
              }}
            >
              {t("eventsOf", { month: monthLabel })}
            </h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => nudge(-1)}
                className="chip"
                aria-label="Precedenti"
              >
                ←
              </button>
              <button
                onClick={() => nudge(1)}
                className="chip"
                aria-label="Successivi"
              >
                →
              </button>
            </div>
          </div>

          <div
            ref={scrollerRef}
            style={{
              display: "flex",
              gap: 20,
              overflowX: "auto",
              padding: "4px 2px 16px",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "thin",
            }}
          >
            {monthEvents.map((ev) => (
              <SlideCard
                key={ev.id}
                ev={ev}
                saved={saved.has(ev.id)}
                onClick={() => router.push(`/eventi/${ev.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <p className="py-8 text-center font-body text-ink-soft">
          {t("noEventsFilters")}
        </p>
      )}

      {/* Day sheet */}
      {fan && (
        <DaySheet
          key={fan.day.iso}
          anchor={fan.anchor}
          day={fan.day}
          events={fan.events}
          onClose={() => setFan(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventRow } from "@/lib/types/db";
import Image from "next/image";
import { formatDateRange } from "@/lib/utils/dates";
import { eventTypeColor } from "@/lib/constants/event-types";
import { parseIso } from "@/lib/utils/calendar";
import { coverUrl } from "@/lib/utils/storage";
import { makePlaceholder } from "@/lib/utils/placeholder";

// FanAnchor kept for API compatibility — no longer used for positioning.
export type FanAnchor = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function numDays(start: string, end: string): number {
  return Math.round(
    (parseIso(end).getTime() - parseIso(start).getTime()) / 86400000,
  ) + 1;
}

// Responsive sheet: bottom sheet on mobile, centered dialog on desktop.
export default function RadialFan({
  day,
  events,
  onClose,
}: {
  anchor: FanAnchor;
  day: { iso: string };
  events: EventRow[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [shown, setShown] = useState(false);

  const [yr, m0, dayNum] = day.iso.split("-").map(Number);
  const d = new Date(yr!, (m0 ?? 1) - 1, dayNum ?? 1);
  const WD = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const label = `${WD[d.getDay()]!} ${d.getDate()}`;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      setShown(false);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}
        style={{
          background: "rgba(24,22,18,.45)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      />

      {/* Panel: bottom sheet on mobile, centered dialog on desktop */}
      <div
        className={`cal-sheet absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-[22px] bg-paper shadow-xl transition-all duration-300 ease-out sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[80vh] sm:max-w-md sm:rounded-[18px] ${
          shown
            ? "translate-y-0 sm:scale-100 sm:opacity-100"
            : "translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0"
        }`}
      >
        {/* Handle (mobile only) */}
        <div className="flex justify-center pb-1.5 pt-3 sm:hidden">
          <div className="h-1 w-9 rounded-full bg-line" />
        </div>

        {/* Header */}
        <div
          style={{
            padding: "6px 20px 12px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}>
            {label}
          </span>
          <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>
            {events.length} eventi
          </span>
        </div>

        {/* Scrollable list */}
        <div
          style={{
            overflowY: "auto",
            padding: "10px 16px 32px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {events.map((ev) => {
            const tc = eventTypeColor(ev.event_type);
            const img = coverUrl(ev.cover_image_key);

            return (
              <button
                key={ev.id}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: "1.5px solid var(--line)",
                  background: "var(--paper)",
                  marginBottom: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
                onClick={() => {
                  onClose();
                  router.push(`/eventi/${ev.id}`);
                }}
              >
                {/* Day-count badge */}
                <span
                  style={{
                    minWidth: 28,
                    height: 20,
                    padding: "0 6px",
                    borderRadius: 999,
                    background: tc.bg,
                    color: tc.fg,
                    marginTop: 2,
                    flexShrink: 0,
                    fontSize: 10,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {numDays(ev.start_date, ev.end_date)}g
                </span>

                <div style={{ minWidth: 0, flex: 1 }}>
                  {/* Cover image */}
                  <div
                    style={{
                      width: "100%",
                      height: 90,
                      borderRadius: 10,
                      overflow: "hidden",
                      position: "relative",
                      marginBottom: 8,
                      pointerEvents: "none",
                    }}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={ev.title}
                        fill
                        sizes="(min-width: 640px) 420px, 280px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url("${makePlaceholder(ev.id, 280, 90)}")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    )}
                  </div>

                  {/* Title */}
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      lineHeight: 1.2,
                      color: "var(--ink)",
                      marginBottom: 4,
                    }}
                  >
                    {ev.title}
                  </div>

                  {/* Dates */}
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--ink)",
                      marginBottom: 4,
                    }}
                  >
                    {formatDateRange(ev.start_date, ev.end_date, "it")}
                  </div>

                  {/* Region */}
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      marginBottom: 6,
                    }}
                  >
                    {ev.region}
                  </div>

                  {/* Type chip */}
                  {ev.event_type && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "3px 9px",
                        borderRadius: 999,
                        background: tc.bg,
                        color: tc.fg,
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

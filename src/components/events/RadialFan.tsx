"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventRow } from "@/lib/types/db";
import { formatDateRange } from "@/lib/utils/dates";
import { eventTypeColor } from "@/lib/constants/event-types";

export type FanAnchor = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type NodeTarget = { x: number; y: number };

function arcTargets(
  n: number,
  cell: { x: number; y: number },
  vw: number,
  vh: number,
): NodeTarget[] {
  const base = Math.atan2(vh / 2 - cell.y, vw / 2 - cell.x);
  const spread = (Math.min(60 + n * 15, 248) * Math.PI) / 180;
  const radius = Math.min(128 + n * 11, 250);
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const a = base - spread / 2 + spread * t;
    return { x: Math.cos(a) * radius, y: Math.sin(a) * radius };
  });
}

// ── Mobile bottom sheet ───────────────────────────────────────────────────
function MobileSheet({
  day,
  events,
  expandedId,
  onExpand,
  onNavigate,
  onClose,
}: {
  day: { iso: string };
  events: EventRow[];
  expandedId: string | null;
  onExpand: (id: string) => void;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const [y, m0, dayNum] = day.iso.split("-").map(Number);
  const d = new Date(y!, (m0 ?? 1) - 1, dayNum ?? 1);
  const WD = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const label = `${WD[d.getDay()]!} ${d.getDate()}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(24,22,18,.45)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
      }}
      onClick={onClose}
    >
      <div
        className="cal-sheet"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--paper)",
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          maxHeight: "76vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 -8px 32px rgba(0,0,0,.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 6px",
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: "var(--line)",
            }}
          />
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
          <span
            style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em" }}
          >
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
            const expanded = expandedId === ev.id;
            const tc = eventTypeColor(ev.event_type);
            return (
              <button
                key={ev.id}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: `1.5px solid ${expanded ? tc.bg : "var(--line)"}`,
                  background: expanded
                    ? `color-mix(in oklab, var(--paper), ${tc.bg} 8%)`
                    : "var(--paper)",
                  marginBottom: 8,
                  cursor: "pointer",
                  transition: "border-color .18s, background .18s",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
                onClick={() =>
                  expanded ? onNavigate(ev.id) : onExpand(ev.id)
                }
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: tc.bg,
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      lineHeight: 1.2,
                      color: "var(--ink)",
                    }}
                  >
                    {ev.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--ink-soft)",
                      marginTop: 3,
                    }}
                  >
                    {ev.region}
                  </div>

                  {expanded && (
                    <div
                      style={{
                        marginTop: 10,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--ink)",
                        }}
                      >
                        {formatDateRange(ev.start_date, ev.end_date, "it")}
                      </span>
                      {ev.event_type && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "3px 9px",
                            borderRadius: 999,
                            background: tc.bg,
                            color: tc.fg,
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            textTransform: "capitalize",
                            alignSelf: "flex-start",
                          }}
                        >
                          {ev.event_type}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--ink-soft)",
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                      >
                        Tocca di nuovo per aprire →
                      </span>
                    </div>
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

// ── Desktop arc fan ───────────────────────────────────────────────────────
export default function RadialFan({
  anchor,
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
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const isMobile = vw < 640;

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleNode = (ev: EventRow, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedId === ev.id) {
      router.push(`/eventi/${ev.id}`);
    } else {
      setExpandedId(ev.id);
    }
  };

  if (isMobile) {
    return (
      <MobileSheet
        day={day}
        events={events}
        expandedId={expandedId}
        onExpand={setExpandedId}
        onNavigate={(id) => router.push(`/eventi/${id}`)}
        onClose={onClose}
      />
    );
  }

  // ── Arc layout ──────────────────────────────────────────────────────────
  const cell = {
    x: anchor.left + anchor.width / 2,
    y: anchor.top + anchor.height / 2,
  };
  const targets = arcTargets(events.length, cell, vw, vh);

  const exX = 220, exY = 90, M = 22, MT = 26;
  const xs = targets.map((t) => t.x);
  const ys = targets.map((t) => t.y);
  const bbMinX = Math.min(0, ...xs) - exX;
  const bbMaxX = Math.max(0, ...xs) + exX;
  const bbMinY = Math.min(0, ...ys) - exY;
  const bbMaxY = Math.max(0, ...ys) + exY;
  const clamp = (v: number, a: number, b: number) =>
    Math.max(a, Math.min(b, v));
  const lowX = M - bbMinX, highX = vw - M - bbMaxX;
  const lowY = MT - bbMinY, highY = vh - M - bbMaxY;
  const ox =
    highX < lowX
      ? vw / 2 - (bbMinX + bbMaxX) / 2
      : clamp(cell.x, lowX, highX);
  const oy =
    highY < lowY
      ? vh / 2 - (bbMinY + bbMaxY) / 2
      : clamp(cell.y, lowY, highY);
  const shifted = Math.hypot(ox - cell.x, oy - cell.y) > 8;

  const [yr, m0, dayNum] = day.iso.split("-").map(Number);
  const d = new Date(yr!, (m0 ?? 1) - 1, dayNum ?? 1);
  const WD = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const hubLabel = `${WD[d.getDay()]!} ${d.getDate()}`;

  return (
    <div
      className="cal-fan-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(24,22,18,.40)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
      }}
      onClick={onClose}
    >
      {/* Spokes */}
      <svg
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        width={vw}
        height={vh}
      >
        {shifted && (
          <line
            x1={cell.x}
            y1={cell.y}
            x2={ox}
            y2={oy}
            style={{
              stroke: "var(--accent-alt)",
              opacity: 0.6,
              strokeWidth: 2,
              strokeDasharray: "2 6",
              strokeLinecap: "round",
            }}
          />
        )}
        {targets.map((t, i) => (
          <line
            key={i}
            x1={ox}
            y1={oy}
            x2={ox + t.x}
            y2={oy + t.y}
            className="cal-fan-spoke"
            style={{
              stroke: eventTypeColor(events[i]?.event_type).bg,
              opacity: 0.42,
              strokeWidth: 2,
              strokeLinecap: "round",
              ["--d" as string]: `${i * 42}ms`,
            }}
          />
        ))}
      </svg>

      {shifted && (
        <span
          style={{
            position: "absolute",
            left: cell.x,
            top: cell.y,
            transform: "translate(-50%,-50%)",
            display: "block",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "var(--accent-alt)",
            border: "3px solid var(--paper)",
            boxShadow: "0 2px 8px rgba(0,0,0,.3)",
          }}
        />
      )}

      {/* Hub */}
      <div
        className="cal-fan-hub"
        style={{
          position: "absolute",
          left: ox,
          top: oy,
          transform: "translate(-50%,-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: "var(--paper)",
          color: "var(--ink)",
          boxShadow: "0 10px 30px rgba(0,0,0,.22)",
          border: "2px solid var(--accent-alt)",
          userSelect: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          {hubLabel}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--ink-soft)",
            marginTop: 1,
            whiteSpace: "nowrap",
          }}
        >
          {events.length} eventi
        </span>
      </div>

      {/* Nodes */}
      {events.map((ev, i) => {
        const t = targets[i]!;
        const expanded = expandedId === ev.id;
        const tc = eventTypeColor(ev.event_type);

        return (
          <button
            key={ev.id}
            className="cal-fan-node"
            style={
              {
                position: "absolute",
                left: ox,
                top: oy,
                transform: `translate(-50%,-50%) translate(${t.x}px,${t.y}px)`,
                ["--d"]: `${i * 42}ms`,
                width: expanded ? 220 : undefined,
                maxWidth: expanded ? 220 : 196,
                padding: expanded
                  ? "10px 16px 12px 18px"
                  : "8px 14px 8px 16px",
                borderRadius: 13,
                border: `1.5px solid ${expanded ? tc.bg : "var(--line)"}`,
                background: "var(--paper)",
                textAlign: "left",
                boxShadow: expanded
                  ? `0 12px 30px rgba(0,0,0,.22), 0 0 0 2px ${tc.bg}`
                  : "0 8px 24px rgba(0,0,0,.16)",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 2,
                cursor: "pointer",
                transition:
                  "box-shadow .18s, border-color .18s, width .18s, padding .18s",
              } as React.CSSProperties
            }
            onClick={(e) => handleNode(ev, e)}
          >
            <span
              style={{
                position: "absolute",
                top: -6,
                left: -6,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: tc.bg,
                border: "3px solid var(--paper)",
                boxShadow: "0 2px 6px rgba(0,0,0,.18)",
              }}
            />
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 168,
                color: "var(--ink)",
              }}
            >
              {ev.title}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--ink-soft)",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {ev.region}
            </span>

            {expanded && (
              <>
                <div
                  style={{
                    width: "100%",
                    height: 1,
                    background: "var(--line)",
                    margin: "6px 0 4px",
                  }}
                />
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}
                >
                  {formatDateRange(ev.start_date, ev.end_date, "it")}
                </span>
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
                      marginTop: 2,
                    }}
                  >
                    {ev.event_type}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--ink-soft)",
                    marginTop: 4,
                    fontStyle: "italic",
                  }}
                >
                  Tocca di nuovo per aprire →
                </span>
              </>
            )}
          </button>
        );
      })}

      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 26,
          transform: "translateX(-50%)",
          color: "#fff",
          opacity: 0.82,
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.01em",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {expandedId
          ? "Tocca di nuovo per aprire · Esc per chiudere"
          : "Tocca un evento · Esc per chiudere"}
      </div>
    </div>
  );
}

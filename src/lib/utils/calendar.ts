import type { EventRow } from "@/lib/types/db";

export type CalDay = {
  date: Date;
  iso: string;
  dayNum: number;
  inMonth: boolean;
  col: number; // 0 = Mon … 6 = Sun
};

export type CalWeek = {
  days: CalDay[];
  start: Date;
  end: Date;
};

export type PackedBar = {
  ev: EventRow;
  lane: number;
  startCol: number;
  endCol: number;
  continuesLeft: boolean;
  continuesRight: boolean;
  single: boolean;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dateKey(dt: Date): string {
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function addDays(dt: Date, n: number): Date {
  const x = new Date(dt);
  x.setDate(x.getDate() + n);
  return x;
}

function startOfDay(dt: Date): Date {
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

export function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

function dayDiff(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function buildWeeks(year: number, month: number): CalWeek[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // 0 = Monday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const nWeeks = Math.ceil((offset + daysInMonth) / 7);
  const gridStart = addDays(first, -offset);
  const weeks: CalWeek[] = [];
  for (let w = 0; w < nWeeks; w++) {
    const days: CalDay[] = [];
    for (let d = 0; d < 7; d++) {
      const dt = addDays(gridStart, w * 7 + d);
      days.push({
        date: dt,
        iso: dateKey(dt),
        dayNum: dt.getDate(),
        inMonth: dt.getMonth() === month,
        col: d,
      });
    }
    weeks.push({ days, start: days[0]!.date, end: days[6]!.date });
  }
  return weeks;
}

export function packWeek(week: CalWeek, events: EventRow[]): PackedBar[] {
  const ws = startOfDay(week.start);
  const we = startOfDay(week.end);
  const hits = events
    .map((e) => ({ e, s: parseIso(e.start_date), en: parseIso(e.end_date) }))
    .filter((o) => o.en >= ws && o.s <= we)
    .sort(
      (a, b) =>
        a.s.getTime() - b.s.getTime() ||
        b.en.getTime() - b.s.getTime() - (a.en.getTime() - a.s.getTime()) ||
        a.e.id.localeCompare(b.e.id),
    );

  const lanes: (number | undefined)[] = [];
  const placed: PackedBar[] = [];

  for (const o of hits) {
    const startCol = Math.max(0, dayDiff(ws, o.s));
    const endCol = Math.min(6, dayDiff(ws, o.en));
    let lane = 0;
    while (lanes[lane] != null && lanes[lane]! >= startCol) lane++;
    lanes[lane] = endCol;
    placed.push({
      ev: o.e,
      lane,
      startCol,
      endCol,
      continuesLeft: o.s < ws,
      continuesRight: o.en > we,
      single: o.e.start_date === o.e.end_date,
    });
  }
  return placed;
}

export function eventsInMonth(
  events: EventRow[],
  year: number,
  month: number,
): EventRow[] {
  const ms = new Date(year, month, 1);
  const me = new Date(year, month + 1, 0);
  return events
    .filter((e) => parseIso(e.end_date) >= ms && parseIso(e.start_date) <= me)
    .sort(
      (a, b) =>
        a.start_date.localeCompare(b.start_date) ||
        a.title.localeCompare(b.title),
    );
}

export function eventsOnDay(events: EventRow[], iso: string): EventRow[] {
  const d = parseIso(iso);
  return events
    .filter((e) => parseIso(e.start_date) <= d && parseIso(e.end_date) >= d)
    .sort(
      (a, b) =>
        +(a.start_date === a.end_date) - +(b.start_date === b.end_date) ||
        a.start_date.localeCompare(b.start_date),
    );
}

export function todayIso(): string {
  return dateKey(new Date());
}

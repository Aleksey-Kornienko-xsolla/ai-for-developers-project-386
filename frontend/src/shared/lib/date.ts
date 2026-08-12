const SLOT_TIME_FORMAT = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DAY_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const FULL_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatSlotTime(isoUtc: string): string {
  return SLOT_TIME_FORMAT.format(new Date(isoUtc));
}

export function formatDay(isoUtc: string): string {
  return DAY_FORMAT.format(new Date(isoUtc));
}

export function formatBookingDateTime(isoUtc: string): string {
  return FULL_DATE_FORMAT.format(new Date(isoUtc));
}

export function dayKey(isoUtc: string): string {
  const d = new Date(isoUtc);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

const MONTH_YEAR_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
});

const WEEKDAY_NARROW = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });

export function formatMonthYear(iso: string): string {
  return MONTH_YEAR_FORMAT.format(new Date(iso));
}

export function weekdayShortLabels(): string[] {
  const base = new Date(1970, 0, 4);
  const labels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    labels.push(WEEKDAY_NARROW.format(d));
  }
  return labels;
}

export function dayNumber(iso: string): number {
  return new Date(iso).getDate();
}

export function isSameMonth(iso: string, monthDate: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
}

export interface CalendarCell {
  iso: string;
  date: Date;
  inMonth: boolean;
}

export function calendarGridDays(monthDate: Date): CalendarCell[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startWeekday);
  const cells: CalendarCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const iso = date.toISOString();
    cells.push({ iso, date, inMonth: date.getMonth() === month });
  }
  return cells;
}
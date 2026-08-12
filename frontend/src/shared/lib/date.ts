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
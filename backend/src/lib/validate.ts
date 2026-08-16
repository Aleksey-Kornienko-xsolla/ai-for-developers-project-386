export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,49}$/;
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const SLOT_ID_RE = /^\d{8}T\d{4}$/;

export function isSlug(v: unknown): v is string {
  return typeof v === "string" && SLUG_RE.test(v);
}

export function isEmail(v: unknown): v is string {
  return typeof v === "string" && EMAIL_RE.test(v);
}

export function isDurationMinutes(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 5 && v <= 480;
}

export function isWorkHour(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 23;
}

export function isSlotId(v: unknown): v is string {
  return typeof v === "string" && SLOT_ID_RE.test(v);
}

export function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.length >= 1;
}
import { randomUUID } from "node:crypto";

export interface Guest {
  name: string;
  email: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export interface Slot {
  id: string;
  startUtc: string;
  endUtc: string;
  durationMinutes: number;
  status: "available" | "booked";
}

export interface Booking {
  id: string;
  slotId: string;
  eventType: EventType;
  startUtc: string;
  endUtc: string;
  guest: Guest;
  createdAt: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
}

const SEED_OWNER: Owner = {
  id: "owner",
  name: "Alex Owner",
  email: "owner@example.com",
};

const SEED_EVENT_TYPES: EventType[] = [
  {
    id: "intro-call",
    name: "Intro call",
    description: "Короткая знакомительная встреча, чтобы обсудить ваши задачи.",
    durationMinutes: 30,
  },
  {
    id: "consultation",
    name: "Консультация",
    description: "Глубокая консультация с разбором конкретной ситуации.",
    durationMinutes: 60,
  },
];

interface MockState {
  owner: Owner;
  eventTypes: EventType[];
  bookings: Booking[];
  bookedSlots: Set<string>;
  idempotencyIndex: Map<string, Booking>;
}

function getState(): MockState {
  const g = globalThis as unknown as { __MOCK_STATE__?: MockState };
  if (!g.__MOCK_STATE__) {
    g.__MOCK_STATE__ = {
      owner: { ...SEED_OWNER },
      eventTypes: SEED_EVENT_TYPES.map((t) => ({ ...t })),
      bookings: [],
      bookedSlots: new Set<string>(),
      idempotencyIndex: new Map<string, Booking>(),
    };
  }
  return g.__MOCK_STATE__;
}

export const db = {
  getOwner: () => {
    const s = getState();
    return { ...s.owner };
  },
  setOwner: (next: Owner) => {
    const s = getState();
    s.owner = { ...next };
    return { ...s.owner };
  },
  listEventTypes: () => getState().eventTypes.map((t) => ({ ...t })),
  getEventType: (id: string) => getState().eventTypes.find((t) => t.id === id) ?? null,
  createEventType: (t: EventType) => {
    const s = getState();
    s.eventTypes.push({ ...t });
    return { ...t };
  },
  updateEventType: (id: string, patch: Omit<EventType, "id">) => {
    const s = getState();
    const idx = s.eventTypes.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    s.eventTypes[idx] = { ...s.eventTypes[idx], ...patch };
    return { ...s.eventTypes[idx] };
  },
  deleteEventType: (id: string): { ok: true } | { ok: false; reason: "not_found" | "has_bookings" } => {
    const s = getState();
    const idx = s.eventTypes.findIndex((t) => t.id === id);
    if (idx === -1) return { ok: false, reason: "not_found" };
    if (s.bookings.some((b) => b.eventType.id === id)) {
      return { ok: false, reason: "has_bookings" };
    }
    s.eventTypes.splice(idx, 1);
    return { ok: true };
  },
  listBookings: () => getState().bookings.map((b) => ({ ...b, eventType: { ...b.eventType } })),
  addBooking: (b: Booking) => {
    const s = getState();
    s.bookings.push(b);
    s.bookedSlots.add(b.slotId);
    return { ...b, eventType: { ...b.eventType } };
  },
  isSlotBooked: (slotId: string) => getState().bookedSlots.has(slotId),
  markSlotBooked: (slotId: string) => getState().bookedSlots.add(slotId),
  getIdempotentBooking: (key: string) => getState().idempotencyIndex.get(key) ?? null,
  rememberIdempotent: (key: string, b: Booking) => {
    getState().idempotencyIndex.set(key, b);
  },
  newBookingId: () => randomUUID(),
};

/** Сет-слот в GlobalKey как YYYYMMDDTHHMM (UTC). */
export function slotIdFromDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`
  );
}

/** Генерация слотов на 14 дней вперёд от сегодня (UTC), сетка 15 мин, окно 9:00–18:00. */
export function generateSlots(eventType: EventType, daysAhead = 14): Slot[] {
  const slots: Slot[] = [];
  const now = new Date();
  const startDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  for (let d = 0; d < daysAhead; d++) {
    const day = new Date(startDay);
    day.setUTCDate(startDay.getUTCDate() + d);
    for (let m = 9 * 60; m < 18 * 60; m += 15) {
      const start = new Date(day);
      start.setUTCMinutes(m, 0, 0);
      const end = new Date(start.getTime() + eventType.durationMinutes * 60_000);
      const slotId = slotIdFromDate(start);
      // skip past slots today
      if (start.getTime() < now.getTime()) continue;
      const booked = db.isSlotBooked(slotId);
      // respect duration: end must fit within a 15-min grid aligned availability
      slots.push({
        id: slotId,
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
        durationMinutes: eventType.durationMinutes,
        status: booked ? "booked" : "available",
      });
    }
  }
  return slots;
}

export function errorResponse(status: number, message: string): ErrorResponse {
  return { status, message };
}
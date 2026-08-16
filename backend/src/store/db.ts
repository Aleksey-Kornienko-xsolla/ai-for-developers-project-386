import { randomUUID } from "node:crypto";
import type { Booking, EventType, Owner } from "../types.js";
import { SEED_EVENT_TYPES, SEED_OWNER } from "./seed.js";

interface State {
  owner: Owner;
  eventTypes: EventType[];
  bookings: Booking[];
  bookedSlots: Set<string>;
  idempotencyIndex: Map<string, Booking>;
}

const state: State = {
  owner: { ...SEED_OWNER },
  eventTypes: SEED_EVENT_TYPES.map((t) => ({ ...t })),
  bookings: [],
  bookedSlots: new Set<string>(),
  idempotencyIndex: new Map<string, Booking>(),
};

export const db = {
  getOwner(): Owner {
    return { ...state.owner };
  },

  setOwner(next: Owner): Owner {
    state.owner = { ...next };
    return { ...state.owner };
  },

  listEventTypes(): EventType[] {
    return state.eventTypes.map((t) => ({ ...t }));
  },

  getEventType(id: string): EventType | null {
    return state.eventTypes.find((t) => t.id === id) ?? null;
  },

  createEventType(input: EventType): EventType {
    state.eventTypes.push({ ...input });
    return { ...input };
  },

  updateEventType(id: string, patch: Omit<EventType, "id">): EventType | null {
    const idx = state.eventTypes.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    state.eventTypes[idx] = { ...state.eventTypes[idx]!, ...patch };
    return { ...state.eventTypes[idx]! };
  },

  deleteEventType(id: string): { ok: true } | { ok: false; reason: "not_found" | "has_bookings" } {
    const idx = state.eventTypes.findIndex((t) => t.id === id);
    if (idx === -1) return { ok: false, reason: "not_found" };
    if (state.bookings.some((b) => b.eventType.id === id)) {
      return { ok: false, reason: "has_bookings" };
    }
    state.eventTypes.splice(idx, 1);
    return { ok: true };
  },

  listBookings(): Booking[] {
    return state.bookings.map((b) => ({ ...b, eventType: { ...b.eventType }, guest: { ...b.guest } }));
  },

  addBooking(b: Booking): Booking {
    state.bookings.push(b);
    state.bookedSlots.add(b.slotId);
    return { ...b, eventType: { ...b.eventType }, guest: { ...b.guest } };
  },

  isSlotBooked(slotId: string): boolean {
    return state.bookedSlots.has(slotId);
  },

  getIdempotentBooking(key: string): Booking | null {
    return state.idempotencyIndex.get(key) ?? null;
  },

  rememberIdempotent(key: string, b: Booking): void {
    state.idempotencyIndex.set(key, b);
  },

  newBookingId(): string {
    return randomUUID();
  },
};
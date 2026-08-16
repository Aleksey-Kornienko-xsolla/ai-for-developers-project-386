import type { EventType, Slot, SlotStatus } from "../types.js";
import { db } from "./db.js";

/** Slot id slug: YYYYMMDDTHHMM (UTC). */
export function slotIdFromDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`
  );
}

export interface GenerateSlotsOptions {
  workStartHour: number;
  workEndHour: number;
  daysAhead?: number;
  fromUtc?: Date;
  toUtc?: Date;
  now?: Date;
}

/**
 * Generate availability slots for the next 14 days (default), 15-minute grid,
 * within the owner's working hours (UTC). Past slots are skipped.
 */
export function generateSlots(eventType: EventType, opts: GenerateSlotsOptions, daysAhead = opts.daysAhead ?? 14): Slot[] {
  const slots: Slot[] = [];
  const now = opts.now ?? new Date();
  const startDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const fromMs = opts.fromUtc ? opts.fromUtc.getTime() : -Infinity;
  const toMs = opts.toUtc ? opts.toUtc.getTime() : Infinity;

  for (let d = 0; d < daysAhead; d++) {
    const day = new Date(startDay);
    day.setUTCDate(startDay.getUTCDate() + d);
    for (let m = opts.workStartHour * 60; m < opts.workEndHour * 60; m += 15) {
      const start = new Date(day);
      start.setUTCMinutes(m, 0, 0);
      if (start.getTime() < now.getTime()) continue;
      const startMs = start.getTime();
      if (startMs < fromMs || startMs >= toMs) continue;
      const end = new Date(start.getTime() + eventType.durationMinutes * 60_000);
      const id = slotIdFromDate(start);
      const status: SlotStatus = db.isSlotBooked(id) ? "booked" : "available";
      slots.push({
        id,
        startUtc: start.toISOString(),
        endUtc: end.toISOString(),
        durationMinutes: eventType.durationMinutes,
        status,
      });
    }
  }
  return slots;
}
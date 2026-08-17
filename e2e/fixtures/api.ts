import type { APIRequestContext } from "@playwright/test";

const API_BASE = "http://127.0.0.1:8080/api/v1";

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
  eventType: { id: string; name: string; description: string; durationMinutes: number };
  startUtc: string;
  endUtc: string;
  guest: { name: string; email: string };
  createdAt: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
}

export async function listEventTypes(request: APIRequestContext): Promise<EventType[]> {
  const res = await request.get(`${API_BASE}/event-types`);
  if (!res.ok()) throw new Error(`GET /event-types failed: ${res.status()}`);
  return res.json();
}

export async function getAvailability(
  request: APIRequestContext,
  eventTypeId: string,
): Promise<Slot[]> {
  const res = await request.get(`${API_BASE}/event-types/${eventTypeId}/availability`);
  if (!res.ok()) throw new Error(`GET /availability failed: ${res.status()}`);
  return res.json();
}

export async function createBooking(
  request: APIRequestContext,
  eventTypeId: string,
  body: { slotId: string; guest: { name: string; email: string } },
  idempotencyKey: string,
): Promise<{ status: number; body: Booking | { status: number; message: string } }> {
  const res = await request.post(`${API_BASE}/event-types/${eventTypeId}/bookings`, {
    headers: { "Idempotency-Key": idempotencyKey },
    data: body,
  });
  const json = await res.json();
  return { status: res.status(), body: json };
}

export async function firstAvailableSlot(
  request: APIRequestContext,
  eventTypeId: string,
): Promise<Slot> {
  const slots = await getAvailability(request, eventTypeId);
  const slot = slots.find((s) => s.status === "available");
  if (!slot) throw new Error(`No available slots for event type '${eventTypeId}'`);
  return slot;
}

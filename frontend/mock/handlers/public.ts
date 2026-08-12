import type { MockOptions } from "vite-plugin-mock-dev-server";
import { db, generateSlots, errorResponse } from "../db";
import { sendJson, readBody, getHeader } from "../_helpers";

export default [
  // GET /api/v1/event-types
  {
    url: "/api/v1/event-types",
    method: "GET",
    response: (_req, res) => {
      sendJson(res, 200, db.listEventTypes());
    },
  },
  // GET /api/v1/event-types/:id
  {
    url: "/api/v1/event-types/:id",
    method: "GET",
    response: (req, res) => {
      const id = req.params.id as string;
      const et = db.getEventType(id);
      if (!et) sendJson(res, 404, errorResponse(404, `Event type '${id}' not found`));
      else sendJson(res, 200, et);
    },
  },
  // GET /api/v1/event-types/:id/availability
  {
    url: "/api/v1/event-types/:id/availability",
    method: "GET",
    response: (req, res) => {
      const id = req.params.id as string;
      const et = db.getEventType(id);
      if (!et) {
        sendJson(res, 404, errorResponse(404, `Event type '${id}' not found`));
        return;
      }
      const slots = generateSlots(et);
      sendJson(res, 200, slots);
    },
  },
  // POST /api/v1/event-types/:id/bookings
  {
    url: "/api/v1/event-types/:id/bookings",
    method: "POST",
    response: (req, res) => {
      const id = req.params.id as string;
      const idempotencyKey = getHeader(req, "Idempotency-Key");
      const et = db.getEventType(id);

      if (!et) {
        sendJson(res, 404, errorResponse(404, `Event type '${id}' not found`));
        return;
      }
      if (!idempotencyKey) {
        sendJson(res, 400, errorResponse(400, "Idempotency-Key header is required"));
        return;
      }

      const existing = db.getIdempotentBooking(idempotencyKey);
      if (existing) {
        sendJson(res, 200, existing);
        return;
      }

      const body = readBody<{ slotId?: string; guest?: { name: string; email: string } }>(req);
      if (!body?.slotId || !body.guest?.name || !body.guest?.email) {
        sendJson(res, 400, errorResponse(400, "slotId and guest { name, email } are required"));
        return;
      }

      const slots = generateSlots(et);
      const slot = slots.find((s) => s.id === body.slotId);
      if (!slot) {
        sendJson(res, 404, errorResponse(404, `Slot '${body.slotId}' not found`));
        return;
      }
      if (slot.status === "booked" || db.isSlotBooked(slot.id)) {
        sendJson(res, 409, errorResponse(409, "Slot is already booked"));
        return;
      }

      const booking = {
        id: db.newBookingId(),
        slotId: slot.id,
        eventType: { ...et },
        startUtc: slot.startUtc,
        endUtc: slot.endUtc,
        guest: { ...body.guest },
        createdAt: new Date().toISOString(),
      };
      db.addBooking(booking);
      db.rememberIdempotent(idempotencyKey, booking);
      sendJson(res, 201, booking);
    },
  },
] satisfies MockOptions;
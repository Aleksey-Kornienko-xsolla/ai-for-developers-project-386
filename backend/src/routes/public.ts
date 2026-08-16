import type { FastifyInstance } from "fastify";
import { db } from "../store/db.js";
import { generateSlots } from "../store/slots.js";
import { sendError } from "../lib/errors.js";
import { isSlotId } from "../lib/validate.js";
import type { Booking, BookingRequest } from "../types.js";

export default async function publicRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/event-types
  app.get("/event-types", async (_req, reply) => {
    reply.send(db.listEventTypes());
  });

  // GET /api/v1/event-types/:id
  app.get<{ Params: { id: string } }>("/event-types/:id", async (req, reply) => {
    const et = db.getEventType(req.params.id);
    if (!et) return sendError(reply, 404, `Event type '${req.params.id}' not found`);
    reply.send(et);
  });

  // GET /api/v1/event-types/:id/availability
  app.get<{ Params: { id: string }; Querystring: { fromUtc?: string; toUtc?: string } }>(
    "/event-types/:id/availability",
    async (req, reply) => {
      const et = db.getEventType(req.params.id);
      if (!et) return sendError(reply, 404, `Event type '${req.params.id}' not found`);

      let fromUtc: Date | undefined;
      let toUtc: Date | undefined;
      if (req.query.fromUtc) {
        fromUtc = new Date(req.query.fromUtc);
        if (Number.isNaN(fromUtc.getTime())) return sendError(reply, 400, "fromUtc is not a valid ISO date");
      }
      if (req.query.toUtc) {
        toUtc = new Date(req.query.toUtc);
        if (Number.isNaN(toUtc.getTime())) return sendError(reply, 400, "toUtc is not a valid ISO date");
      }
      if (fromUtc && toUtc && fromUtc.getTime() >= toUtc.getTime()) {
        return sendError(reply, 400, "fromUtc must be earlier than toUtc");
      }

      const owner = db.getOwner();
      const slots = generateSlots(et, {
        workStartHour: owner.workStartHour,
        workEndHour: owner.workEndHour,
        fromUtc,
        toUtc,
      });
      reply.send(slots);
    },
  );

  // POST /api/v1/event-types/:id/bookings
  app.post<{ Params: { id: string }; Body: BookingRequest }>("/event-types/:id/bookings", async (req, reply) => {
    const idempotencyKey = req.headers["idempotency-key"] as string | undefined;
    const et = db.getEventType(req.params.id);
    if (!et) return sendError(reply, 404, `Event type '${req.params.id}' not found`);
    if (!idempotencyKey) return sendError(reply, 400, "Idempotency-Key header is required");

    const existing = db.getIdempotentBooking(idempotencyKey);
    if (existing) return reply.code(200).send(existing);

    const body = req.body as Partial<BookingRequest> | undefined;
    if (!body?.slotId || !body.guest?.name || !body.guest?.email) {
      return sendError(reply, 400, "slotId and guest { name, email } are required");
    }
    if (!isSlotId(body.slotId)) {
      return sendError(reply, 400, "slotId must match ^\\d{8}T\\d{4}$");
    }

    const owner = db.getOwner();
    const slots = generateSlots(et, {
      workStartHour: owner.workStartHour,
      workEndHour: owner.workEndHour,
    });
    const slot = slots.find((s) => s.id === body.slotId);
    if (!slot) return sendError(reply, 404, `Slot '${body.slotId}' not found`);
    if (slot.status === "booked" || db.isSlotBooked(slot.id)) {
      return sendError(reply, 409, "Slot is already booked");
    }

    const booking: Booking = {
      id: db.newBookingId(),
      slotId: slot.id,
      eventType: { ...et },
      startUtc: slot.startUtc,
      endUtc: slot.endUtc,
      guest: { ...body.guest! },
      createdAt: new Date().toISOString(),
    };
    db.addBooking(booking);
    db.rememberIdempotent(idempotencyKey, booking);
    reply.code(201).send(booking);
  });
}
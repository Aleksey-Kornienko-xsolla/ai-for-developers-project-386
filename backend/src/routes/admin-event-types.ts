import type { FastifyInstance } from "fastify";
import { db } from "../store/db.js";
import { sendError } from "../lib/errors.js";
import { isDurationMinutes, isNonEmptyString, isSlug } from "../lib/validate.js";
import type { CreateEventTypeInput, UpdateEventTypeInput } from "../types.js";

export default async function adminEventTypesRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/admin/event-types
  app.get("/admin/event-types", async (_req, reply) => {
    reply.send(db.listEventTypes());
  });

  // POST /api/v1/admin/event-types
  app.post<{ Body: CreateEventTypeInput }>("/admin/event-types", async (req, reply) => {
    const b = req.body as Partial<CreateEventTypeInput> | undefined;
    if (
      !isNonEmptyString(b?.name) ||
      b?.description === undefined ||
      !isDurationMinutes(b?.durationMinutes) ||
      !b?.id
    ) {
      return sendError(reply, 400, "id, name, description, durationMinutes are required");
    }
    if (!isSlug(b!.id)) {
      return sendError(reply, 400, "id must match ^[a-z0-9][a-z0-9-]{0,49}$");
    }
    if (db.getEventType(b!.id)) {
      return sendError(reply, 409, `Slug '${b!.id}' is already taken`);
    }
    const created = db.createEventType({
      id: b!.id,
      name: b!.name,
      description: b!.description,
      durationMinutes: b!.durationMinutes,
    });
    reply.code(201).send(created);
  });

  // GET /api/v1/admin/event-types/:id
  app.get<{ Params: { id: string } }>("/admin/event-types/:id", async (req, reply) => {
    const et = db.getEventType(req.params.id);
    if (!et) return sendError(reply, 404, `Event type '${req.params.id}' not found`);
    reply.send(et);
  });

  // PUT /api/v1/admin/event-types/:id
  app.put<{ Params: { id: string }; Body: UpdateEventTypeInput }>("/admin/event-types/:id", async (req, reply) => {
    const b = req.body as Partial<UpdateEventTypeInput> | undefined;
    if (!isNonEmptyString(b?.name) || b?.description === undefined || !isDurationMinutes(b?.durationMinutes)) {
      return sendError(reply, 400, "name, description, durationMinutes are required");
    }
    const updated = db.updateEventType(req.params.id, {
      name: b!.name,
      description: b!.description,
      durationMinutes: b!.durationMinutes,
    });
    if (!updated) return sendError(reply, 404, `Event type '${req.params.id}' not found`);
    reply.send(updated);
  });

  // DELETE /api/v1/admin/event-types/:id
  app.delete<{ Params: { id: string } }>("/admin/event-types/:id", async (req, reply) => {
    const result = db.deleteEventType(req.params.id);
    if (result.ok) return reply.code(204).send();
    if (result.reason === "has_bookings") {
      return sendError(reply, 409, "Cannot delete: event type has bookings");
    }
    sendError(reply, 404, `Event type '${req.params.id}' not found`);
  });
}
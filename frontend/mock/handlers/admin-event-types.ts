import type { MockOptions } from "vite-plugin-mock-dev-server";
import { db, errorResponse, type EventType } from "../db";
import { sendJson, readBody } from "../_helpers";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,49}$/;

export default [
  // GET /api/v1/admin/event-types
  {
    url: "/api/v1/admin/event-types",
    method: "GET",
    response: (_req, res) => {
      sendJson(res, 200, db.listEventTypes());
    },
  },
  // POST /api/v1/admin/event-types
  {
    url: "/api/v1/admin/event-types",
    method: "POST",
    response: (req, res) => {
      const body = readBody<EventType>(req);
      if (!body?.id || !body?.name || body?.description === undefined || !body?.durationMinutes) {
        sendJson(res, 400, errorResponse(400, "id, name, description, durationMinutes are required"));
        return;
      }
      if (!SLUG_RE.test(body.id)) {
        sendJson(res, 400, errorResponse(400, "id must match ^[a-z0-9][a-z0-9-]{0,49}$"));
        return;
      }
      if (body.durationMinutes < 5 || body.durationMinutes > 480) {
        sendJson(res, 400, errorResponse(400, "durationMinutes must be between 5 and 480"));
        return;
      }
      if (db.getEventType(body.id)) {
        sendJson(res, 409, errorResponse(409, `Slug '${body.id}' is already taken`));
        return;
      }
      const created = db.createEventType({
        id: body.id,
        name: body.name,
        description: body.description,
        durationMinutes: body.durationMinutes,
      });
      sendJson(res, 200, created);
    },
  },
  // GET /api/v1/admin/event-types/:id
  {
    url: "/api/v1/admin/event-types/:id",
    method: "GET",
    response: (req, res) => {
      const id = req.params.id as string;
      const et = db.getEventType(id);
      if (!et) sendJson(res, 404, errorResponse(404, `Event type '${id}' not found`));
      else sendJson(res, 200, et);
    },
  },
  // PUT /api/v1/admin/event-types/:id
  {
    url: "/api/v1/admin/event-types/:id",
    method: "PUT",
    response: (req, res) => {
      const id = req.params.id as string;
      const body = readBody<{ name?: string; description?: string; durationMinutes?: number }>(req);
      if (!body?.name || body?.description === undefined || !body?.durationMinutes) {
        sendJson(res, 400, errorResponse(400, "name, description, durationMinutes are required"));
        return;
      }
      if (body.durationMinutes < 5 || body.durationMinutes > 480) {
        sendJson(res, 400, errorResponse(400, "durationMinutes must be between 5 and 480"));
        return;
      }
      const updated = db.updateEventType(id, {
        name: body.name,
        description: body.description,
        durationMinutes: body.durationMinutes,
      });
      if (!updated) sendJson(res, 404, errorResponse(404, `Event type '${id}' not found`));
      else sendJson(res, 200, updated);
    },
  },
  // DELETE /api/v1/admin/event-types/:id
  {
    url: "/api/v1/admin/event-types/:id",
    method: "DELETE",
    response: (req, res) => {
      const id = req.params.id as string;
      const result = db.deleteEventType(id);
      if (result.ok) {
        res.statusCode = 204;
        res.end();
      } else if (result.reason === "has_bookings") {
        sendJson(res, 409, errorResponse(409, "Cannot delete: event type has bookings"));
      } else {
        sendJson(res, 404, errorResponse(404, `Event type '${id}' not found`));
      }
    },
  },
] satisfies MockOptions;
import type { MockOptions } from "vite-plugin-mock-dev-server";
import { db, errorResponse, type Owner } from "../db";
import { sendJson, readBody } from "../_helpers";

export default [
  // GET /api/v1/admin/owner
  {
    url: "/api/v1/admin/owner",
    method: "GET",
    response: (_req, res) => {
      sendJson(res, 200, db.getOwner());
    },
  },
  // PUT /api/v1/admin/owner
  {
    url: "/api/v1/admin/owner",
    method: "PUT",
    response: (req, res) => {
      const body = readBody<{
        name?: string;
        email?: string;
        workStartHour?: number;
        workEndHour?: number;
      }>(req);
      if (!body?.name || !body?.email || body?.workStartHour === undefined || body?.workEndHour === undefined) {
        sendJson(res, 400, errorResponse(400, "name, email, workStartHour, workEndHour are required"));
        return;
      }
      if (
        body.workStartHour < 0 ||
        body.workStartHour > 23 ||
        body.workEndHour < 0 ||
        body.workEndHour > 23 ||
        body.workEndHour <= body.workStartHour
      ) {
        sendJson(res, 400, errorResponse(400, "workEndHour must be greater than workStartHour (0..23)"));
        return;
      }
      const next: Owner = {
        id: "owner",
        name: body.name,
        email: body.email,
        workStartHour: body.workStartHour,
        workEndHour: body.workEndHour,
      };
      const updated = db.setOwner(next);
      sendJson(res, 200, updated);
    },
  },
] satisfies MockOptions;
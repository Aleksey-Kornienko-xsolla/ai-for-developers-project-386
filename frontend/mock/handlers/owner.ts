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
      const body = readBody<{ name?: string; email?: string }>(req);
      if (!body?.name || !body?.email) {
        sendJson(res, 400, errorResponse(400, "name and email are required"));
        return;
      }
      const next: Owner = { id: "owner", name: body.name, email: body.email };
      const updated = db.setOwner(next);
      sendJson(res, 200, updated);
    },
  },
] satisfies MockOptions;
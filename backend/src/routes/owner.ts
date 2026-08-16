import type { FastifyInstance } from "fastify";
import { db } from "../store/db.js";
import { sendError } from "../lib/errors.js";
import { isEmail, isNonEmptyString, isWorkHour } from "../lib/validate.js";
import type { UpdateOwnerInput } from "../types.js";

export default async function ownerRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/admin/owner
  app.get("/admin/owner", async (_req, reply) => {
    reply.send(db.getOwner());
  });

  // PUT /api/v1/admin/owner
  app.put<{ Body: UpdateOwnerInput }>("/admin/owner", async (req, reply) => {
    const b = req.body as Partial<UpdateOwnerInput> | undefined;
    if (
      !isNonEmptyString(b?.name) ||
      !isEmail(b?.email) ||
      !isWorkHour(b?.workStartHour) ||
      !isWorkHour(b?.workEndHour)
    ) {
      return sendError(reply, 400, "name, email, workStartHour, workEndHour are required and must be valid");
    }
    if (b!.workEndHour <= b!.workStartHour) {
      return sendError(reply, 400, "workEndHour must be greater than workStartHour (0..23)");
    }
    const updated = db.setOwner({
      id: "owner",
      name: b!.name,
      email: b!.email,
      workStartHour: b!.workStartHour,
      workEndHour: b!.workEndHour,
    });
    reply.send(updated);
  });
}
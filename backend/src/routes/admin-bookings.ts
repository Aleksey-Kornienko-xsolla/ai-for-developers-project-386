import type { FastifyInstance } from "fastify";
import { db } from "../store/db.js";

export default async function adminBookingsRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/admin/bookings — будущие брони, отсортированы по startUtc asc
  app.get("/admin/bookings", async (_req, reply) => {
    const now = Date.now();
    const upcoming = db
      .listBookings()
      .filter((b) => new Date(b.startUtc).getTime() > now)
      .sort((a, b) => a.startUtc.localeCompare(b.startUtc));
    reply.send(upcoming);
  });
}
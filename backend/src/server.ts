import Fastify from "fastify";
import cors from "@fastify/cors";
import { PORT, HOST } from "./env.js";
import publicRoutes from "./routes/public.js";
import ownerRoutes from "./routes/owner.js";
import adminEventTypesRoutes from "./routes/admin-event-types.js";
import adminBookingsRoutes from "./routes/admin-bookings.js";
import { errorResponse } from "./lib/errors.js";

async function main(): Promise<void> {
  const app = Fastify({
    logger: true,
    bodyLimit: 1 * 1024 * 1024,
  });

  await app.register(cors, { origin: true, methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] });

  app.setErrorHandler((err, _req, reply) => {
    const status = typeof err.statusCode === "number" && err.statusCode >= 400 && err.statusCode < 500
      ? err.statusCode
      : 500;
    if (status < 500) {
      const message = err.validation ? err.message : "Invalid request body";
      reply.code(status).send(errorResponse(status, message));
      return;
    }
    app.log.error({ err }, "Unhandled error");
    reply.code(500).send(errorResponse(500, "Internal server error"));
  });

  app.get("/health", async (_req, reply) => {
    reply.send({ status: "ok" });
  });

  await app.register(publicRoutes, { prefix: "/api/v1" });
  await app.register(ownerRoutes, { prefix: "/api/v1" });
  await app.register(adminEventTypesRoutes, { prefix: "/api/v1" });
  await app.register(adminBookingsRoutes, { prefix: "/api/v1" });

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Booking backend listening on http://${HOST}:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
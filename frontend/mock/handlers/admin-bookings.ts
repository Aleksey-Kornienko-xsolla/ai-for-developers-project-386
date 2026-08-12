import type { MockOptions } from "vite-plugin-mock-dev-server";
import { db } from "../db";
import { sendJson } from "../_helpers";

export default [
  // GET /api/v1/admin/bookings — будущие брони, отсортированы по startUtc asc
  {
    url: "/api/v1/admin/bookings",
    method: "GET",
    response: (_req, res) => {
      const now = Date.now();
      const upcoming = db
        .listBookings()
        .filter((b) => new Date(b.startUtc).getTime() > now)
        .sort((a, b) => a.startUtc.localeCompare(b.startUtc));
      sendJson(res, 200, upcoming);
    },
  },
] satisfies MockOptions;
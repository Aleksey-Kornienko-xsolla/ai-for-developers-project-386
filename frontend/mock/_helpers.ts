import type { ServerResponse } from "node:http";

type AnyRes = ServerResponse;

export function sendJson(res: AnyRes, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function readBody<T = unknown>(req: { body?: unknown }): T {
  return (req.body ?? {}) as T;
}

export function getHeader(req: { headers: Record<string, string | string[] | undefined> }, name: string): string | undefined {
  const v = req.headers[name] ?? req.headers[name.toLowerCase()];
  return Array.isArray(v) ? v[0] : v;
}
import type { FastifyReply } from "fastify";
import type { ErrorResponse } from "../types.js";

export function errorResponse(status: number, message: string): ErrorResponse {
  return { status, message };
}

export function sendError(reply: FastifyReply, status: number, message: string): void {
  reply.code(status).send(errorResponse(status, message));
}
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type components } from "@/shared/api";

export type EventType = components["schemas"]["EventType"];
export type CreateEventTypeRequest = components["schemas"]["CreateEventTypeRequest"];
export type UpdateEventTypeRequest = components["schemas"]["UpdateEventTypeRequest"];

export class EventTypeError extends Error {
  status: number;
  body?: components["schemas"]["ErrorResponse"];
  constructor(status: number, body?: components["schemas"]["ErrorResponse"]) {
    super("Event type operation failed");
    this.name = "EventTypeError";
    this.status = status;
    this.body = body;
  }
}

export function useAdminEventTypes() {
  return useQuery({
    queryKey: ["event-types"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/admin/event-types", {});
      if (error || !data) throw error ?? new Error("Failed to load event types");
      return data;
    },
  });
}

function isEventType(v: unknown): v is EventType {
  return typeof v === "object" && v !== null && "id" in v && "durationMinutes" in v;
}

export function useCreateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateEventTypeRequest): Promise<EventType> => {
      const { data, error, response } = await apiClient.POST("/api/v1/admin/event-types", { body });
      const status = response.status;
      if (error) throw new EventTypeError(status, error as components["schemas"]["ErrorResponse"]);
      if (!data || !isEventType(data)) throw new EventTypeError(status);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-types"] }),
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateEventTypeRequest }): Promise<EventType> => {
      const { data, error, response } = await apiClient.PUT("/api/v1/admin/event-types/{id}", {
        params: { path: { id } },
        body,
      });
      const status = response.status;
      if (error) throw new EventTypeError(status, error as components["schemas"]["ErrorResponse"]);
      if (!data || !isEventType(data)) throw new EventTypeError(status);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-types"] }),
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }): Promise<void> => {
      const { error, response } = await apiClient.DELETE("/api/v1/admin/event-types/{id}", {
        params: { path: { id } },
      });
      const status = response.status;
      if (error) throw new EventTypeError(status, error as components["schemas"]["ErrorResponse"]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-types"] }),
  });
}
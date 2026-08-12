import { useQuery } from "@tanstack/react-query";
import { apiClient, type components } from "@/shared/api";
import type { UseQueryOptions } from "@tanstack/react-query";

export type EventType = components["schemas"]["EventType"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];

function isEventType(v: unknown): v is EventType {
  return typeof v === "object" && v !== null && "id" in v && "durationMinutes" in v;
}

type Options = Omit<UseQueryOptions<EventType>, "queryKey" | "queryFn">;

export function useEventType(id: string, options?: Options) {
  return useQuery({
    queryKey: ["event-type", id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/event-types/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
      if (!data || !isEventType(data)) throw new Error("Event type not found");
      return data;
    },
    enabled: Boolean(id),
    ...options,
  });
}
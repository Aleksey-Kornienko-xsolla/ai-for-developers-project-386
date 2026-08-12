import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { apiClient, type components } from "@/shared/api";

export type EventType = components["schemas"]["EventType"];

type Options = Omit<UseQueryOptions<EventType[]>, "queryKey" | "queryFn">;

export function useEventTypes(options?: Options) {
  return useQuery({
    queryKey: ["event-types"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/event-types", {});
      if (error || !data) throw error ?? new Error("Failed to load event types");
      return data;
    },
    ...options,
  });
}
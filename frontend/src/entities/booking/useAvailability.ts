import { useQuery } from "@tanstack/react-query";
import { apiClient, type components } from "@/shared/api";

export type Slot = components["schemas"]["Slot"];

function isSlotArray(v: unknown): v is Slot[] {
  return Array.isArray(v);
}

export function useAvailability(id: string) {
  return useQuery({
    queryKey: ["availability", id],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/event-types/{id}/availability", {
        params: { path: { id } },
      });
      if (error) throw error;
      if (!data || !isSlotArray(data)) throw new Error("Failed to load availability");
      return data;
    },
    enabled: Boolean(id),
  });
}
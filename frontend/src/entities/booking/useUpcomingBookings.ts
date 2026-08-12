import { useQuery } from "@tanstack/react-query";
import { apiClient, type components } from "@/shared/api";

export type Booking = components["schemas"]["Booking"];

export function useUpcomingBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/admin/bookings", {});
      if (error || !data) throw error ?? new Error("Failed to load bookings");
      return data;
    },
  });
}
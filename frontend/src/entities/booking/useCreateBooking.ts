import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type components } from "@/shared/api";

export type Booking = components["schemas"]["Booking"];
export type BookingRequest = components["schemas"]["BookingRequest"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];

export class BookingError extends Error {
  status: number;
  body?: ErrorResponse;
  constructor(status: number, body?: ErrorResponse) {
    super("Booking failed");
    this.name = "BookingError";
    this.status = status;
    this.body = body;
  }
}

function isBooking(v: unknown): v is Booking {
  return typeof v === "object" && v !== null && "slotId" in v && "guest" in v;
}

interface CreateBookingArgs {
  eventTypeId: string;
  body: BookingRequest;
  idempotencyKey: string;
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventTypeId, body, idempotencyKey }: CreateBookingArgs): Promise<Booking> => {
      const { data, error, response } = await apiClient.POST("/api/v1/event-types/{id}/bookings", {
        params: {
          path: { id: eventTypeId },
          header: { "Idempotency-Key": idempotencyKey },
        },
        body,
      });
      const status = response.status;
      if (error) {
        throw new BookingError(status, error as ErrorResponse);
      }
      if (!data || !isBooking(data)) {
        throw new BookingError(status);
      }
      return data;
    },
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ["availability", booking.eventType.id] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
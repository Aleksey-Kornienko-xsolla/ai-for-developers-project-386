import { z } from "zod";

export const bookingSchema = z.object({
  slotId: z.string().min(1),
  guest: z.object({
    name: z.string().min(1, "Введите имя"),
    email: z
      .string()
      .min(1, "Введите email")
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Некорректный email"),
  }),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
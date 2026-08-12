import { z } from "zod";

export const ownerSchema = z
  .object({
    name: z.string().min(1, "Введите имя"),
    email: z.string().min(1, "Введите email").regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Некорректный email"),
    workStartHour: z
      .number({ invalid_type_error: "Введите число" })
      .int("Должно быть целым числом")
      .min(0, "Минимум 0")
      .max(23, "Максимум 23"),
    workEndHour: z
      .number({ invalid_type_error: "Введите число" })
      .int("Должно быть целым числом")
      .min(0, "Минимум 0")
      .max(23, "Максимум 23"),
  })
  .refine((d) => d.workEndHour > d.workStartHour, {
    message: "Должен быть больше часа начала",
    path: ["workEndHour"],
  });

export type OwnerFormValues = z.infer<typeof ownerSchema>;
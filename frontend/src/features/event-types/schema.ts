import { z } from "zod";

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,49}$/;

export const createEventTypeSchema = z.object({
  id: z
    .string()
    .min(1, "Введите slug")
    .regex(SLUG_RE, "Только a-z, 0-9 и дефис; начинается с буквы/цифры; до 50 символов"),
  name: z.string().min(1, "Введите название"),
  description: z.string().min(1, "Введите описание"),
  durationMinutes: z
    .number()
    .int("Должно быть целым числом")
    .min(5, "Минимум 5 минут")
    .max(480, "Максимум 480 минут"),
});

export type CreateEventTypeValues = z.infer<typeof createEventTypeSchema>;

export const updateEventTypeSchema = z.object({
  name: z.string().min(1, "Введите название"),
  description: z.string().min(1, "Введите описание"),
  durationMinutes: z
    .number()
    .int("Должно быть целым числом")
    .min(5, "Минимум 5 минут")
    .max(480, "Максимум 480 минут"),
});

export type UpdateEventTypeValues = z.infer<typeof updateEventTypeSchema>;
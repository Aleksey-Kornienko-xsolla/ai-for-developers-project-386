import { z } from "zod";

export const ownerSchema = z.object({
  name: z.string().min(1, "Введите имя"),
  email: z.string().min(1, "Введите email").regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Некорректный email"),
});

export type OwnerFormValues = z.infer<typeof ownerSchema>;
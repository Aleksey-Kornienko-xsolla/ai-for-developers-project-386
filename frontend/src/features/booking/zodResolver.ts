import type { Resolver } from "react-hook-form";
import { z } from "zod";

export function zodResolver<T extends z.ZodTypeAny>(schema: T): Resolver<z.infer<T>> {
  return async (values) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) {
      return { values: parsed.data as z.infer<T>, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {} as z.infer<T>, errors: errors as never };
  };
}
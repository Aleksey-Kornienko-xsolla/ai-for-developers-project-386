import { Button, Field, Input } from "@/shared/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "./zodResolver";
import { bookingSchema, type BookingFormValues } from "./schema";

interface BookingFormProps {
  onSubmit: (values: BookingFormValues) => void;
  isPending: boolean;
  serverError?: string | null;
  defaultValues?: Partial<BookingFormValues>;
}

export function BookingForm({ onSubmit, isPending, serverError, defaultValues }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      slotId: defaultValues?.slotId ?? "",
      guest: {
        name: defaultValues?.guest?.name ?? "",
        email: defaultValues?.guest?.email ?? "",
      },
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Ваше имя" htmlFor="name" error={errors.guest?.name?.message}>
        <Input id="name" invalid={Boolean(errors.guest?.name)} {...register("guest.name")} />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.guest?.email?.message}>
        <Input
          id="email"
          type="email"
          invalid={Boolean(errors.guest?.email)}
          {...register("guest.email")}
        />
      </Field>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Бронируем…" : "Забронировать встречу"}
      </Button>
    </form>
  );
}
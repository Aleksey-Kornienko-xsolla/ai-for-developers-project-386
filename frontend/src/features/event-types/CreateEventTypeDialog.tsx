import { useForm } from "react-hook-form";
import { useCreateEventType, EventTypeError } from "@/entities/event-type/adminHooks";
import { zodResolver } from "@/features/booking/zodResolver";
import { createEventTypeSchema, type CreateEventTypeValues } from "./schema";
import { Button, Dialog, Field, Input, Textarea } from "@/shared/ui";
import { useState } from "react";

interface CreateEventTypeDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateEventTypeDialog({ open, onClose }: CreateEventTypeDialogProps) {
  const create = useCreateEventType();
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEventTypeValues>({
    resolver: zodResolver(createEventTypeSchema),
    defaultValues: { id: "", name: "", description: "", durationMinutes: 30 },
  });

  function handleClose() {
    reset();
    setServerError(null);
    setSlugError(null);
    onClose();
  }

  function onSubmit(values: CreateEventTypeValues) {
    setServerError(null);
    setSlugError(null);
    create.mutate(
      {
        id: values.id.trim(),
        name: values.name.trim(),
        description: values.description.trim(),
        durationMinutes: values.durationMinutes,
      },
      {
        onSuccess: handleClose,
        onError: (err: unknown) => {
          if (err instanceof EventTypeError && err.status === 409) {
            setSlugError("Этот slug уже занят");
          } else if (err instanceof EventTypeError) {
            setServerError(err.body?.message ?? "Не удалось создать тип события");
          } else {
            setServerError("Не удалось создать тип события");
          }
        },
      },
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} title="Новый тип события">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Slug (id)" htmlFor="id" error={errors.id?.message ?? slugError ?? undefined} hint="Например, intro-call">
          <Input id="id" invalid={Boolean(errors.id ?? slugError)} {...register("id")} />
        </Field>
        <Field label="Название" htmlFor="name" error={errors.name?.message}>
          <Input id="name" invalid={Boolean(errors.name)} {...register("name")} />
        </Field>
        <Field label="Описание" htmlFor="description" error={errors.description?.message}>
          <Textarea id="description" rows={3} invalid={Boolean(errors.description)} {...register("description")} />
        </Field>
        <Field
          label="Длительность (мин)"
          htmlFor="durationMinutes"
          error={errors.durationMinutes?.message}
          hint="От 5 до 480 минут"
        >
          <Input
            id="durationMinutes"
            type="number"
            min={5}
            max={480}
            step={1}
            invalid={Boolean(errors.durationMinutes)}
            {...register("durationMinutes", { setValueAs: (v) => Number(v) })}
          />
        </Field>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Создание…" : "Создать"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
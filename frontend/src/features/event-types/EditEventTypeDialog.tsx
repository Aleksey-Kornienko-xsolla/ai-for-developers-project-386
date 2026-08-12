import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUpdateEventType, EventTypeError, type EventType } from "@/entities/event-type/adminHooks";
import { zodResolver } from "@/features/booking/zodResolver";
import { updateEventTypeSchema, type UpdateEventTypeValues } from "./schema";
import { Button, Dialog, Field, Input, Textarea } from "@/shared/ui";

interface EditEventTypeDialogProps {
  open: boolean;
  onClose: () => void;
  eventType: EventType | null;
}

export function EditEventTypeDialog({ open, onClose, eventType }: EditEventTypeDialogProps) {
  const update = useUpdateEventType();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateEventTypeValues>({
    resolver: zodResolver(updateEventTypeSchema),
    defaultValues: { name: "", description: "", durationMinutes: 30 },
  });

  useEffect(() => {
    if (eventType) {
      reset({
        name: eventType.name,
        description: eventType.description,
        durationMinutes: eventType.durationMinutes,
      });
    }
  }, [eventType, reset]);

  function handleClose() {
    setServerError(null);
    onClose();
  }

  function onSubmit(values: UpdateEventTypeValues) {
    if (!eventType) return;
    setServerError(null);
    update.mutate(
      {
        id: eventType.id,
        body: {
          name: values.name.trim(),
          description: values.description.trim(),
          durationMinutes: values.durationMinutes,
        },
      },
      {
        onSuccess: handleClose,
        onError: (err: unknown) => {
          if (err instanceof EventTypeError) {
            setServerError(err.body?.message ?? "Не удалось обновить тип события");
          } else {
            setServerError("Не удалось обновить тип события");
          }
        },
      },
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} title={`Редактировать «${eventType?.name ?? ""}»`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Slug (нередактируемый)" htmlFor="slug-readonly">
          <Input id="slug-readonly" value={eventType?.id ?? ""} disabled />
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
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
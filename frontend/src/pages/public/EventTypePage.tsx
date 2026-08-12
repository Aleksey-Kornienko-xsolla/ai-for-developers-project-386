import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEventType } from "@/entities/event-type/useEventType";
import {
  useCreateBooking,
  BookingError,
  type Booking,
} from "@/entities/booking/useCreateBooking";
import { AvailabilityWidget } from "@/features/booking/AvailabilityWidget";
import { BookingForm } from "@/features/booking/BookingForm";
import { BookingSuccess } from "@/features/booking/BookingSuccess";
import { Spinner, ErrorBanner, Button } from "@/shared/ui";
import { formatBookingDateTime } from "@/shared/lib/date";
import type { Slot } from "@/entities/booking/useAvailability";
import type { BookingFormValues } from "@/features/booking/schema";

function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} ч ${m} мин`;
  if (h) return `${h} ч`;
  return `${m} мин`;
}

interface EventTypePageProps {
  id: string;
}

export function EventTypePage({ id }: EventTypePageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const slotParam = searchParams.get("slot");
  const dayParam = searchParams.get("day");
  const { data: eventType, isLoading, isError, error, refetch } = useEventType(id);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const createBooking = useCreateBooking();
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  function handleSelectSlot(slot: Slot) {
    setSelectedSlot(slot);
    setServerError(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("slot", slot.id);
        return next;
      },
      { replace: true },
    );
  }

  async function handleSubmit(values: BookingFormValues) {
    if (!selectedSlot || !eventType) return;
    setServerError(null);
    const body = {
      slotId: selectedSlot.id,
      guest: { name: values.guest.name.trim(), email: values.guest.email.trim() },
    };
    createBooking.mutate(
      { eventTypeId: eventType.id, body, idempotencyKey: idempotencyKeyRef.current },
      {
        onSuccess: (booking) => setConfirmedBooking(booking),
        onError: (err: unknown) => {
          if (!(err instanceof BookingError)) {
            setServerError("Не удалось создать бронирование. Попробуйте ещё раз.");
            return;
          }
          if (err.status === 409) {
            setServerError("Этот слот уже занят. Пожалуйста, выберите другой.");
            setSelectedSlot(null);
          } else if (err.status === 404) {
            setServerError("Тип события или слот не найден. Возможно, он был удалён.");
          } else {
            setServerError(err.body?.message ?? "Не удалось создать бронирование. Попробуйте ещё раз.");
          }
        },
      },
    );
  }

  function handleResetIdempotency() {
    idempotencyKeyRef.current = crypto.randomUUID();
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !eventType) {
    return (
      <ErrorBanner
        title="Тип события не найден"
        message={error instanceof Error ? error.message : undefined}
        action={
          <button
            onClick={() => refetch()}
            className="rounded-md border border-red-300 bg-white px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Повторить
          </button>
        }
      />
    );
  }

  if (confirmedBooking) {
    return <BookingSuccess booking={confirmedBooking} />;
  }

  return (
    <div className="grid gap-8 md:grid-cols-[20rem_1fr]">
      {/* Левая колонка — карточка типа */}
      <aside className="md:border-r md:border-slate-200 md:pr-8">
        <div className="md:sticky md:top-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {durationLabel(eventType.durationMinutes)}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {eventType.name}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{eventType.description}</p>

          {selectedSlot && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="font-medium text-slate-900">
                {formatBookingDateTime(selectedSlot.startUtc)}
              </p>
              <p className="mt-0.5 text-slate-500">{durationLabel(selectedSlot.durationMinutes)}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Правая колонка — выбор слота + форма */}
      <section>
        {!selectedSlot ? (
          <>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Выберите время</h2>
            <AvailabilityWidget
              eventTypeId={eventType.id}
              selectedSlotId={null}
              onSelectSlot={handleSelectSlot}
              initialSlotId={slotParam}
              focusDay={dayParam}
            />
          </>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Ваши данные</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSlot(null);
                  setServerError(null);
                  setSearchParams(
                    (prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete("slot");
                      return next;
                    },
                    { replace: true },
                  );
                }}
              >
                ← Изменить время
              </Button>
            </div>

            <BookingForm
              onSubmit={handleSubmit}
              isPending={createBooking.isPending}
              serverError={serverError}
              defaultValues={{ slotId: selectedSlot.id }}
            />

            {serverError?.includes("слот уже занят") && (
              <button
                type="button"
                onClick={() => {
                  handleResetIdempotency();
                  setSelectedSlot(null);
                  setServerError(null);
                  setSearchParams(
                    (prev) => {
                      const next = new URLSearchParams(prev);
                      next.delete("slot");
                      return next;
                    },
                    { replace: true },
                  );
                }}
                className="text-sm font-medium text-brand hover:underline"
              >
                Выбрать другой слот
              </button>
            )}
          </div>
        )}

        <div className="mt-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/event-types")}>
            ← Назад к типам событий
          </Button>
        </div>
      </section>
    </div>
  );
}
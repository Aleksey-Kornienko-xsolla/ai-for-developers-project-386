import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEventType } from "@/entities/event-type/useEventType";
import {
  useCreateBooking,
  BookingError,
  type Booking,
} from "@/entities/booking/useCreateBooking";
import { useAvailability, type Slot } from "@/entities/booking/useAvailability";
import { DayCalendar } from "@/features/booking/DayCalendar";
import { DaySlots } from "@/features/booking/DaySlots";
import { BookingForm } from "@/features/booking/BookingForm";
import { BookingSuccess } from "@/features/booking/BookingSuccess";
import { Spinner, ErrorBanner, Button, EmptyState } from "@/shared/ui";
import { dayKey, formatBookingDateTime } from "@/shared/lib/date";
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
  const { data: availability } = useAvailability(id);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const createBooking = useCreateBooking();
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  const slots: Slot[] = useMemo(() => availability ?? [], [availability]);

  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = dayKey(s.startUtc);
      const arr = map.get(key);
      if (arr) arr.push(s);
      else map.set(key, [s]);
    }
    return map;
  }, [slots]);

  const appliedInitial = useRef(false);
  useEffect(() => {
    if (appliedInitial.current || slots.length === 0) return;
    if (slotParam) {
      const match = slots.find((s) => s.id === slotParam && s.status === "available");
      if (match) {
        appliedInitial.current = true;
        setSelectedDay(dayKey(match.startUtc));
        setSelectedSlot(match);
        return;
      }
    }
    if (dayParam && grouped.has(dayParam)) {
      appliedInitial.current = true;
      setSelectedDay(dayParam);
      return;
    }
  }, [slots, slotParam, dayParam, grouped]);

  function onSelectDay(key: string) {
    setSelectedDay(key);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (next.get("slot")) next.delete("slot");
        next.set("day", key);
        return next;
      },
      { replace: true },
    );
  }

  function onSelectSlot(slot: Slot) {
    setSelectedSlot(slot);
    setServerError(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("slot", slot.id);
        next.set("day", dayKey(slot.startUtc));
        return next;
      },
      { replace: true },
    );
  }

  function backToCalendar() {
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

  const daySlots = selectedDay ? grouped.get(selectedDay) ?? null : null;

  return (
    <div className="grid gap-8 md:grid-cols-[20rem_1fr]">
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

      <section>
        {selectedSlot ? (
          <div className="max-w-md space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Ваши данные</h2>
              <Button variant="ghost" size="sm" onClick={backToCalendar}>
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
                  backToCalendar();
                }}
                className="text-sm font-medium text-brand hover:underline"
              >
                Выбрать другой слот
              </button>
            )}
          </div>
        ) : slots.length === 0 ? (
          <EmptyState title="Нет свободных слотов" description="Попробуйте зайти позже." />
        ) : (
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
            <DayCalendar
              slots={slots}
              selectedDay={selectedDay}
              onSelectDay={onSelectDay}
              initialDay={dayParam}
            />
            <div className="min-w-0 flex-1">
              {selectedDay ? (
                <DaySlots
                  daySlots={daySlots}
                  selectedSlotId={null}
                  onSelectSlot={onSelectSlot}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-slate-500">Выберите дату в календаре слева.</p>
                </div>
              )}
            </div>
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
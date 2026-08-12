import { useEffect, useMemo, useRef } from "react";
import { useAvailability, type Slot } from "@/entities/booking/useAvailability";
import { Spinner, ErrorBanner, EmptyState } from "@/shared/ui";
import { dayKey, formatDay, formatSlotTime, getBrowserTimezone } from "@/shared/lib/date";

interface AvailabilityWidgetProps {
  eventTypeId: string;
  selectedSlotId: string | null;
  onSelectSlot: (slot: Slot) => void;
  initialSlotId?: string | null;
  focusDay?: string | null;
}

export function AvailabilityWidget({
  eventTypeId,
  selectedSlotId,
  onSelectSlot,
  initialSlotId,
  focusDay,
}: AvailabilityWidgetProps) {
  const { data, isLoading, isError, error, refetch } = useAvailability(eventTypeId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const appliedInitial = useRef(false);

  const grouped = useMemo(() => {
    const slots = data ?? [];
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = dayKey(s.startUtc);
      const arr = map.get(key);
      if (arr) arr.push(s);
      else map.set(key, [s]);
    }
    return Array.from(map.entries());
  }, [data]);

  // Предвыбор слота по ?slot=
  useEffect(() => {
    if (appliedInitial.current || !data || !initialSlotId) return;
    const match = data.find((s) => s.id === initialSlotId && s.status === "available");
    if (match) {
      appliedInitial.current = true;
      onSelectSlot(match);
    }
  }, [data, initialSlotId, onSelectSlot]);

  // Скролл к дню по ?day=
  useEffect(() => {
    if (!focusDay || !scrollRef.current || grouped.length === 0) return;
    const target = scrollRef.current.querySelector<HTMLElement>(`[data-day="${focusDay}"]`);
    if (target) target.scrollIntoView({ behavior: "auto", block: "start" });
  }, [focusDay, grouped]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorBanner
        message={error instanceof Error ? error.message : "Не удалось загрузить слоты"}
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

  if (grouped.length === 0) {
    return <EmptyState title="Нет свободных слотов" description="Попробуйте зайти позже." />;
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-slate-500">Время в зоне {getBrowserTimezone()}</p>
      <div ref={scrollRef} className="max-h-[28rem] space-y-5 overflow-y-auto pr-1">
        {grouped.map(([day, daySlots]) => (
          <div key={day} data-day={day}>
            <p className="mb-2 text-sm font-semibold text-slate-700">{formatDay(daySlots[0].startUtc)}</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {daySlots.map((s) => {
                const isSelected = s.id === selectedSlotId;
                const isBooked = s.status === "booked";
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={isBooked}
                    onClick={() => onSelectSlot(s)}
                    className={`h-9 rounded-md border text-sm font-medium transition ${
                      isBooked
                        ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-300 line-through"
                        : isSelected
                          ? "border-brand bg-brand text-brand-foreground"
                          : "border-slate-300 bg-white text-slate-700 hover:border-brand/50 hover:bg-brand/5"
                    }`}
                  >
                    {formatSlotTime(s.startUtc)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
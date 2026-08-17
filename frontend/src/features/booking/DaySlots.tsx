import type { Slot } from "@/entities/booking/useAvailability";
import { formatDay, formatSlotTime } from "@/shared/lib/date";
import { EmptyState } from "@/shared/ui";

interface DaySlotsProps {
  daySlots: Slot[] | null;
  selectedSlotId: string | null;
  onSelectSlot: (slot: Slot) => void;
}

export function DaySlots({ daySlots, selectedSlotId, onSelectSlot }: DaySlotsProps) {
  if (!daySlots || daySlots.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState title="Нет свободных слотов" description="Выберите другой день." />
      </div>
    );
  }

  const free = daySlots.filter((s) => s.status === "available");
  if (free.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState title="Все слоты заняты" description="Выберите другой день." />
      </div>
    );
  }

  const headerIso = daySlots[0].startUtc;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold capitalize text-slate-700">{formatDay(headerIso)}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {daySlots.map((s) => {
          const isSelected = s.id === selectedSlotId;
          const isBooked = s.status === "booked";
          return (
            <button
              key={s.id}
              type="button"
              data-testid="slot-button"
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
  );
}
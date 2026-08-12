import { useMemo, useState, useEffect } from "react";
import type { Slot } from "@/entities/booking/useAvailability";
import {
  calendarGridDays,
  weekdayShortLabels,
  formatMonthYear,
  dayKey,
  dayNumber,
  isSameMonth,
  type CalendarCell,
} from "@/shared/lib/date";

interface DayCalendarProps {
  slots: Slot[];
  selectedDay: string | null;
  onSelectDay: (dayKey: string) => void;
  initialDay?: string | null;
}

function hasFreeSlot(arr: Slot[] | undefined): boolean {
  return Boolean(arr && arr.some((s) => s.status === "available"));
}

export function DayCalendar({ slots, selectedDay, onSelectDay, initialDay }: DayCalendarProps) {
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

  const freeDays = useMemo(() => {
    const set = new Set<string>();
    for (const [key, arr] of grouped) {
      if (hasFreeSlot(arr)) set.add(key);
    }
    return set;
  }, [grouped]);

  const windowDays = useMemo(() => new Set(grouped.keys()), [grouped]);

  const [viewMonth, setViewMonth] = useState<Date>(() => {
    if (initialDay && windowDays.has(initialDay)) {
      return new Date(initialDay + "T00:00:00");
    }
    const firstFree = Array.from(windowDays).find((k) => freeDays.has(k));
    if (firstFree) return new Date(firstFree + "T00:00:00");
    const first = Array.from(windowDays)[0];
    return first ? new Date(first + "T00:00:00") : new Date();
  });

  useEffect(() => {
    if (selectedDay) {
      const d = new Date(selectedDay + "T00:00:00");
      setViewMonth((prev) =>
        d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth() ? prev : d,
      );
    }
  }, [selectedDay]);

  const labels = useMemo(() => weekdayShortLabels(), []);
  const cells = useMemo(() => calendarGridDays(viewMonth), [viewMonth]);

  const monthHasWindow = useMemo(
    () => cells.some((c) => windowDays.has(dayKey(c.iso))),
    [cells, windowDays],
  );

  function goPrev() {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() - 1);
    setViewMonth(d);
  }
  function goNext() {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() + 1);
    setViewMonth(d);
  }

  return (
    <div className="w-full max-w-[22rem]">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={!monthHasWindow}
          className="h-7 w-7 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Предыдущий месяц"
        >
          ‹
        </button>
        <p className="text-sm font-semibold capitalize text-slate-800">
          {formatMonthYear(viewMonth.toISOString())}
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={!monthHasWindow}
          className="h-7 w-7 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Следующий месяц"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center">
        {labels.map((l) => (
          <span key={l} className="py-1 text-xs font-medium text-slate-400">
            {l}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell: CalendarCell) => {
          const key = dayKey(cell.iso);
          const isWindow = windowDays.has(key);
          const isFree = freeDays.has(key);
          const isSelectable = isWindow && isFree;
          const isSelected = key === selectedDay;
          const inMonth = isSameMonth(cell.iso, viewMonth);
          return (
            <button
              key={key}
              type="button"
              disabled={!isSelectable}
              onClick={() => onSelectDay(key)}
              className={`aspect-square rounded-md text-sm font-medium transition ${
                isSelected
                  ? "bg-brand text-brand-foreground"
                  : isSelectable
                    ? inMonth
                      ? "border border-slate-200 bg-white text-slate-700 hover:border-brand/50 hover:bg-brand/5"
                      : "border border-transparent text-slate-400 hover:border-brand/40 hover:bg-brand/5"
                    : inMonth
                      ? "cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-300"
                      : "cursor-not-allowed border border-transparent text-slate-200"
              }`}
            >
              {dayNumber(cell.iso)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
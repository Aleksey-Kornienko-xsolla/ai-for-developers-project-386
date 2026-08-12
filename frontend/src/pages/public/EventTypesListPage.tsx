import { Link } from "react-router-dom";
import { useEventTypes, type EventType } from "@/entities/event-type/useEventTypes";
import { Spinner, EmptyState, ErrorBanner, Badge } from "@/shared/ui";

function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} ч ${m} мин`;
  if (h) return `${h} ч`;
  return `${m} мин`;
}

export function EventTypesListPage() {
  const { data, isLoading, isError, error, refetch } = useEventTypes();
  const eventTypes: EventType[] = data ?? [];

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
        message={error instanceof Error ? error.message : "Не удалось загрузить типы событий"}
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Выберите тип встречи</h1>
        <p className="mt-1 text-slate-600">Пожалуйста, выберите один из доступных вариантов.</p>
      </div>

      {eventTypes.length === 0 ? (
        <EmptyState title="Нет доступных типов событий" description="Владелец пока не создал ни одного типа." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {eventTypes.map((t) => (
            <li key={t.id}>
              <Link
                to={`/booking/${t.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand/40 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">{t.name}</h3>
                  <Badge tone="brand">{durationLabel(t.durationMinutes)}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{t.description}</p>
                <p className="mt-4 text-sm font-medium text-brand">Забронировать →</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
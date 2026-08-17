import { useState } from "react";
import {
  useAdminEventTypes,
  useDeleteEventType,
  EventTypeError,
  type EventType,
} from "@/entities/event-type/adminHooks";
import { CreateEventTypeDialog } from "@/features/event-types/CreateEventTypeDialog";
import { EditEventTypeDialog } from "@/features/event-types/EditEventTypeDialog";
import { Button, Spinner, EmptyState, ErrorBanner, Badge } from "@/shared/ui";

function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} ч ${m} мин`;
  if (h) return `${h} ч`;
  return `${m} мин`;
}

export function EventTypesAdminPage() {
  const { data, isLoading, isError, error, refetch } = useAdminEventTypes();
  const deleteMutation = useDeleteEventType();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<EventType | null>(null);

  const eventTypes: EventType[] = data ?? [];

  function confirmDelete(et: EventType) {
    setPendingDelete(et);
    setDeleteError(null);
  }

  function doDelete() {
    if (!pendingDelete) return;
    deleteMutation.mutate(
      { id: pendingDelete.id },
      {
        onSuccess: () => setPendingDelete(null),
        onError: (err: unknown) => {
          if (err instanceof EventTypeError && err.status === 409) {
            setDeleteError("Нельзя удалить: по этому типу есть бронирования");
          } else if (err instanceof EventTypeError && err.status === 404) {
            setDeleteError("Тип события не найден — возможно, уже удалён");
          } else {
            setDeleteError("Не удалось удалить тип события");
          }
        },
      },
    );
  }

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Типы событий</h1>
        <Button onClick={() => setCreateOpen(true)}>+ Создать</Button>
      </div>

      {eventTypes.length === 0 ? (
        <EmptyState
          title="Типов событий пока нет"
          description="Создайте первый тип, чтобы гости могли бронировать встречи."
          action={<Button onClick={() => setCreateOpen(true)}>+ Создать тип</Button>}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Название</th>
                <th className="px-4 py-3 font-medium">Длительность</th>
                <th className="px-4 py-3 text-right font-medium">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {eventTypes.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{t.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{t.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone="brand">{durationLabel(t.durationMinutes)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditing(t)}>
                        Изменить
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => confirmDelete(t)}>
                        Удалить
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateEventTypeDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditEventTypeDialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        eventType={editing}
      />

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPendingDelete(null)}
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Отменить"
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Удалить тип события?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Тип «{pendingDelete.name}» будет удалён безвозвратно.
            </p>
            {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setPendingDelete(null);
                  setDeleteError(null);
                }}
              >
                Отмена
              </Button>
              <Button
                variant="danger"
                data-testid="confirm-delete"
                disabled={deleteMutation.isPending}
                onClick={doDelete}
              >
                {deleteMutation.isPending ? "Удаление…" : "Удалить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
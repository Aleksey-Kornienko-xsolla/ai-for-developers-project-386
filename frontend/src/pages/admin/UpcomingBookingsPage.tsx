import { useUpcomingBookings, type Booking } from "@/entities/booking/useUpcomingBookings";
import { Spinner, EmptyState, ErrorBanner, Badge } from "@/shared/ui";
import { formatBookingDateTime } from "@/shared/lib/date";

function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} ч ${m} мин`;
  if (h) return `${h} ч`;
  return `${m} мин`;
}

export function UpcomingBookingsPage() {
  const { data, isLoading, isError, error, refetch } = useUpcomingBookings();
  const bookings: Booking[] = data ?? [];

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
        message={error instanceof Error ? error.message : "Не удалось загрузить брони"}
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
      <h1 className="text-2xl font-semibold tracking-tight">Предстоящие брони</h1>

      {bookings.length === 0 ? (
        <EmptyState title="Нет предстоящих бронирований" description="Здесь появятся будущие встречи гостей." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Тип встречи</th>
                <th className="px-4 py-3 font-medium">Когда</th>
                <th className="px-4 py-3 font-medium">Длительность</th>
                <th className="px-4 py-3 font-medium">Гость</th>
                <th className="px-4 py-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{b.eventType.name}</td>
                  <td className="px-4 py-3 text-slate-700">{formatBookingDateTime(b.startUtc)}</td>
                  <td className="px-4 py-3">
                    <Badge tone="brand">{durationLabel(b.eventType.durationMinutes)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{b.guest.name}</td>
                  <td className="px-4 py-3 text-slate-500">{b.guest.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui";
import { formatBookingDateTime } from "@/shared/lib/date";
import type { Booking } from "@/entities/booking/useCreateBooking";

interface BookingSuccessProps {
  booking: Booking;
}

export function BookingSuccess({ booking }: BookingSuccessProps) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 text-emerald-600">
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="mt-3 text-xl font-semibold text-emerald-900">Встреча забронирована!</h2>
      <p className="mt-2 text-sm text-emerald-800">
        Подтверждение отправлено на {booking.guest.email}
      </p>

      <dl className="mx-auto mt-5 max-w-sm space-y-2 rounded-lg bg-white/60 p-4 text-left text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Тип встречи</dt>
          <dd className="font-medium text-slate-900">{booking.eventType.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Когда</dt>
          <dd className="font-medium text-slate-900">{formatBookingDateTime(booking.startUtc)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Имя</dt>
          <dd className="font-medium text-slate-900">{booking.guest.name}</dd>
        </div>
      </dl>

      <Link to="/event-types" className="mt-5 inline-block">
        <Button variant="secondary">Вернуться к списку типов</Button>
      </Link>
    </div>
  );
}
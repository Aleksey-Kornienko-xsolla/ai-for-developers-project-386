import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Booking</h1>
      <p className="text-slate-600">
        Выберите тип события, чтобы увидеть свободные слоты и забронировать встречу.
      </p>
      <div className="flex gap-3 pt-2">
        <Link
          to="/event-types"
          className="inline-flex h-10 items-center rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground hover:bg-brand/90"
        >
          К списку типов событий
        </Link>
        <Link
          to="/admin"
          className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-slate-50"
        >
          Админка
        </Link>
      </div>
    </div>
  );
}
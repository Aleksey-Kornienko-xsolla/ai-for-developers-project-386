import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-5xl font-bold text-slate-300">404</p>
      <p className="text-sm text-slate-600">Страница не найдена.</p>
      <Link to="/" className="text-sm font-medium text-brand hover:underline">
        На главную
      </Link>
    </div>
  );
}
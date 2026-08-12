import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/admin/owner", label: "Профиль владельца", end: true },
  { to: "/admin/event-types", label: "Типы событий" },
  { to: "/admin/bookings", label: "Предстоящие брони" },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/admin" className="text-lg font-semibold tracking-tight text-brand">
            Booking — Admin
          </a>
          <a href="/" className="text-sm text-slate-500 hover:text-slate-900">
            ← Открыть публичную часть
          </a>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="w-56 shrink-0">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-brand/10 text-brand"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
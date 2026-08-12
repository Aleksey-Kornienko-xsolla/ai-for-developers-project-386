import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Spinner } from "@/shared/ui";
import { PublicLayout } from "@/widgets/PublicLayout";
import { AdminLayout } from "@/widgets/AdminLayout";

const HomePage = lazy(() => import("@/pages/public/HomePage").then((m) => ({ default: m.HomePage })));
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);
const PlaceholderPage = lazy(() =>
  import("@/pages/PlaceholderPage").then((m) => ({ default: m.PlaceholderPage })),
);

const withSuspense = (el: ReactNode) => (
  <Suspense
    fallback={
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    }
  >
    {el}
  </Suspense>
);

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { path: "/", element: withSuspense(<HomePage />) },
      {
        path: "/event-types",
        element: withSuspense(<PlaceholderPage title="Список типов событий (B1)" />),
      },
      {
        path: "/booking/:id",
        element: withSuspense(<PlaceholderPage title="Бронирование (B2–B5)" />),
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: withSuspense(<PlaceholderPage title="Админка" />) },
      {
        path: "owner",
        element: withSuspense(<PlaceholderPage title="Профиль владельца (C2)" />),
      },
      {
        path: "event-types",
        element: withSuspense(<PlaceholderPage title="Типы событий (C3–C5)" />),
      },
      {
        path: "bookings",
        element: withSuspense(<PlaceholderPage title="Предстоящие брони (C6)" />),
      },
    ],
  },
  { path: "*", element: withSuspense(<NotFoundPage />) },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
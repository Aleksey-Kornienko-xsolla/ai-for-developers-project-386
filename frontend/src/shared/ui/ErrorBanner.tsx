import type { ReactNode } from "react";

export function ErrorBanner({
  title = "Something went wrong",
  message,
  action,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        {message && <p className="mt-0.5 text-red-700">{message}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
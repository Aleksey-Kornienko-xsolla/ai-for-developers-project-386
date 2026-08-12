import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useOwner, useUpdateOwner } from "@/entities/owner/hooks";
import { zodResolver } from "@/features/booking/zodResolver";
import { ownerSchema, type OwnerFormValues } from "@/features/owner/schema";
import { Button, Field, Input, Spinner, ErrorBanner } from "@/shared/ui";

export function OwnerProfilePage() {
  const { data, isLoading, isError, error, refetch } = useOwner();
  const update = useUpdateOwner();
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OwnerFormValues>({
    resolver: zodResolver(ownerSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (data) reset({ name: data.name, email: data.email });
  }, [data, reset]);

  function onSubmit(values: OwnerFormValues) {
    setServerError(null);
    setSavedToast(false);
    update.mutate(
      { name: values.name.trim(), email: values.email.trim() },
      {
        onSuccess: () => {
          setSavedToast(true);
          setTimeout(() => setSavedToast(false), 2500);
        },
        onError: (err: unknown) => {
          const e = err as { body?: { message?: string } };
          setServerError(e.body?.message ?? "Не удалось сохранить профиль");
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
        message={error instanceof Error ? error.message : "Не удалось загрузить профиль"}
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
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Профиль владельца</h1>
        <p className="mt-1 text-sm text-slate-600">Эти данные видят гости при выборе встречи.</p>
      </div>

      {savedToast && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Профиль сохранён
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-5"
      >
        <Field label="Имя" htmlFor="name" error={errors.name?.message}>
          <Input id="name" invalid={Boolean(errors.name)} {...register("name")} />
        </Field>
        <Field
          label="Email"
          htmlFor="email"
          error={errors.email?.message}
          hint="На этот адрес приходят уведомления о бронях"
        >
          <Input id="email" type="email" invalid={Boolean(errors.email)} {...register("email")} />
        </Field>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="flex justify-end">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? "Сохранение…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </div>
  );
}
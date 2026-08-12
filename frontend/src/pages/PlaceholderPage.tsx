export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-slate-500">Эта страница будет реализована в следующих эпиках.</p>
    </div>
  );
}
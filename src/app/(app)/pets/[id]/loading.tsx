export default function Loading() {
  return (
    <div className="animate-pulse grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="h-36 rounded-2xl border border-border bg-surface" />
        <div className="h-64 rounded-2xl border border-border bg-surface" />
      </div>
      <div className="space-y-5">
        <div className="h-44 rounded-2xl border border-border bg-surface" />
        <div className="h-44 rounded-2xl border border-border bg-surface" />
      </div>
    </div>
  );
}

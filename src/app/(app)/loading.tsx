// Shown instantly while a breeder page's server data loads, so navigation
// feels responsive instead of frozen during the round-trip.
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 px-5 py-6 md:px-8 md:py-8">
      <div className="space-y-2">
        <div className="h-7 w-48 rounded-lg bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-100" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-border bg-surface" />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/Skeleton'

export default function InsightsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12 space-y-8">
      <header className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </header>

      {/* Funnel cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>

      {/* Archetype table */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-3">
        <Skeleton className="h-4 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </div>
  )
}

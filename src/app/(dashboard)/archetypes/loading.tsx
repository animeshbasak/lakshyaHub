import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="mb-8 space-y-2">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </header>

      <section aria-label="Loading archetype distribution" className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Skeleton variant="circle" className="w-7 h-7" />
                <Skeleton className="h-3.5 w-32" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-1.5 w-full" rounded="full" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" rounded="full" />
              <Skeleton className="h-4 w-20" rounded="full" />
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

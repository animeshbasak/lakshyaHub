import { ScoreCardSkeleton, Skeleton, ListSkeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12 space-y-8"
      aria-busy="true"
      aria-live="polite"
    >
      <ScoreCardSkeleton />
      <section aria-label="Loading evaluation report" className="rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-4">
            <Skeleton variant="circle" className="w-7 h-7" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-12 ml-auto" rounded="full" />
          </div>
        ))}
      </section>
      <ListSkeleton rows={1} />
    </div>
  )
}

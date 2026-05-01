import { ListSkeleton, Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div
      className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="mb-6 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-3 w-2/3" />
      </header>
      <Skeleton className="h-12 w-full mb-4" />
      <ListSkeleton rows={4} />
    </div>
  )
}

/**
 * Skeleton primitive — used for loading placeholders across lists and cards.
 *
 * Honors prefers-reduced-motion (no shimmer animation when user opts out).
 * Don't use for indeterminate spinners — use Loader2 from lucide for those.
 */

interface Props {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  variant?: 'block' | 'text' | 'circle'
}

const ROUNDED: Record<NonNullable<Props['rounded']>, string> = {
  sm: 'rounded',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export function Skeleton({ className = '', rounded = 'md', variant = 'block' }: Props) {
  const base =
    variant === 'circle' ? 'rounded-full aspect-square' :
    variant === 'text'   ? 'h-3 ' + ROUNDED.sm :
                            ROUNDED[rounded]
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className={`relative overflow-hidden bg-white/[0.04] ${base} ${className} motion-safe:animate-pulse`}
    />
  )
}

interface ListSkeletonProps {
  rows?: number
  className?: string
}

export function ListSkeleton({ rows = 3, className = '' }: ListSkeletonProps) {
  return (
    <ul className={`space-y-2.5 ${className}`} aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex items-start gap-3"
        >
          <Skeleton variant="circle" className="w-8 h-8" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton variant="text" className="w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  )
}

interface ScoreCardSkeletonProps {
  className?: string
}

export function ScoreCardSkeleton({ className = '' }: ScoreCardSkeletonProps) {
  return (
    <section
      aria-label="Loading evaluation"
      className={`rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:p-8 ${className}`}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8 sm:items-start">
        <Skeleton variant="circle" className="w-20 h-20 sm:w-32 sm:h-32" />
        <div className="flex-1 w-full space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton variant="text" className="w-1/2" />
          <div className="flex gap-2 mt-3">
            <Skeleton className="h-5 w-20" rounded="full" />
            <Skeleton className="h-5 w-32" rounded="full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-12 mt-6" />
    </section>
  )
}

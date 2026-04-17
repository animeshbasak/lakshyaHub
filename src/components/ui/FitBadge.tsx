// src/components/ui/FitBadge.tsx
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

interface FitBadgeProps {
  score: number | null
  size?: 'default' | 'large'
  className?: string
}

export function FitBadge({ score, size = 'default', className }: FitBadgeProps) {
  if (score === null || score === undefined) {
    return (
      <span className={twMerge(
        'px-2 py-0.5 rounded-full text-xs font-medium border tabular-nums',
        'bg-white/5 text-text-muted border-white/10',
        className
      )}>–</span>
    )
  }
  const tier = score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low'
  
  const colors = {
    high: 'bg-green-500/10 text-green-400 border-green-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    low: 'bg-red-500/10 text-red-400 border-red-500/20'
  }

  const label = score >= 75 ? `${score} ✓ High` : score >= 50 ? `${score} ~ Good` : `${score} ✗ Low`

  return (
    <span className={twMerge(
      'px-2 py-0.5 rounded-full text-xs font-medium border tabular-nums',
      colors[tier],
      size === 'large' && 'text-lg px-4 py-2',
      className
    )}>
      {size === 'large' ? score : label}
    </span>
  )
}

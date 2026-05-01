'use client'

import { Clock, AlertTriangle, Snowflake, Check } from 'lucide-react'

type Flag = 'ok' | 'urgent' | 'overdue' | 'cold'

interface Props {
  flag: Flag | null | undefined
  followUpDue?: string | null
  className?: string
}

const STYLES: Record<Flag, { className: string; label: (followUp?: string | null) => string; Icon: typeof Clock }> = {
  ok: {
    className: 'border-[color:var(--tier-high)]/20 bg-[color:var(--tier-high-dim)] text-[color:var(--tier-high)]',
    label: () => 'On track',
    Icon: Check,
  },
  urgent: {
    className: 'border-[color:var(--tier-mid)]/30 bg-[color:var(--tier-mid-dim)] text-[color:var(--tier-mid)]',
    label: () => 'Follow up today',
    Icon: Clock,
  },
  overdue: {
    className: 'border-[color:var(--tier-low)]/30 bg-[color:var(--tier-low-dim)] text-[color:var(--tier-low)]',
    label: (due) => due ? `Overdue · since ${formatRelative(due)}` : 'Follow-up overdue',
    Icon: AlertTriangle,
  },
  cold: {
    className: 'border-white/15 bg-white/[0.04] text-text-2',
    label: () => 'Cold — consider closing',
    Icon: Snowflake,
  },
}

function formatRelative(iso: string): string {
  const due = new Date(iso)
  const days = Math.floor((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'today'
  if (days === 1) return '1 day'
  if (days < 30) return `${days} days`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month' : `${months} months`
}

export function CadenceBadge({ flag, followUpDue, className = '' }: Props) {
  if (!flag || flag === 'ok') return null  // suppress noise on healthy applications
  const cfg = STYLES[flag]
  const { Icon } = cfg
  return (
    <span
      role="status"
      aria-label={cfg.label(followUpDue)}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${cfg.className} ${className}`}
    >
      <Icon size={10} aria-hidden="true" />
      {cfg.label(followUpDue)}
    </span>
  )
}

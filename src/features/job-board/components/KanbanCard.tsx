// src/features/job-board/components/KanbanCard.tsx
'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Application, Job } from '@/types'
import { FitBadge } from '@/components/ui/FitBadge'

interface KanbanCardProps {
  job: Job
  application: Application
  isDragging?: boolean
  onClick: () => void
}

export function KanbanCard({ job, application, isDragging = false, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: application.id,
    data: {
      type: 'Card',
      app: { job, application },
    },
  })

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  }

  const isActiveDragging = isDragging || isSortableDragging

  if (isSortableDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="mb-2 p-4 rounded-xl bg-[#111118] border-2 border-dashed border-white/20 opacity-40 min-h-[90px]"
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        mb-2 p-4 rounded-xl bg-[#111118] border border-white/[0.06]
        cursor-pointer select-none relative
        transition-all duration-150
        hover:border-white/10 hover:-translate-y-0.5 hover:bg-[#16161f]
        focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:outline-none
        ${isActiveDragging ? 'scale-[1.03] shadow-2xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)]' : 'shadow-[0_1px_3px_rgba(0,0,0,0.4)]'}
      `}
    >
      {/* Source badge */}
      {job.source && (
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 block">
          {job.source}
        </span>
      )}

      {/* Company */}
      <p className="text-xs text-text-muted mb-0.5 truncate">{job.company}</p>

      {/* Title */}
      <h4 className="text-sm font-semibold text-white leading-snug line-clamp-2 mb-1">
        {job.title}
      </h4>

      {/* Location */}
      {job.location && (
        <p className="text-xs text-text-muted truncate mb-2">{job.location}</p>
      )}

      {/* Footer: FitBadge bottom-right */}
      <div className="flex items-center justify-end mt-1">
        <FitBadge score={job.fit_score} />
      </div>
    </div>
  )
}

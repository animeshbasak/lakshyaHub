// src/features/job-board/components/KanbanColumn.tsx
// NOTE: This file is preserved for backward compat but KanbanBoard.tsx
// uses its own inline DroppableColumn. KanbanCard props updated to match spec.
'use client'
import { Application, Job, ApplicationStatus } from '@/types'
import { KanbanCard } from './KanbanCard'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

interface KanbanColumnProps {
  status: ApplicationStatus
  applications: Array<{ job: Job; application: Application }>
  onCardClick: (app: { job: Job; application: Application }) => void
}

export function KanbanColumn({ status, applications, onCardClick }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status
    }
  })

  const labels: Record<ApplicationStatus, string> = {
    saved: 'Saved',
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected'
  }

  const label = labels[status]

  return (
    <div className="flex flex-col min-w-[300px] w-[300px] max-w-[300px] h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-bold text-text uppercase tracking-widest">{label}</h3>
        <span className="text-[10px] tabular-nums font-mono px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/5">
          {applications.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto px-1 pb-4 scrollbar-hide flex flex-col min-h-[500px]"
      >
        <SortableContext items={applications.map(a => a.application.id)} strategy={verticalListSortingStrategy}>
          {applications.map(app => (
            <KanbanCard
              key={app.application.id}
              job={app.job}
              application={app.application}
              onClick={() => onCardClick(app)}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-xl text-center">
            <p className="text-xs text-text-muted">No jobs yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

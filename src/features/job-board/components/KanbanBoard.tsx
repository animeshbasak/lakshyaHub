// src/features/job-board/components/KanbanBoard.tsx
'use client'
import { useState, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { Plus } from 'lucide-react'
import type { Application, Job, ApplicationStatus } from '@/types'
import { KanbanCard } from './KanbanCard'
import { updateApplicationStatus } from '@/actions/updateApplication'

// Dynamic imports for agent-B owned components
// AddJobModal: isOpen, onClose, onSuccess(job: Job)
const AddJobModal = dynamic(
  () => import('./AddJobModal').then((m) => m.AddJobModal),
  { ssr: false }
)
// JobDrawer: job, application, onClose — may not exist yet; wrapped safely
const JobDrawer = dynamic(
  () =>
    import('./JobDrawer')
      .then((m) => m.JobDrawer)
      .catch(() => () => null),
  { ssr: false }
)

export interface InitialDataItem {
  job: Job
  application: Application
}

interface KanbanBoardProps {
  initialData: InitialDataItem[]
}

type LocalApp = { job: Job; application: Application }

const COLUMNS: {
  status: ApplicationStatus
  label: string
  colorClass: string
  badgeClass: string
  dotClass: string
}[] = [
  {
    status: 'saved',
    label: 'Saved',
    colorClass: 'text-slate-400',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dotClass: 'bg-slate-400',
  },
  {
    status: 'applied',
    label: 'Applied',
    colorClass: 'text-blue-400',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dotClass: 'bg-blue-400',
  },
  {
    status: 'interview',
    label: 'Interviewing',
    colorClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dotClass: 'bg-amber-400',
  },
  {
    status: 'offer',
    label: 'Offered',
    colorClass: 'text-green-400',
    badgeClass: 'bg-green-500/10 text-green-400 border-green-500/20',
    dotClass: 'bg-green-400',
  },
  {
    status: 'rejected',
    label: 'Rejected',
    colorClass: 'text-red-400',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/20',
    dotClass: 'bg-red-400',
  },
]

interface DroppableColumnProps {
  status: ApplicationStatus
  label: string
  colorClass: string
  badgeClass: string
  dotClass: string
  apps: LocalApp[]
  onCardClick: (app: LocalApp) => void
  onAddClick: () => void
}

function DroppableColumn({
  status,
  label,
  colorClass,
  badgeClass,
  dotClass,
  apps,
  onCardClick,
  onAddClick,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'Column', status },
  })

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] max-w-[280px] h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotClass}`} aria-hidden />
          <h3 className={`text-sm font-bold uppercase tracking-widest ${colorClass}`}>{label}</h3>
          <span
            className={`text-[10px] tabular-nums font-mono px-2 py-0.5 rounded-full border ${badgeClass}`}
            aria-label={`${apps.length} items`}
          >
            {apps.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          aria-label={`Add job to ${label}`}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-text-muted hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none min-h-[44px] min-w-[44px]"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Column Body */}
      <div
        ref={setNodeRef}
        className={`flex-1 bg-[#111118]/50 rounded-[14px] min-h-[80vh] p-3 overflow-y-auto transition-colors ${
          isOver ? 'ring-1 ring-cyan-500/40 bg-cyan-500/5' : ''
        }`}
      >
        <SortableContext
          items={apps.map((a) => a.application.id)}
          strategy={verticalListSortingStrategy}
        >
          {apps.map((app) => (
            <KanbanCard
              key={app.application.id}
              job={app.job}
              application={app.application}
              onClick={() => onCardClick(app)}
            />
          ))}
        </SortableContext>

        {apps.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/[0.06] rounded-xl text-center mt-2">
            <p className="text-xs text-text-muted">Drop cards here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const [apps, setApps] = useState<LocalApp[]>(initialData)
  const [activeApp, setActiveApp] = useState<LocalApp | null>(null)

  // AddJobModal: track which column "+" was clicked; null = closed
  const [addModalStatus, setAddModalStatus] = useState<ApplicationStatus | null>(null)

  // JobDrawer: which card was clicked
  const [drawerApp, setDrawerApp] = useState<LocalApp | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const columnsData = useMemo(
    () =>
      COLUMNS.map((col) => ({
        ...col,
        apps: apps.filter((a) => a.application.status === col.status),
      })),
    [apps]
  )

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current
    if (data?.type === 'Card') {
      setActiveApp(data.app as LocalApp)
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (!activeData || active.id === over.id) return

    const isActiveCard = activeData.type === 'Card'
    const isOverColumn = overData?.type === 'Column'
    const isOverCard = overData?.type === 'Card'

    if (isActiveCard && (isOverColumn || isOverCard)) {
      const newStatus: ApplicationStatus = isOverColumn
        ? (overData.status as ApplicationStatus)
        : (overData.app.application.status as ApplicationStatus)

      setApps((prev) =>
        prev.map((a) =>
          a.application.id === active.id
            ? { ...a, application: { ...a.application, status: newStatus } }
            : a
        )
      )
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveApp(null)

    if (!over) {
      setApps(initialData)
      return
    }

    const appId = active.id as string
    const updated = apps.find((a) => a.application.id === appId)

    if (updated) {
      const { error } = await updateApplicationStatus(appId, updated.application.status)
      if (error) {
        console.error('Status update failed:', error)
        setApps(initialData)
      }
    }
  }

  // AddJobModal.onSuccess gives us the new Job — we synthesize a local Application
  const handleJobAdded = useCallback(
    (job: Job) => {
      const syntheticApplication: Application = {
        id: `local-${job.id}`,
        user_id: job.user_id,
        job_id: job.id,
        status: addModalStatus ?? 'saved',
        applied_at: null,
        notes: null,
        resume_version: null,
        updated_at: new Date().toISOString(),
      }
      setApps((prev) => [{ job, application: syntheticApplication }, ...prev])
      setAddModalStatus(null)
    },
    [addModalStatus]
  )

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 h-full scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
          {columnsData.map((col) => (
            <DroppableColumn
              key={col.status}
              status={col.status}
              label={col.label}
              colorClass={col.colorClass}
              badgeClass={col.badgeClass}
              dotClass={col.dotClass}
              apps={col.apps}
              onCardClick={(app) => setDrawerApp(app)}
              onAddClick={() => setAddModalStatus(col.status)}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: '0.4' } },
            }),
          }}
        >
          {activeApp && (
            <div className="cursor-grabbing scale-[1.03] shadow-2xl rounded-xl border border-cyan-500/30">
              <KanbanCard
                job={activeApp.job}
                application={activeApp.application}
                isDragging
                onClick={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* AddJobModal — owned by agent B; uses isOpen + onClose + onSuccess */}
      <AddJobModal
        isOpen={addModalStatus !== null}
        onClose={() => setAddModalStatus(null)}
        onSuccess={handleJobAdded}
      />

      {/* JobDrawer — owned by agent B; isOpen, job, applicationId, onClose, onStatusChange */}
      <JobDrawer
        isOpen={drawerApp !== null}
        job={drawerApp?.job ?? null}
        applicationId={drawerApp?.application.id ?? null}
        onClose={() => setDrawerApp(null)}
        onStatusChange={(id, status) => {
          setApps((prev) =>
            prev.map((a) =>
              a.application.id === id
                ? { ...a, application: { ...a.application, status: status as ApplicationStatus } }
                : a
            )
          )
          setDrawerApp(null)
        }}
      />
    </>
  )
}

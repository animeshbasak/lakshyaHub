// src/app/(dashboard)/board/page.tsx
import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/features/job-board/components/KanbanBoard'
import type { Application, Job } from '@/types'

export default async function BoardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let initialData: Array<{ job: Job; application: Application }> = []

  if (user) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*)
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      initialData = (data as Array<Application & { job: Job }>)
        .filter((row) => row.job != null)
        .map((row) => ({
          application: {
            id: row.id,
            user_id: row.user_id,
            job_id: row.job_id,
            status: row.status,
            applied_at: row.applied_at,
            notes: row.notes,
            resume_version: row.resume_version,
            updated_at: row.updated_at,
          } as Application,
          job: row.job as Job,
        }))
    }
  }

  const totalCount = initialData.length
  const savedCount = initialData.filter((d) => d.application.status === 'saved').length
  const appliedCount = initialData.filter((d) => d.application.status === 'applied').length
  const interviewCount = initialData.filter((d) => d.application.status === 'interview').length
  const offerCount = initialData.filter((d) => d.application.status === 'offer').length
  const rejectedCount = initialData.filter((d) => d.application.status === 'rejected').length

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--bg-1)', color: 'var(--fg)' }}
    >
      {/* Page Header */}
      <div
        className="shrink-0"
        style={{
          padding: '18px 26px 14px',
          borderBottom: '1px solid var(--hair)',
          background: 'var(--bg-1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
            marginBottom: 14,
          }}
        >
          <div>
            <h1 className="h1 grad-text" style={{ marginBottom: 4 }}>
              Pipeline
            </h1>
            <p style={{ fontSize: 12.5, margin: 0, color: 'var(--fg-3)' }}>
              {totalCount} application{totalCount === 1 ? '' : 's'} · Drag between columns to update status
            </p>
          </div>

          {/* Status summary strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <StatPill label="Total" value={totalCount} />
            <span
              aria-hidden
              style={{
                width: 1,
                height: 22,
                background: 'var(--hair)',
                margin: '0 2px',
              }}
            />
            <StatPill label="Saved" value={savedCount} tone="cyan" />
            <StatPill label="Applied" value={appliedCount} tone="purple" />
            <StatPill label="Interview" value={interviewCount} tone="amber" />
            <StatPill label="Offer" value={offerCount} tone="emerald" />
            <StatPill label="Rejected" value={rejectedCount} tone="red" />
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div
        className="flex-1 overflow-hidden"
        style={{ padding: '14px 26px 20px' }}
      >
        <KanbanBoard initialData={initialData} />
      </div>
    </div>
  )
}

type Tone = 'cyan' | 'purple' | 'emerald' | 'amber' | 'red'

function StatPill({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: Tone
}) {
  const toneVar: Record<Tone, string> = {
    cyan: 'var(--cyan)',
    purple: 'var(--purple)',
    emerald: 'var(--emerald)',
    amber: 'var(--amber)',
    red: 'var(--red)',
  }
  const dotColor = tone ? toneVar[tone] : 'var(--fg-3)'
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        height: 28,
        padding: '0 10px',
        borderRadius: 'var(--radius-sm, 6px)',
        background: 'var(--bg-inset)',
        border: '1px solid var(--hair)',
      }}
    >
      <span className="dot" style={{ color: dotColor, width: 7, height: 7 }} />
      <span
        className="eyebrow"
        style={{ fontSize: 10, letterSpacing: '0.08em' }}
      >
        {label}
      </span>
      <span
        className="mono"
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--fg)',
          marginLeft: 2,
        }}
      >
        {value}
      </span>
    </div>
  )
}

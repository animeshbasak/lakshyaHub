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
  const interviewCount = initialData.filter((d) => d.application.status === 'interview').length

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Page Header */}
      <div className="px-8 pt-8 pb-6 bg-gradient-to-b from-bg to-transparent shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Application Board</h1>
            <p className="text-sm text-text-2 mt-1">
              Manage your job search pipeline across status columns
            </p>
          </div>

          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center min-h-[44px] justify-center">
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Total</span>
              <span className="text-xl font-bold text-white tabular-nums">{totalCount}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center min-h-[44px] justify-center">
              <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Interviews</span>
              <span className="text-xl font-bold text-cyan-400 tabular-nums">{interviewCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-hidden px-8">
        <KanbanBoard initialData={initialData} />
      </div>
    </div>
  )
}

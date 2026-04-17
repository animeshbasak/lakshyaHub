// src/app/(dashboard)/dashboard/page.tsx
import Link from 'next/link'
import { Briefcase, CalendarCheck, TrendingUp, BarChart2, Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Application, Job, ApplicationStatus } from '@/types'

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'cyan',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  accent?: 'cyan' | 'purple' | 'green' | 'amber'
}) {
  const accentMap = {
    cyan: { bg: 'bg-cyan-500/10', iconColor: 'text-cyan-400', valueColor: 'text-cyan-400' },
    purple: { bg: 'bg-purple-500/10', iconColor: 'text-purple-400', valueColor: 'text-purple-400' },
    green: { bg: 'bg-emerald-500/10', iconColor: 'text-emerald-400', valueColor: 'text-emerald-400' },
    amber: { bg: 'bg-amber-500/10', iconColor: 'text-amber-400', valueColor: 'text-amber-400' },
  }
  const a = accentMap[accent]

  return (
    <div className="bg-[#111118] border border-white/[0.06] rounded-[14px] p-5 flex items-center gap-4 hover:border-cyan-500/20 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${a.bg}`}>
        <Icon className={`w-5 h-5 ${a.iconColor}`} />
      </div>
      <div>
        <p className={`text-[28px] font-bold leading-none tabular-nums ${a.valueColor}`}>{value}</p>
        <p className="text-xs text-text-2 font-medium mt-1">{label}</p>
      </div>
    </div>
  )
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  saved: {
    label: 'Saved',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500/20',
  },
  applied: {
    label: 'Applied',
    color: 'text-purple-400',
    bg: 'bg-purple-500',
    border: 'border-purple-500/20',
  },
  interview: {
    label: 'Interview',
    color: 'text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/20',
  },
  offer: {
    label: 'Offer',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500',
    border: 'border-emerald-500/20',
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500',
    border: 'border-red-500/20',
  },
}

const STATUS_ORDER: ApplicationStatus[] = ['saved', 'applied', 'interview', 'offer', 'rejected']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Fetch stats ────────────────────────────────────────────────
  let applications: (Application & { job: Job })[] = []
  if (user) {
    const { data } = await supabase
      .from('applications')
      .select('*, job:jobs(*)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
    applications = (data ?? []) as (Application & { job: Job })[]
  }

  const totalApplications = applications.length
  const interviews = applications.filter((a) => a.status === 'interview').length
  const offers = applications.filter((a) => a.status === 'offer').length

  // ATS avg score — from jobs that have a fit_score
  const scoredJobs = applications.filter((a) => a.job && a.job.fit_score > 0)
  const atsAvg =
    scoredJobs.length > 0
      ? Math.round(
          scoredJobs.reduce((sum, a) => sum + a.job.fit_score, 0) / scoredJobs.length
        )
      : 0

  // ── Pipeline funnel ───────────────────────────────────────────
  const statusCounts: Record<ApplicationStatus, number> = {
    saved: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
  }
  for (const app of applications) {
    if (app.status in statusCounts) statusCounts[app.status]++
  }
  const maxCount = Math.max(1, ...Object.values(statusCounts))

  // ── Recent jobs ───────────────────────────────────────────────
  const recentApps = applications.slice(0, 5)

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-text-2 mt-1">Your job search at a glance</p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        <Link
          href="/discover"
          className="min-h-[44px] flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none"
        >
          <Search className="w-4 h-4" />
          Run Job Search
        </Link>
        <Link
          href="/resume"
          className="min-h-[44px] flex items-center gap-2 bg-white/5 border border-white/10 text-white font-medium px-5 py-3 rounded-xl hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none"
        >
          Upload Resume
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Briefcase}
          label="Applications"
          value={totalApplications}
          accent="cyan"
        />
        <StatCard
          icon={CalendarCheck}
          label="Interviews"
          value={interviews}
          accent="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="Offers"
          value={offers}
          accent="green"
        />
        <StatCard
          icon={BarChart2}
          label="ATS Avg Score"
          value={atsAvg > 0 ? `${atsAvg}` : '—'}
          accent="purple"
        />
      </div>

      {/* Main 2-col area */}
      <div className="grid grid-cols-[2fr_1fr] gap-6">
        {/* Left: Pipeline funnel */}
        <div className="bg-[#111118] border border-white/[0.06] rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-semibold text-white mb-6">Pipeline</h2>
          {totalApplications === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-white/10 rounded-xl gap-3">
              <Briefcase className="w-10 h-10 text-text-muted" />
              <p className="text-sm text-text-2 text-center">
                No applications yet.{' '}
                <Link href="/discover" className="text-cyan-400 hover:underline">
                  Run your first search →
                </Link>
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {STATUS_ORDER.map((status) => {
                const count = statusCounts[status]
                const pct = Math.round((count / maxCount) * 100)
                const cfg = STATUS_CONFIG[status]
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className="w-20 flex-shrink-0 text-right">
                      <span className={`text-[11px] font-medium uppercase tracking-widest ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex-1 bg-white/[0.04] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cfg.bg} transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white w-6 tabular-nums text-right">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: Recent applications */}
        <div className="bg-[#111118] border border-white/[0.06] rounded-[14px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
            <Link
              href="/board"
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              View all →
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Plus className="w-10 h-10 text-text-muted" />
              <p className="text-sm text-text-2 text-center">No jobs yet</p>
              <Link
                href="/discover"
                className="min-h-[44px] flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Find Jobs
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {recentApps.map((app) => {
                const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.saved
                return (
                  <li
                    key={app.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/10 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {app.job?.title ?? 'Untitled'}
                      </p>
                      <p className="text-[11px] text-text-2 font-medium truncate">
                        {app.job?.company ?? '—'}
                        {app.job?.location ? ` · ${app.job.location}` : ''}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex-shrink-0 ${cfg.color} ${cfg.border} bg-opacity-10`}
                      style={{ background: 'transparent' }}
                    >
                      {cfg.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

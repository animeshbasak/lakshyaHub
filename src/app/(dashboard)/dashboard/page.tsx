// src/app/(dashboard)/dashboard/page.tsx
import Link from 'next/link'
import {
  Briefcase,
  CalendarCheck,
  TrendingUp,
  Target,
  Search,
  Sparkles,
  ChevronRight,
  Zap,
  FileText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { Application, Job, ApplicationStatus } from '@/types'

// ─── Status config (accent colors mapped to design-system tokens) ─────────────

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; accent: string }
> = {
  saved:    { label: 'Saved',     accent: 'var(--cyan)' },
  applied:  { label: 'Applied',   accent: 'var(--purple)' },
  interview:{ label: 'Interview', accent: 'var(--amber)' },
  offer:    { label: 'Offer',     accent: 'var(--emerald)' },
  rejected: { label: 'Rejected',  accent: 'var(--red)' },
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
  const pipelineTotal = Object.values(statusCounts).reduce((a, b) => a + b, 0)

  // ── Recent jobs ───────────────────────────────────────────────
  const recentApps = applications.slice(0, 5)

  // ── Greeting + display name ──────────────────────────────────
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ??
    user?.email?.split('@')[0] ??
    'there'

  // Stat card config — data comes from above
  const stats: Array<{
    k: string
    v: number | string
    accent: string
    icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>
    mono?: boolean
  }> = [
    { k: 'Applications',  v: totalApplications, accent: 'var(--fg)',      icon: Briefcase },
    { k: 'Interviews',    v: interviews,        accent: 'var(--cyan)',    icon: CalendarCheck },
    { k: 'Offers',        v: offers,            accent: 'var(--emerald)', icon: TrendingUp },
    { k: 'Avg fit score', v: atsAvg > 0 ? atsAvg : '—', accent: 'var(--purple)', icon: Target, mono: true },
  ]

  return (
    <div style={{ padding: '22px 28px 120px', maxWidth: 1280, margin: '0 auto' }}>
      {/* ── Hero strip ───────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
          marginBottom: 22,
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 8, color: 'var(--cyan)' }}>
            <span className="dot" style={{ color: 'var(--emerald)', marginRight: 6 }} />
            {greeting}, {displayName}
          </div>
          <h1 className="h1" style={{ fontSize: 28, marginBottom: 6 }}>
            {interviews > 0 ? (
              <>
                You have{' '}
                <span className="grad-text">
                  {interviews} {interviews === 1 ? 'interview' : 'interviews'}
                </span>{' '}
                in progress.
              </>
            ) : totalApplications > 0 ? (
              <>
                Tracking <span className="grad-text">{totalApplications} applications</span>.
              </>
            ) : (
              <>
                Let's find your <span className="grad-text">next role</span>.
              </>
            )}
          </h1>
          <p className="text-3" style={{ fontSize: 13.5, margin: 0 }}>
            {atsAvg > 0 ? (
              <>
                Average fit score{' '}
                <span className="mono" style={{ color: 'var(--emerald)' }}>{atsAvg}</span>
                {' · '}
              </>
            ) : null}
            <span style={{ color: 'var(--fg-2)' }}>{offers}</span> offers ·{' '}
            <span style={{ color: 'var(--fg-2)' }}>{pipelineTotal}</span> in pipeline
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/discover" className="btn primary lg">
            <Zap size={14} fill="currentColor" strokeWidth={2} /> Find jobs
          </Link>
          <Link href="/resume" className="btn lg">
            <FileText size={14} /> Build resume
          </Link>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 16,
        }}
      >
        {stats.map((s) => {
          const IconC = s.icon
          return (
            <div
              key={s.k}
              className="card card-pad"
              style={{ padding: 16, position: 'relative', overflow: 'hidden' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.02em' }}>
                  {s.k}
                </span>
                <IconC size={14} style={{ color: 'var(--fg-4)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span
                  className={s.mono ? 'mono' : ''}
                  style={{
                    fontSize: 28,
                    fontWeight: 600,
                    color: s.accent,
                    letterSpacing: '-0.02em',
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Main 2-col grid ──────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 12,
          alignItems: 'start',
        }}
      >
        {/* Pipeline */}
        <div className="card" style={{ padding: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <div>
              <h2 className="h2">Pipeline</h2>
              <p className="text-3" style={{ fontSize: 11.5, margin: '2px 0 0' }}>
                {pipelineTotal} active {pipelineTotal === 1 ? 'application' : 'applications'}
              </p>
            </div>
            <Link href="/board" className="btn sm ghost" style={{ color: 'var(--fg-3)' }}>
              Open board <ChevronRight size={11} />
            </Link>
          </div>

          {pipelineTotal === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 160,
                border: '1px dashed var(--hair)',
                borderRadius: 'var(--radius)',
                gap: 12,
              }}
            >
              <Briefcase size={28} style={{ color: 'var(--fg-4)' }} />
              <p className="text-3" style={{ fontSize: 13, margin: 0 }}>
                No applications yet.{' '}
                <Link href="/discover" style={{ color: 'var(--cyan)' }}>
                  Run your first search →
                </Link>
              </p>
            </div>
          ) : (
            <>
              {/* Horizontal stacked bar */}
              <div
                style={{
                  display: 'flex',
                  height: 10,
                  borderRadius: 999,
                  overflow: 'hidden',
                  background: 'var(--bg-inset)',
                  marginBottom: 18,
                }}
              >
                {STATUS_ORDER.map((status) => {
                  const v = statusCounts[status]
                  if (v === 0) return null
                  const cfg = STATUS_CONFIG[status]
                  return (
                    <div
                      key={status}
                      style={{
                        width: `${(v / pipelineTotal) * 100}%`,
                        background: cfg.accent,
                        opacity: 0.85,
                      }}
                      title={`${cfg.label}: ${v}`}
                    />
                  )
                })}
              </div>

              {/* Per-column rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {STATUS_ORDER.map((status) => {
                  const v = statusCounts[status]
                  const pct = Math.round((v / maxCount) * 100)
                  const cfg = STATUS_CONFIG[status]
                  return (
                    <div
                      key={status}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '110px 1fr 40px',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                        <span className="dot" style={{ color: cfg.accent }} />
                        <span className="text-2">{cfg.label}</span>
                      </div>
                      <div
                        style={{
                          height: 5,
                          background: 'var(--bg-inset)',
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: cfg.accent,
                            transition: 'width 0.6s',
                          }}
                        />
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: 11.5,
                          color: v ? 'var(--fg)' : 'var(--fg-4)',
                          textAlign: 'right',
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Recent activity */}
        <div className="card" style={{ padding: 18 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <h2 className="h2">Recent activity</h2>
            <Link
              href="/board"
              className="text-4"
              style={{ fontSize: 10.5, color: 'var(--fg-3)' }}
            >
              View all →
            </Link>
          </div>

          {recentApps.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 160,
                gap: 12,
              }}
            >
              <Search size={28} style={{ color: 'var(--fg-4)' }} />
              <p className="text-3" style={{ fontSize: 13, margin: 0 }}>
                No jobs yet
              </p>
              <Link href="/discover" className="btn primary sm">
                Find jobs
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentApps.map((app, i) => {
                const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.saved
                return (
                  <div
                    key={app.id}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '10px 0',
                      borderBottom:
                        i < recentApps.length - 1 ? '1px solid var(--hair)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        background: 'var(--bg-inset)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                        color: cfg.accent,
                      }}
                    >
                      <span className="dot" style={{ color: cfg.accent }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          lineHeight: 1.35,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span className="text-2">{app.job?.title ?? 'Untitled'}</span>{' '}
                        <span className="text-4">·</span>{' '}
                        <span style={{ color: cfg.accent, textTransform: 'capitalize' }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div
                        className="text-4 mono"
                        style={{
                          fontSize: 10.5,
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {app.job?.company ?? '—'}
                        {app.job?.location ? ` · ${app.job.location}` : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── AI insight ───────────────────────────────────────── */}
      {totalApplications > 0 && (
        <div
          className="card"
          style={{
            padding: 18,
            marginTop: 12,
            background:
              'linear-gradient(135deg, rgba(34,211,238,0.035) 0%, rgba(168,85,247,0.035) 100%)',
            border: '1px solid rgba(34,211,238,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'var(--grad-brand)',
                display: 'grid',
                placeItems: 'center',
                color: '#06060a',
                flexShrink: 0,
              }}
            >
              <Sparkles size={17} fill="currentColor" strokeWidth={1.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span className="h3" style={{ color: 'var(--fg)' }}>Weekly insight</span>
                <span className="badge cyan">AI</span>
              </div>
              <p style={{ fontSize: 13, margin: 0, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                {atsAvg >= 80 ? (
                  <>
                    Your average fit score is <span style={{ color: 'var(--fg)' }}>{atsAvg}</span> — strong signal. Prioritize roles where your score is highest next week.
                  </>
                ) : atsAvg > 0 ? (
                  <>
                    Average fit score is <span style={{ color: 'var(--fg)' }}>{atsAvg}</span>. Tuning your resume keywords could lift this above 80 and double your interview rate.
                  </>
                ) : (
                  <>
                    Upload a resume to unlock ATS scoring and personalized job matching.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

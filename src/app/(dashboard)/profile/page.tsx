'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Pencil,
  Check,
  X,
  Trash2,
  AlertTriangle,
  User as UserIcon,
  Mail,
  Target,
  MapPin,
  Briefcase,
  Sparkles,
  BarChart3,
  ShieldAlert,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { clearAllCloudData } from '@/actions/resumeActions'
import type { ResumeProfile, YearsExperience } from '@/types'

// ── Types ────────────────────────────────────────────────────────────────────

interface UserStats {
  applications: number
  interviews: number
  offers: number
}

interface EditState {
  targetTitles: boolean
  skills: boolean
  targetLocations: boolean
  yearsExperience: boolean
  name: boolean
}

const YEARS_OPTIONS: YearsExperience[] = ['<1', '1-3', '3-5', '5-10', '10+']

// ── Sub-components ────────────────────────────────────────────────────────────

function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card card-pad">
      <div className="animate-pulse space-y-3">
        <div className="skeleton h-4 w-1/3" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-3"
            style={{ width: `${70 + i * 10}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  sub,
  right,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  eyebrow: string
  title: string
  sub?: string
  right?: React.ReactNode
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 pb-4 mb-5"
      style={{ borderBottom: '1px solid var(--hair)' }}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--gradient-subtle)',
            border: '1px solid var(--hair)',
          }}
        >
          <Icon size={16} className="grad-text" />
        </div>
        <div className="min-w-0">
          <div className="eyebrow" style={{ marginBottom: 2 }}>
            {eyebrow}
          </div>
          <h2 className="h2" style={{ color: 'var(--fg)' }}>
            {title}
          </h2>
          {sub && (
            <p className="text-3" style={{ fontSize: 11.5, margin: '3px 0 0' }}>
              {sub}
            </p>
          )}
        </div>
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}

function ChipList({
  items,
  emptyLabel,
  icon: LeadIcon,
}: {
  items: string[]
  emptyLabel: string
  icon?: React.ComponentType<{ size?: number }>
}) {
  if (items.length === 0) {
    return (
      <p className="text-3" style={{ fontSize: 12, fontStyle: 'italic', margin: 0 }}>
        {emptyLabel}
      </p>
    )
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it) => (
        <span key={it} className="chip active" style={{ cursor: 'default' }}>
          {LeadIcon && <LeadIcon size={10} />}
          {it}
        </span>
      ))}
    </div>
  )
}

function InlineEditBar({
  onSave,
  onCancel,
}: {
  onSave: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex gap-2 mt-2">
      <button type="button" onClick={onSave} className="btn primary sm">
        <Check size={12} /> Save
      </button>
      <button type="button" onClick={onCancel} className="btn ghost sm">
        <X size={12} /> Cancel
      </button>
    </div>
  )
}

function EditToggleButton({
  editing,
  onOpen,
  label,
}: {
  editing: boolean
  onOpen: () => void
  label: string
}) {
  if (editing) return null
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className="btn ghost sm"
    >
      <Pencil size={11} /> Edit
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const shouldReduceMotion = useReducedMotion()

  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<Partial<ResumeProfile> | null>(null)
  const [stats, setStats] = useState<UserStats>({ applications: 0, interviews: 0, offers: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Edit states
  const [editing, setEditing] = useState<EditState>({
    targetTitles: false,
    skills: false,
    targetLocations: false,
    yearsExperience: false,
    name: false,
  })

  // Draft values
  const [drafts, setDrafts] = useState({
    name: '',
    targetTitles: '',
    skills: '',
    targetLocations: '',
    yearsExperience: '' as YearsExperience | '',
  })

  // Danger zone
  const [clearConfirm, setClearConfirm] = useState(false)
  const [clearDone, setClearDone] = useState(false)
  const clearConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [cloudConfirm, setCloudConfirm] = useState(false)
  const [cloudBusy, setCloudBusy] = useState(false)
  const [cloudDone, setCloudDone] = useState<string | null>(null)
  const [cloudError, setCloudError] = useState<string | null>(null)
  const cloudConfirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Motion config respecting prefers-reduced-motion
  const makeMotion = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.25,
            delay,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          },
        }

  // ── Load data ──────────────────────────────────────────────────

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      if (!authUser) return

      setUser({ id: authUser.id, email: authUser.email ?? '' })

      const { data: profileData } = await supabase
        .from('resume_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setDrafts({
          name: (authUser.user_metadata?.full_name as string) ?? '',
          targetTitles: (profileData.target_titles as string[] | null)?.join(', ') ?? '',
          skills: (profileData.skills as string[] | null)?.join(', ') ?? '',
          targetLocations: (profileData.target_locations as string[] | null)?.join(', ') ?? '',
          yearsExperience: (profileData.years_experience as YearsExperience | null) ?? '',
        })
      } else {
        setDrafts((d) => ({
          ...d,
          name: (authUser.user_metadata?.full_name as string) ?? '',
        }))
      }

      // Stats
      const [{ count: appCount }, { count: interviewCount }, { count: offerCount }] =
        await Promise.all([
          supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.id),
          supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .eq('status', 'interview'),
          supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', authUser.id)
            .eq('status', 'offer'),
        ])

      setStats({
        applications: appCount ?? 0,
        interviews: interviewCount ?? 0,
        offers: offerCount ?? 0,
      })

      setLoading(false)
    }

    load()
  }, [])

  // Cleanup confirm timer on unmount
  useEffect(() => {
    return () => {
      if (clearConfirmTimerRef.current) clearTimeout(clearConfirmTimerRef.current)
      if (cloudConfirmTimerRef.current) clearTimeout(cloudConfirmTimerRef.current)
    }
  }, [])

  // ── Save profile ───────────────────────────────────────────────

  const saveProfile = useCallback(
    async (
      updates: Partial<{
        target_titles: string[]
        skills: string[]
        target_locations: string[]
        years_experience: YearsExperience | null
      }>
    ) => {
      if (!user) return
      setSaving(true)
      setSaveError(null)
      const supabase = createClient()

      const { error } = await supabase.from('resume_profiles').upsert(
        {
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

      if (error) setSaveError(error.message)
      else setProfile((prev) => ({ ...prev, ...updates }))

      setSaving(false)
    },
    [user]
  )

  // ── Field helpers ──────────────────────────────────────────────

  function openEdit(field: keyof EditState) {
    setEditing((e) => ({ ...e, [field]: true }))
    setSaveError(null)
  }

  function cancelEdit(field: keyof EditState) {
    setDrafts((d) => {
      const reset = { ...d }
      if (field === 'targetTitles')
        reset.targetTitles = (profile?.target_titles as string[] | null)?.join(', ') ?? ''
      if (field === 'skills')
        reset.skills = (profile?.skills as string[] | null)?.join(', ') ?? ''
      if (field === 'targetLocations')
        reset.targetLocations = (profile?.target_locations as string[] | null)?.join(', ') ?? ''
      if (field === 'yearsExperience')
        reset.yearsExperience = (profile?.years_experience as YearsExperience | null) ?? ''
      return reset
    })
    setEditing((e) => ({ ...e, [field]: false }))
  }

  async function saveTargetTitles() {
    const parsed = drafts.targetTitles.split(',').map((s) => s.trim()).filter(Boolean)
    await saveProfile({ target_titles: parsed })
    setEditing((e) => ({ ...e, targetTitles: false }))
  }

  async function saveSkills() {
    const parsed = drafts.skills.split(',').map((s) => s.trim()).filter(Boolean)
    await saveProfile({ skills: parsed })
    setEditing((e) => ({ ...e, skills: false }))
  }

  async function saveTargetLocations() {
    const parsed = drafts.targetLocations.split(',').map((s) => s.trim()).filter(Boolean)
    await saveProfile({ target_locations: parsed })
    setEditing((e) => ({ ...e, targetLocations: false }))
  }

  async function saveYearsExperience() {
    await saveProfile({ years_experience: (drafts.yearsExperience as YearsExperience) || null })
    setEditing((e) => ({ ...e, yearsExperience: false }))
  }

  async function saveName() {
    if (!user) return
    setSaving(true)
    setSaveError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { full_name: drafts.name },
    })
    if (error) setSaveError(error.message)
    setSaving(false)
    setEditing((e) => ({ ...e, name: false }))
  }

  // ── Initials ───────────────────────────────────────────────────

  function getInitials(name: string, email: string): string {
    if (name.trim()) {
      return name
        .trim()
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
    }
    return (email[0] ?? '?').toUpperCase()
  }

  // ── Danger zone ────────────────────────────────────────────────

  function handleClearData() {
    if (!clearConfirm) {
      setClearConfirm(true)
      if (clearConfirmTimerRef.current) clearTimeout(clearConfirmTimerRef.current)
      clearConfirmTimerRef.current = setTimeout(() => setClearConfirm(false), 3000)
      return
    }
    if (clearConfirmTimerRef.current) clearTimeout(clearConfirmTimerRef.current)
    const keys = ['lakshya_hub_resume_v1', 'lakshya_hub_autosave', 'lakshya_hub_snaps_v1']
    keys.forEach((k) => localStorage.removeItem(k))
    setClearConfirm(false)
    setClearDone(true)
    setTimeout(() => setClearDone(false), 3000)
  }

  async function handleClearCloud() {
    if (!cloudConfirm) {
      setCloudConfirm(true)
      setCloudError(null)
      if (cloudConfirmTimerRef.current) clearTimeout(cloudConfirmTimerRef.current)
      cloudConfirmTimerRef.current = setTimeout(() => setCloudConfirm(false), 5000)
      return
    }
    if (cloudConfirmTimerRef.current) clearTimeout(cloudConfirmTimerRef.current)
    setCloudBusy(true)
    setCloudError(null)
    try {
      const res = await clearAllCloudData()
      const total = Object.values(res.counts).reduce((a, b) => a + b, 0)
      setCloudDone(`Deleted ${total} rows across ${Object.keys(res.counts).length} tables`)
      setCloudConfirm(false)
      setTimeout(() => setCloudDone(null), 5000)
    } catch (e) {
      setCloudError(e instanceof Error ? e.message : 'Unknown error')
      setCloudConfirm(false)
    } finally {
      setCloudBusy(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="space-y-4"
        style={{ padding: '18px 26px 60px', maxWidth: 1100, margin: '0 auto' }}
      >
        <SkeletonCard lines={2} />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={1} />
      </div>
    )
  }

  const displayName = drafts.name || user?.email?.split('@')[0] || 'User'
  const initials = getInitials(drafts.name, user?.email ?? 'U')

  const titleChips = (drafts.targetTitles || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const skillChips = (drafts.skills || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const locationChips = (drafts.targetLocations || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <div style={{ padding: '18px 26px 60px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Page heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 className="h1" style={{ marginBottom: 4 }}>
          Your <span className="grad-text">Profile</span>
        </h1>
        <p className="text-3" style={{ fontSize: 12.5, margin: 0 }}>
          This is what Lakshya uses to score, rewrite, and match. Keep it fresh.
        </p>
      </div>

      {/* Save status strip */}
      {(saving || saveError) && (
        <div className="flex items-center gap-2 mb-4">
          {saving && (
            <span className="badge">
              <span className="dot" /> Saving…
            </span>
          )}
          {saveError && (
            <span className="badge red" role="alert">
              {saveError}
            </span>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* ── Identity Card ─────────────────────────────────── */}
        <motion.div {...makeMotion(0)} className="card card-pad">
          <SectionHeader
            icon={UserIcon}
            eyebrow="Identity"
            title="Profile information"
            sub="How you appear across Lakshya."
            right={
              <EditToggleButton
                editing={editing.name}
                onOpen={() => openEdit('name')}
                label="Edit name"
              />
            }
          />

          <div className="flex items-center gap-5 flex-wrap">
            {/* Initials avatar */}
            <div
              className="flex items-center justify-center flex-shrink-0 select-none"
              style={{
                width: 68,
                height: 68,
                borderRadius: 999,
                background: 'var(--grad-brand)',
                color: '#06060a',
                fontSize: 24,
                fontWeight: 700,
                border: '3px solid var(--elev-1)',
                boxShadow: 'none',
              }}
              aria-hidden="true"
            >
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              {editing.name ? (
                <div className="space-y-2">
                  <div className="eyebrow" style={{ marginBottom: 4 }}>
                    Display name
                  </div>
                  <input
                    className="input"
                    value={drafts.name}
                    onChange={(e) => setDrafts((d) => ({ ...d, name: e.target.value }))}
                    placeholder="Your full name"
                    autoFocus
                    aria-label="Edit display name"
                  />
                  <InlineEditBar
                    onSave={saveName}
                    onCancel={() => setEditing((e) => ({ ...e, name: false }))}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg)' }}>
                      {displayName}
                    </span>
                    <span className="badge">PRO</span>
                  </div>
                  <div
                    className="flex items-center gap-1.5"
                    style={{ fontSize: 12, color: 'var(--fg-3)', marginTop: 4 }}
                  >
                    <Mail size={12} />
                    <span>{user?.email}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Target Titles Card ────────────────────────── */}
        <motion.div {...makeMotion(0.04)} className="card card-pad">
          <SectionHeader
            icon={Briefcase}
            eyebrow="Targeting"
            title="Target titles"
            sub="Roles you want Lakshya to match you against."
            right={
              <EditToggleButton
                editing={editing.targetTitles}
                onOpen={() => openEdit('targetTitles')}
                label="Edit target titles"
              />
            }
          />

          {editing.targetTitles ? (
            <div>
              <textarea
                className="textarea"
                value={drafts.targetTitles}
                onChange={(e) => setDrafts((d) => ({ ...d, targetTitles: e.target.value }))}
                placeholder="e.g. Senior Frontend Engineer, Staff Engineer (comma-separated)"
                autoFocus
              />
              <InlineEditBar
                onSave={saveTargetTitles}
                onCancel={() => cancelEdit('targetTitles')}
              />
            </div>
          ) : (
            <ChipList items={titleChips} emptyLabel="No target titles yet." />
          )}
        </motion.div>

        {/* ── Skills Card ──────────────────────────────── */}
        <motion.div {...makeMotion(0.08)} className="card card-pad">
          <SectionHeader
            icon={Sparkles}
            eyebrow="Expertise"
            title="Skills"
            sub="Keywords used to rewrite resumes and rank jobs."
            right={
              <EditToggleButton
                editing={editing.skills}
                onOpen={() => openEdit('skills')}
                label="Edit skills"
              />
            }
          />

          {editing.skills ? (
            <div>
              <textarea
                className="textarea"
                value={drafts.skills}
                onChange={(e) => setDrafts((d) => ({ ...d, skills: e.target.value }))}
                placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                autoFocus
              />
              <InlineEditBar onSave={saveSkills} onCancel={() => cancelEdit('skills')} />
            </div>
          ) : (
            <ChipList items={skillChips} emptyLabel="No skills yet." />
          )}
        </motion.div>

        {/* ── Locations Card ───────────────────────────── */}
        <motion.div {...makeMotion(0.12)} className="card card-pad">
          <SectionHeader
            icon={MapPin}
            eyebrow="Geography"
            title="Target locations"
            sub="Cities, regions, or remote preferences."
            right={
              <EditToggleButton
                editing={editing.targetLocations}
                onOpen={() => openEdit('targetLocations')}
                label="Edit target locations"
              />
            }
          />

          {editing.targetLocations ? (
            <div>
              <textarea
                className="textarea"
                value={drafts.targetLocations}
                onChange={(e) =>
                  setDrafts((d) => ({ ...d, targetLocations: e.target.value }))
                }
                placeholder="e.g. Bangalore, Remote, Fintech"
                autoFocus
              />
              <InlineEditBar
                onSave={saveTargetLocations}
                onCancel={() => cancelEdit('targetLocations')}
              />
            </div>
          ) : (
            <ChipList items={locationChips} emptyLabel="No locations yet." icon={MapPin} />
          )}
        </motion.div>

        {/* ── Years of Experience Card ─────────────────── */}
        <motion.div {...makeMotion(0.16)} className="card card-pad">
          <SectionHeader
            icon={Target}
            eyebrow="Experience"
            title="Years of experience"
            sub="Used to calibrate seniority in AI rewrites."
            right={
              <EditToggleButton
                editing={editing.yearsExperience}
                onOpen={() => openEdit('yearsExperience')}
                label="Edit years of experience"
              />
            }
          />

          {editing.yearsExperience ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {YEARS_OPTIONS.map((opt) => {
                  const active = drafts.yearsExperience === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setDrafts((d) => ({ ...d, yearsExperience: opt }))
                      }
                      className={`chip${active ? ' active' : ''}`}
                    >
                      {opt} years
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setDrafts((d) => ({ ...d, yearsExperience: '' }))}
                  className={`chip${drafts.yearsExperience === '' ? ' active' : ''}`}
                >
                  Not set
                </button>
              </div>
              <InlineEditBar
                onSave={saveYearsExperience}
                onCancel={() => cancelEdit('yearsExperience')}
              />
            </div>
          ) : drafts.yearsExperience ? (
            <span className="chip active" style={{ cursor: 'default' }}>
              {drafts.yearsExperience} years
            </span>
          ) : (
            <p className="text-3" style={{ fontSize: 12, fontStyle: 'italic', margin: 0 }}>
              Not set
            </p>
          )}
        </motion.div>

        {/* ── Stats Card ────────────────────────────────── */}
        <motion.div {...makeMotion(0.2)} className="card card-pad">
          <SectionHeader
            icon={BarChart3}
            eyebrow="Pipeline"
            title="Job search stats"
            sub="Live totals from your applications table."
          />

          <div className="grid grid-cols-3 gap-3">
            <StatTile label="Applications" value={stats.applications} />
            <StatTile label="Interviews" value={stats.interviews} />
            <StatTile label="Offers" value={stats.offers} tone="emerald" />
          </div>
        </motion.div>

        {/* ── Danger Zone Card ─────────────────────────── */}
        <motion.div
          {...makeMotion(0.24)}
          className="card card-pad"
          style={{ borderColor: 'rgba(239,68,68,0.2)' }}
        >
          <SectionHeader
            icon={ShieldAlert}
            eyebrow="Account actions"
            title="Danger zone"
            sub="Permanently clear all locally stored resume data from this device."
          />

          {clearDone ? (
            <div
              className="flex items-center gap-2"
              role="status"
              style={{ color: 'var(--emerald)', fontSize: 13 }}
            >
              <Check size={14} />
              Local resume data cleared.
            </div>
          ) : clearConfirm ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="flex items-center gap-1.5"
                style={{ color: 'var(--amber)', fontSize: 13 }}
              >
                <AlertTriangle size={14} />
                Are you sure? This cannot be undone.
              </span>
              <button onClick={handleClearData} className="btn danger sm">
                Yes, clear it
              </button>
              <button
                onClick={() => {
                  if (clearConfirmTimerRef.current)
                    clearTimeout(clearConfirmTimerRef.current)
                  setClearConfirm(false)
                }}
                className="btn ghost sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={handleClearData} className="btn danger">
              <Trash2 size={13} />
              Clear all local data
            </button>
          )}

          {/* Cloud wipe — removes Supabase rows */}
          <div style={{ height: 1, background: 'var(--hair)', margin: '18px 0' }} />
          <div>
            <p className="text-xs text-text-2" style={{ marginBottom: 10 }}>
              Also wipe server-side applications, jobs, scrape sessions, and saved
              resumes. Your auth account is kept — only user data is removed.
            </p>
            {cloudDone ? (
              <div className="flex items-center gap-2">
                <Check size={13} style={{ color: 'var(--emerald)' }} />
                <span className="text-xs" style={{ color: 'var(--emerald)' }}>
                  {cloudDone}
                </span>
              </div>
            ) : cloudError ? (
              <div className="flex items-center gap-2 flex-wrap">
                <AlertTriangle size={13} style={{ color: 'var(--red)' }} />
                <span className="text-xs" style={{ color: 'var(--red)' }}>
                  {cloudError}
                </span>
                <button
                  onClick={() => {
                    setCloudError(null)
                    setCloudConfirm(false)
                  }}
                  className="btn ghost sm"
                >
                  Dismiss
                </button>
              </div>
            ) : cloudConfirm ? (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs" style={{ color: 'var(--red)' }}>
                  Permanently delete all cloud data? This cannot be undone.
                </span>
                <button
                  onClick={handleClearCloud}
                  disabled={cloudBusy}
                  className="btn danger sm"
                >
                  {cloudBusy ? 'Deleting...' : 'Yes, delete everything'}
                </button>
                <button
                  onClick={() => {
                    if (cloudConfirmTimerRef.current)
                      clearTimeout(cloudConfirmTimerRef.current)
                    setCloudConfirm(false)
                  }}
                  className="btn ghost sm"
                  disabled={cloudBusy}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={handleClearCloud}
                className="btn danger"
                disabled={cloudBusy}
              >
                <ShieldAlert size={13} />
                Delete all cloud data
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: 'emerald'
}) {
  const color =
    tone === 'emerald' ? 'var(--emerald)' : 'var(--fg)'
  const bg = tone === 'emerald' ? 'var(--emerald-dim)' : 'var(--bg-2)'
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        padding: '16px 8px',
        borderRadius: 10,
        background: bg,
        border: '1px solid var(--hair)',
      }}
    >
      <span
        className="mono"
        style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}
        aria-label={`${value} ${label.toLowerCase()}`}
      >
        {value}
      </span>
      <span className="eyebrow" style={{ marginTop: 6 }}>
        {label}
      </span>
    </div>
  )
}

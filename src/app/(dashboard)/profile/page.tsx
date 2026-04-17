'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Pencil, Check, X, Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
    <div className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-white/[0.05] rounded-lg w-1/3" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-white/[0.05] rounded-lg"
            style={{ width: `${70 + i * 10}%` }}
          />
        ))}
      </div>
    </div>
  )
}

function InlineField({
  label,
  value,
  editing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  editing: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {label}
        </label>
        {!editing && (
          <button
            onClick={onEdit}
            aria-label={`Edit ${label}`}
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-500/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus
            aria-label={label}
            className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[44px]"
          />
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold hover:opacity-90 transition-opacity min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-500/50"
            >
              <Check className="w-3.5 h-3.5" />
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-500/50"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-300 min-h-[24px]">
          {value || <span className="text-slate-500 italic">{placeholder || 'Not set'}</span>}
        </p>
      )}
    </div>
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

  // Motion config respecting prefers-reduced-motion
  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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
    }
  }, [])

  // ── Save profile ───────────────────────────────────────────────

  const saveProfile = useCallback(
    async (updates: Partial<{
      target_titles: string[]
      skills: string[]
      target_locations: string[]
      years_experience: YearsExperience | null
    }>) => {
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
      // Auto-expire confirm state after 3s
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

  // ── Render ─────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <SkeletonCard lines={2} />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={2} />
        <SkeletonCard lines={1} />
      </div>
    )
  }

  const displayName = drafts.name || user?.email?.split('@')[0] || 'User'
  const initials = getInitials(drafts.name, user?.email ?? 'U')

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

      {/* ── Profile Header Card ─────────────────────────────────── */}
      <motion.div
        {...motionProps}
        className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)] flex items-center gap-5"
      >
        {/* Initials avatar */}
        <div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
          aria-hidden="true"
        >
          <span className="text-xl font-bold text-white select-none">{initials}</span>
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          {editing.name ? (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                value={drafts.name}
                onChange={(e) => setDrafts((d) => ({ ...d, name: e.target.value }))}
                autoFocus
                aria-label="Edit display name"
                className="bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none min-h-[44px] w-full max-w-xs"
              />
              <button
                onClick={saveName}
                aria-label="Save name"
                className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500/50"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditing((e) => ({ ...e, name: false }))}
                aria-label="Cancel edit name"
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white truncate">{displayName}</h1>
              <button
                onClick={() => openEdit('name')}
                aria-label="Edit name"
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-cyan-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyan-500/50"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-sm text-slate-400 truncate mt-0.5">{user?.email}</p>
        </div>
      </motion.div>

      {/* ── Resume Profile Card ─────────────────────────────────── */}
      <motion.div
        {...(shouldReduceMotion
          ? {}
          : {
              initial: { opacity: 0, y: 16 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.25, delay: 0.05, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
            })}
        className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)] space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Resume Profile</h2>
          {saving && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 animate-pulse">
              Saving...
            </span>
          )}
          {saveError && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest text-red-400"
              role="alert"
            >
              {saveError}
            </span>
          )}
        </div>

        <InlineField
          label="Target Titles"
          value={drafts.targetTitles}
          editing={editing.targetTitles}
          onEdit={() => openEdit('targetTitles')}
          onSave={saveTargetTitles}
          onCancel={() => cancelEdit('targetTitles')}
          onChange={(v) => setDrafts((d) => ({ ...d, targetTitles: v }))}
          placeholder="e.g. Senior Frontend Engineer, Staff Engineer (comma-separated)"
        />

        <InlineField
          label="Skills"
          value={drafts.skills}
          editing={editing.skills}
          onEdit={() => openEdit('skills')}
          onSave={saveSkills}
          onCancel={() => cancelEdit('skills')}
          onChange={(v) => setDrafts((d) => ({ ...d, skills: v }))}
          placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
        />

        <InlineField
          label="Target Locations"
          value={drafts.targetLocations}
          editing={editing.targetLocations}
          onEdit={() => openEdit('targetLocations')}
          onSave={saveTargetLocations}
          onCancel={() => cancelEdit('targetLocations')}
          onChange={(v) => setDrafts((d) => ({ ...d, targetLocations: v }))}
          placeholder="e.g. Bangalore, Remote, Fintech"
        />

        {/* Years of experience */}
        <div className="group">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="years-experience-select"
              className="text-xs font-bold uppercase tracking-widest text-slate-400"
            >
              Years of Experience
            </label>
            {!editing.yearsExperience && (
              <button
                onClick={() => openEdit('yearsExperience')}
                aria-label="Edit years of experience"
                className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-400 focus-visible:ring-2 focus-visible:ring-cyan-500/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {editing.yearsExperience ? (
            <div className="space-y-2">
              <select
                id="years-experience-select"
                value={drafts.yearsExperience}
                onChange={(e) =>
                  setDrafts((d) => ({ ...d, yearsExperience: e.target.value as YearsExperience | '' }))
                }
                className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[44px] appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1a1a24]">Select…</option>
                {YEARS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-[#1a1a24]">
                    {opt} years
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={saveYearsExperience}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold hover:opacity-90 transition-opacity min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save
                </button>
                <button
                  onClick={() => cancelEdit('yearsExperience')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-500/50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300 min-h-[24px]">
              {drafts.yearsExperience ? (
                `${drafts.yearsExperience} years`
              ) : (
                <span className="text-slate-500 italic">Not set</span>
              )}
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Job Search Stats Card ───────────────────────────────── */}
      <motion.div
        {...(shouldReduceMotion
          ? {}
          : {
              initial: { opacity: 0, y: 16 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.25, delay: 0.10, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
            })}
        className="bg-[#111118] border border-white/[0.06] rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
      >
        <h2 className="text-base font-semibold text-white mb-5">Job Search Stats</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-1 py-4 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/10">
            <span className="text-3xl font-bold text-cyan-400 tabular-nums" aria-label={`${stats.applications} applications`}>
              {stats.applications}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Applications
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 py-4 rounded-xl bg-purple-500/[0.06] border border-purple-500/10">
            <span className="text-3xl font-bold text-purple-400 tabular-nums" aria-label={`${stats.interviews} interviews`}>
              {stats.interviews}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Interviews
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 py-4 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10">
            <span className="text-3xl font-bold text-emerald-400 tabular-nums" aria-label={`${stats.offers} offers`}>
              {stats.offers}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Offers
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Danger Zone Card ────────────────────────────────────── */}
      <motion.div
        {...(shouldReduceMotion
          ? {}
          : {
              initial: { opacity: 0, y: 16 },
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.25, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
            })}
        className="bg-[#111118] border border-red-500/10 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
      >
        <h2 className="text-base font-semibold text-red-400 mb-1">Danger Zone</h2>
        <p className="text-sm text-slate-400 mb-5">
          Permanently clear all locally stored resume data from this device.
        </p>

        {clearDone ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400" role="status">
            <Check className="w-4 h-4" />
            Local resume data cleared.
          </div>
        ) : clearConfirm ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              Are you sure? This cannot be undone.
            </span>
            <button
              onClick={handleClearData}
              className="px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-500/50"
            >
              Yes, clear it
            </button>
            <button
              onClick={() => {
                if (clearConfirmTimerRef.current) clearTimeout(clearConfirmTimerRef.current)
                setClearConfirm(false)
              }}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium hover:bg-white/10 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-500/50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={handleClearData}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors text-sm font-medium min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-500/50"
          >
            <Trash2 className="w-4 h-4" />
            Clear all local data
          </button>
        )}
      </motion.div>
    </div>
  )
}

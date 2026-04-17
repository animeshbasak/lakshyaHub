'use client'

import { useState, useCallback, KeyboardEvent } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { YearsExperience } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: () => void
}

interface StepData {
  name: string
  currentRole: string
  targetRole: string
  yearsExperience: YearsExperience | ''
  skills: string[]
}

const YEARS_OPTIONS: YearsExperience[] = ['<1', '1-3', '3-5', '5-10', '10+']

const TOTAL_STEPS = 5

// ── Step Indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1
        const isDone = stepNum < current
        const isCurrent = stepNum === current
        return (
          <div
            key={i}
            className={`rounded-full transition-all duration-200 ${
              isCurrent
                ? 'w-3 h-3 bg-cyan-500'
                : isDone
                ? 'w-2.5 h-2.5 bg-cyan-500/40'
                : 'w-2.5 h-2.5 bg-white/10'
            }`}
          />
        )
      })}
    </div>
  )
}

// ── Skill Tag Input ─────────────────────────────────────────────────────────────

function SkillTagInput({
  skills,
  onChange,
}: {
  skills: string[]
  onChange: (skills: string[]) => void
}) {
  const [inputValue, setInputValue] = useState('')

  function addSkill(raw: string) {
    const trimmed = raw.trim()
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed])
    }
    setInputValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && skills.length > 0) {
      onChange(skills.slice(0, -1))
    }
  }

  function removeSkill(skill: string) {
    onChange(skills.filter((s) => s !== skill))
  }

  return (
    <div className="space-y-3">
      <div
        className="flex flex-wrap gap-2 min-h-[44px] bg-[#1a1a24] border border-white/10 rounded-xl px-3 py-2 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all cursor-text"
        onClick={(e) => {
          const input = (e.currentTarget as HTMLDivElement).querySelector('input')
          input?.focus()
        }}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              aria-label={`Remove ${skill}`}
              className="hover:text-cyan-200 transition-colors focus-visible:ring-1 focus-visible:ring-cyan-500/50 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? 'Type a skill and press Enter or comma…' : 'Add more…'}
          aria-label="Add skill"
          className="flex-1 min-w-[120px] bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none min-h-[28px]"
        />
      </div>
      <p className="text-[11px] text-slate-500">
        Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 font-mono text-[10px]">Enter</kbd> or{' '}
        <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 font-mono text-[10px]">,</kbd> to add.{' '}
        <kbd className="px-1 py-0.5 rounded bg-white/10 text-slate-400 font-mono text-[10px]">Backspace</kbd> to remove last.
      </p>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const shouldReduceMotion = useReducedMotion()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [data, setData] = useState<StepData>({
    name: '',
    currentRole: '',
    targetRole: '',
    yearsExperience: '',
    skills: [],
  })

  function update<K extends keyof StepData>(key: K, value: StepData[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  function canAdvance(): boolean {
    if (step === 1) return data.name.trim().length > 0
    if (step === 2) return data.currentRole.trim().length > 0
    if (step === 3) return data.targetRole.trim().length > 0
    if (step === 4) return data.yearsExperience !== ''
    if (step === 5) return data.skills.length > 0
    return true
  }

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
  }, [step])

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1)
  }, [step])

  const handleFinish = useCallback(async () => {
    setSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Update display name
      if (data.name.trim()) {
        await supabase.auth.updateUser({ data: { full_name: data.name.trim() } })
      }

      // Upsert resume_profiles
      const { error: upsertError } = await supabase.from('resume_profiles').upsert({
        id: user.id,
        target_titles: [data.targetRole].filter(Boolean),
        skills: data.skills,
        years_experience: data.yearsExperience || null,
        updated_at: new Date().toISOString(),
        source: 'manual',
      })

      if (upsertError) throw upsertError

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }, [data, onComplete])

  const cardVariants = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.35, ease: 'easeOut' as const },
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0 }}
          animate={shouldReduceMotion ? {} : { opacity: 1 }}
          exit={shouldReduceMotion ? {} : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Onboarding setup"
        >
          <motion.div
            {...cardVariants}
            className="bg-[#111118] border border-white/[0.06] rounded-3xl max-w-md w-full p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          >
            {/* Step indicator */}
            <StepIndicator current={step} total={TOTAL_STEPS} />

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">What's your name?</h2>
                      <p className="text-sm text-slate-400">We'll use this across your profile.</p>
                    </div>
                    <div>
                      <label htmlFor="onboarding-name" className="sr-only">Your name</label>
                      <input
                        id="onboarding-name"
                        type="text"
                        autoComplete="name"
                        value={data.name}
                        onChange={(e) => update('name', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && canAdvance() && handleNext()}
                        placeholder="e.g. Priya Sharma"
                        autoFocus
                        className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[44px]"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">What's your current role?</h2>
                      <p className="text-sm text-slate-400">Your current job title or most recent one.</p>
                    </div>
                    <div>
                      <label htmlFor="onboarding-current-role" className="sr-only">Current role</label>
                      <input
                        id="onboarding-current-role"
                        type="text"
                        value={data.currentRole}
                        onChange={(e) => update('currentRole', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && canAdvance() && handleNext()}
                        placeholder="e.g. Software Engineer"
                        autoFocus
                        className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[44px]"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">What's your target role?</h2>
                      <p className="text-sm text-slate-400">The role you're actively seeking.</p>
                    </div>
                    <div>
                      <label htmlFor="onboarding-target-role" className="sr-only">Target role</label>
                      <input
                        id="onboarding-target-role"
                        type="text"
                        value={data.targetRole}
                        onChange={(e) => update('targetRole', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && canAdvance() && handleNext()}
                        placeholder="e.g. Senior Frontend Engineer"
                        autoFocus
                        className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[44px]"
                      />
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">Years of experience?</h2>
                      <p className="text-sm text-slate-400">Help us calibrate job recommendations.</p>
                    </div>
                    <div>
                      <label htmlFor="onboarding-years" className="sr-only">Years of experience</label>
                      <select
                        id="onboarding-years"
                        value={data.yearsExperience}
                        onChange={(e) => update('yearsExperience', e.target.value as YearsExperience | '')}
                        className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[44px] appearance-none cursor-pointer"
                        autoFocus
                      >
                        <option value="" className="bg-[#1a1a24]">Select…</option>
                        {YEARS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#1a1a24]">
                            {opt === '<1' ? 'Less than 1 year' : `${opt} years`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">What are your top skills?</h2>
                      <p className="text-sm text-slate-400">Add the skills you're strongest in.</p>
                    </div>
                    <SkillTagInput skills={data.skills} onChange={(s) => update('skills', s)} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Error */}
            {error && (
              <p className="mt-4 text-sm text-red-400" role="alert">
                {error}
              </p>
            )}

            {/* Navigation */}
            <div className="flex items-center gap-3 mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  disabled={submitting}
                  className="flex-1 bg-white/5 border border-white/10 text-white font-medium px-5 py-3 rounded-xl hover:bg-white/10 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
              )}

              {step < TOTAL_STEPS ? (
                <button
                  onClick={handleNext}
                  disabled={!canAdvance()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  disabled={!canAdvance() || submitting}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-opacity min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Saving…
                    </>
                  ) : (
                    'Finish'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

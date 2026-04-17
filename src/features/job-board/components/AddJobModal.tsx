'use client'
// src/features/job-board/components/AddJobModal.tsx
import { useState, useEffect, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { addJobToBoard } from '@/actions/addJobToBoard'
import type { Job } from '@/types'

interface AddJobModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (job: Job) => void
}

export function AddJobModal({ isOpen, onClose, onSuccess }: AddJobModalProps) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  // Focus title on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 60)
    }
  }, [isOpen])

  // ESC key close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const resetForm = () => {
    setTitle('')
    setCompany('')
    setLocation('')
    setUrl('')
    setNotes('')
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !company.trim()) {
      setError('Title and Company are required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await addJobToBoard({
        title: title.trim(),
        company: company.trim(),
        location: location.trim() || undefined,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
        source: 'manual',
      })

      if (!result.success || !result.job) {
        setError(result.error ?? 'Failed to save job.')
        return
      }

      resetForm()
      onSuccess(result.job)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all min-h-[44px]'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[200] pointer-events-none"
          >
            <div
              className="w-full max-w-lg bg-[#111118] border border-white/[0.08] rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-job-modal-title"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.06]">
                <h2
                  id="add-job-modal-title"
                  className="text-xl font-semibold text-white"
                >
                  Add Job Manually
                </h2>
                <button
                  onClick={handleClose}
                  aria-label="Close modal"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} noValidate>
                <div className="px-6 py-5 flex flex-col gap-4">
                  {/* Title */}
                  <div>
                    <label
                      htmlFor="ajm-title"
                      className="block text-xs font-bold uppercase tracking-widest text-text-2 mb-2"
                    >
                      Job Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      ref={titleRef}
                      id="ajm-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Product Manager"
                      required
                      className={`${inputClass} ${!title && error ? 'border-red-500/50 focus:ring-red-500/20' : ''}`}
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label
                      htmlFor="ajm-company"
                      className="block text-xs font-bold uppercase tracking-widest text-text-2 mb-2"
                    >
                      Company <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="ajm-company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      required
                      className={`${inputClass} ${!company && error ? 'border-red-500/50 focus:ring-red-500/20' : ''}`}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label
                      htmlFor="ajm-location"
                      className="block text-xs font-bold uppercase tracking-widest text-text-2 mb-2"
                    >
                      Location
                    </label>
                    <input
                      id="ajm-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Bangalore, Remote"
                      className={inputClass}
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label
                      htmlFor="ajm-url"
                      className="block text-xs font-bold uppercase tracking-widest text-text-2 mb-2"
                    >
                      Job URL
                    </label>
                    <input
                      id="ajm-url"
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className={inputClass}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="ajm-notes"
                      className="block text-xs font-bold uppercase tracking-widest text-text-2 mb-2"
                    >
                      Notes
                    </label>
                    <textarea
                      id="ajm-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any notes about this role…"
                      rows={3}
                      className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-sm text-red-400" role="alert">
                      {error}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 pb-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="min-h-[44px] px-5 py-3 rounded-xl text-sm font-medium border border-white/10 text-text-muted hover:text-white hover:border-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="min-h-[44px] flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:outline-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      'Add to Board'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

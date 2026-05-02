'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Pen, Sparkles, Trash2, Upload, RotateCcw, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { WritingStyleProfile } from '@/lib/writingStyle/types'

interface SampleRow {
  id: string
  filename: string
  byte_size: number
  created_at: string
}

interface StyleApiResponse {
  success: boolean
  profile: WritingStyleProfile | null
  calibratedAt: string | null
  sampleCount: number
}

export default function WritingStylePage() {
  // Lazy-init Supabase client (avoids the SSR document.cookie throw under
  // Next 16 + Turbopack — same pattern as the login page fix).
  const [supabase] = useState(() => createClient())

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<WritingStyleProfile | null>(null)
  const [calibratedAt, setCalibratedAt] = useState<string | null>(null)
  const [samples, setSamples] = useState<SampleRow[]>([])

  const [filename, setFilename] = useState('')
  const [content, setContent] = useState('')
  const [uploading, setUploading] = useState(false)
  const [recalibrating, setRecalibrating] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const styleRes = await fetch('/api/writing-style')
      if (styleRes.ok) {
        const data = (await styleRes.json()) as StyleApiResponse
        setProfile(data.profile)
        setCalibratedAt(data.calibratedAt)
      }
      // Samples table read directly from Supabase (faster than another route);
      // RLS gates by user_id.
      const { data } = await supabase
        .from('writing_samples')
        .select('id, filename, byte_size, created_at')
        .order('created_at', { ascending: false })
      if (data) setSamples(data as SampleRow[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!filename.trim() || !content.trim()) return
    setUploading(true)
    try {
      const res = await fetch('/api/writing-style/upload', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ filename, content }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Upload failed')
        return
      }
      toast.success(`Uploaded ${filename}`)
      setFilename('')
      setContent('')
      await refresh()
    } finally {
      setUploading(false)
    }
  }

  const handleRecalibrate = async () => {
    if (samples.length === 0) {
      toast.error('Upload at least one sample first.')
      return
    }
    setRecalibrating(true)
    try {
      const res = await fetch('/api/writing-style/recalibrate', { method: 'POST' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.error ?? 'Recalibration failed')
        return
      }
      toast.success('Style profile updated.')
      await refresh()
    } finally {
      setRecalibrating(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('writing_samples').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Sample deleted.')
    await refresh()
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <Pen className="w-5 h-5 text-white/70" />
          <h1 className="text-2xl font-bold tracking-tight">Writing Style</h1>
        </div>
        <p className="text-sm text-text-muted max-w-xl">
          Upload examples of your own writing — emails, slack messages, blog
          posts, anything in your voice. Recalibrate, and your AI-drafted cover
          letters will sound like you wrote them, not like ChatGPT.
        </p>
      </motion.div>

      {/* Privacy callout */}
      <div className="mb-8 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-[13px] text-text-muted flex items-start gap-3">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-white/40" />
        <span>
          Samples are private to your account (RLS-gated). Before being sent to
          the LLM, names / emails / phones / urls are stripped. Only abstract
          style descriptors (tone, sentence length, vocabulary) are persisted —
          never your raw text.
        </span>
      </div>

      {/* Current style summary */}
      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">
          Calibrated style
        </h2>
        {loading ? (
          <div className="text-sm text-text-muted">Loading…</div>
        ) : profile ? (
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-3 text-sm">
            <div><span className="text-text-muted">Tone: </span>{profile.tone}</div>
            <div><span className="text-text-muted">Sentence length: </span>{profile.avgSentenceLength}</div>
            <div><span className="text-text-muted">Opening: </span>{profile.openingPattern}</div>
            <div><span className="text-text-muted">Punctuation: </span>{profile.punctuationHabits}</div>
            <div><span className="text-text-muted">Vocabulary: </span>{profile.vocabularyPrefs}</div>
            <div><span className="text-text-muted">Structure: </span>{profile.structurePatterns}</div>
            <div><span className="text-text-muted">Voice signatures: </span>{profile.voiceSignatures}</div>
            {profile.avoidList.length > 0 && (
              <div><span className="text-text-muted">Avoid: </span>{profile.avoidList.join(', ')}</div>
            )}
            {calibratedAt && (
              <div className="text-[11px] text-text-muted/70 pt-2">
                Last calibrated {new Date(calibratedAt).toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 text-sm text-text-muted">
            Not calibrated yet. Upload a sample below, then click Recalibrate.
          </div>
        )}
      </section>

      {/* Upload form */}
      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">
          Upload a sample
        </h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="e.g. linkedin-post-2026-04.md"
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:border-white/25 outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste 200–5000 words of your own writing here…"
            rows={8}
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3 text-sm text-white focus:border-white/25 outline-none resize-y font-mono"
          />
          <button
            disabled={uploading || !filename.trim() || !content.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-bg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-all"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading…' : 'Upload sample'}
          </button>
        </form>
      </section>

      {/* Sample list */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">
            Samples ({samples.length} / 20)
          </h2>
          <button
            onClick={handleRecalibrate}
            disabled={recalibrating || samples.length === 0}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-[13px] font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {recalibrating ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {recalibrating ? 'Recalibrating…' : 'Recalibrate'}
          </button>
        </div>
        {samples.length === 0 ? (
          <div className="text-sm text-text-muted">No samples yet.</div>
        ) : (
          <ul className="space-y-2">
            {samples.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{s.filename}</div>
                  <div className="text-[11px] text-text-muted">
                    {(s.byte_size / 1024).toFixed(1)} KB · {new Date(s.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                  aria-label={`Delete ${s.filename}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

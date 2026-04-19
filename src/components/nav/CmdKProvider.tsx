'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Home,
  Search,
  Kanban,
  FileText,
  Settings,
  Zap,
  Upload,
  Plus,
  ArrowRight,
  Download,
  Sparkles,
  Wand,
  Layout,
  Briefcase,
} from 'lucide-react'
import { BrandMark } from './BrandMark'
import { createClient } from '@/lib/supabase/client'
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore'
import type { TemplateType } from '@/types'

type Ctx = { open: () => void; close: () => void }
const CmdKCtx = createContext<Ctx>({ open: () => {}, close: () => {} })
export const useCmdK = () => useContext(CmdKCtx)

type Item = {
  grp: string
  label: string
  sub?: string
  hint?: string
  trailing?: React.ReactNode
  Icon: React.ComponentType<{ size?: number; color?: string }>
  run: () => void
}

const RESUME_TEMPLATE_ENTRIES: Array<{ id: TemplateType; label: string; sub: string }> = [
  { id: 'minimal', label: 'Minimal', sub: 'Single-column, tight spacing' },
  { id: 'modern', label: 'Modern', sub: 'Sidebar accent, generous type' },
  { id: 'harvard', label: 'Harvard', sub: 'Classic two-column academic' },
  { id: 'faang', label: 'FAANG', sub: 'Tight, quantified, results-first' },
  { id: 'executive', label: 'Executive', sub: 'Summary-led, leadership emphasis' },
  { id: 'creative', label: 'Creative', sub: 'Accent color, portfolio-friendly' },
  { id: 'classic', label: 'Classic', sub: 'Serif, traditional layout' },
]

type RecentJob = {
  id: string
  title: string
  company: string
  location: string | null
  fit_score: number | null
}

export function CmdKProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isOpen, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const updateTemplate = useResumeStore((s) => s.updateTemplate)

  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])

  const fetchRecentJobs = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('jobs')
        .select('id,title,company,location,fit_score')
        .order('created_at', { ascending: false })
        .limit(5)
      if (data) setRecentJobs(data as RecentJob[])
    } catch {
      // ignore - palette still usable without recents
    }
  }, [])

  const triggerAddJob = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lk:open-add-job'))
    }
    router.push('/board')
  }, [router])

  const triggerDownloadResume = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lk:download-resume'))
    }
    router.push('/resume')
    toast.message('Opening Resume — use Download PDF in the header.')
  }, [router])

  const triggerAiRewrite = useCallback(() => {
    router.push('/resume')
    toast.message('AI rewrite — select a bullet in the builder to improve it.')
  }, [router])

  const triggerCoverLetter = useCallback(() => {
    toast('Cover letter generator — coming soon.')
  }, [])

  const items: Item[] = useMemo(() => {
    const nav: Item[] = [
      { grp: 'Navigate', Icon: Home, label: 'Go to Home', hint: 'G H', run: () => router.push('/dashboard') },
      { grp: 'Navigate', Icon: Search, label: 'Go to Discover', hint: 'G D', run: () => router.push('/discover') },
      { grp: 'Navigate', Icon: Kanban, label: 'Go to Pipeline', hint: 'G P', run: () => router.push('/board') },
      { grp: 'Navigate', Icon: FileText, label: 'Go to Resume', hint: 'G R', run: () => router.push('/resume') },
      { grp: 'Navigate', Icon: Settings, label: 'Go to Settings', hint: 'G S', run: () => router.push('/profile') },
    ]
    const actions: Item[] = [
      { grp: 'Actions', Icon: Zap, label: 'Run new job search', hint: '⌘J', run: () => router.push('/discover') },
      { grp: 'Actions', Icon: Plus, label: 'Add job to pipeline', hint: '⌘N', run: triggerAddJob },
      { grp: 'Actions', Icon: Upload, label: 'Import resume (PDF/DOCX)', hint: '⌘U', run: () => router.push('/resume') },
      { grp: 'Actions', Icon: Download, label: 'Download resume as PDF', run: triggerDownloadResume },
      { grp: 'Actions', Icon: Sparkles, label: 'AI rewrite selected bullets', run: triggerAiRewrite },
      { grp: 'Actions', Icon: Wand, label: 'Generate cover letter', run: triggerCoverLetter },
    ]
    const templates: Item[] = RESUME_TEMPLATE_ENTRIES.map((t) => ({
      grp: 'Resume Templates',
      Icon: Layout,
      label: `Switch to ${t.label}`,
      sub: t.sub,
      run: () => {
        updateTemplate(t.id)
        toast.success(`Switched to ${t.label} template`)
        router.push('/resume')
      },
    }))
    const jobs: Item[] = recentJobs.map((j) => ({
      grp: 'Recent jobs',
      Icon: Briefcase,
      label: j.title,
      sub: [j.company, j.location].filter(Boolean).join(' · '),
      trailing:
        typeof j.fit_score === 'number' ? (
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>
            fit {Math.round(j.fit_score)}
          </span>
        ) : undefined,
      run: () => router.push('/board'),
    }))
    return [...nav, ...actions, ...templates, ...jobs]
  }, [router, triggerAddJob, triggerDownloadResume, triggerAiRewrite, triggerCoverLetter, updateTemplate, recentJobs])

  const filtered = useMemo(() => {
    if (!q) return items
    const ql = q.toLowerCase()
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(ql) ||
        (i.sub && i.sub.toLowerCase().includes(ql)) ||
        i.grp.toLowerCase().includes(ql)
    )
  }, [q, items])

  useEffect(() => {
    setIdx(0)
  }, [q])

  useEffect(() => {
    if (isOpen) {
      setQ('')
      setIdx(0)
      fetchRecentJobs()
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, fetchRecentJobs])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement | null
      const inField =
        !!target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (mod && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        router.push('/discover')
      } else if (mod && e.key.toLowerCase() === 'n' && !inField) {
        e.preventDefault()
        triggerAddJob()
      } else if (mod && e.key.toLowerCase() === 'u' && !inField) {
        e.preventDefault()
        router.push('/resume')
      } else if (e.key === 'Escape') {
        setOpen(false)
      } else if (isOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setIdx((i) => Math.min(i + 1, filtered.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setIdx((i) => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && filtered[idx]) {
          filtered[idx].run()
          setOpen(false)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, filtered, idx, router, triggerAddJob])

  const ctx = useMemo(() => ({ open, close }), [open, close])

  const grouped: Array<{ grp?: string; item?: Item }> = []
  let lastGrp: string | null = null
  filtered.forEach((item) => {
    if (item.grp !== lastGrp) {
      grouped.push({ grp: item.grp })
      lastGrp = item.grp
    }
    grouped.push({ item })
  })

  let flatIdx = -1

  return (
    <CmdKCtx.Provider value={ctx}>
      {children}
      {isOpen && (
        <div
          onClick={close}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'start center',
            paddingTop: '10vh',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(640px, 92vw)',
              maxHeight: '70vh',
              background: 'var(--elev-2)',
              border: '1px solid var(--hair-strong)',
              borderRadius: 14,
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderBottom: '1px solid var(--hair)',
              }}
            >
              <Search size={16} color="var(--fg-3)" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type a command, search a job, or paste a URL..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  color: 'var(--fg)',
                }}
              />
              <span className="kbd">esc</span>
            </div>

            <div style={{ overflow: 'auto', padding: '6px 6px 10px' }}>
              {filtered.length === 0 && (
                <div
                  style={{
                    padding: '28px 16px',
                    textAlign: 'center',
                    color: 'var(--fg-3)',
                    fontSize: 13,
                  }}
                >
                  No results for &quot;{q}&quot;
                </div>
              )}
              {grouped.map((row, i) => {
                if (row.grp)
                  return (
                    <div
                      key={'g' + i}
                      className="eyebrow"
                      style={{
                        padding: '10px 12px 4px',
                        fontSize: 9.5,
                        color: 'var(--fg-4)',
                      }}
                    >
                      {row.grp}
                    </div>
                  )
                flatIdx++
                const cur = flatIdx
                const active = cur === idx
                const it = row.item!
                const IconC = it.Icon
                return (
                  <div
                    key={i}
                    onMouseEnter={() => setIdx(cur)}
                    onClick={() => {
                      it.run()
                      close()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 10px',
                      borderRadius: 7,
                      background: active ? 'var(--bg-2)' : 'transparent',
                      color: active ? 'var(--fg)' : 'var(--fg-2)',
                      cursor: 'pointer',
                      fontSize: 13,
                      border: active
                        ? '1px solid var(--hair-strong, rgba(255,255,255,0.12))'
                        : '1px solid transparent',
                    }}
                  >
                    <IconC size={15} color={active ? 'var(--fg)' : 'var(--fg-3)'} />
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        gap: 8,
                        alignItems: 'baseline',
                      }}
                    >
                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {it.label}
                      </span>
                      {it.sub && (
                        <span
                          style={{
                            fontSize: 11.5,
                            color: 'var(--fg-4)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {it.sub}
                        </span>
                      )}
                    </span>
                    {it.trailing}
                    {it.hint && (
                      <span
                        className="mono"
                        style={{ fontSize: 10.5, color: 'var(--fg-4)' }}
                      >
                        {it.hint}
                      </span>
                    )}
                    {active && <ArrowRight size={13} color="var(--fg)" />}
                  </div>
                )
              })}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '9px 14px',
                borderTop: '1px solid var(--hair)',
                background: 'var(--bg-1)',
                fontSize: 11,
                color: 'var(--fg-3)',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span className="kbd">↵</span> to run
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span className="kbd">↑</span>
                <span className="kbd">↓</span> navigate
              </span>
              <span style={{ flex: 1 }} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <BrandMark size={14} />
                <span>Lakshya Hub</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </CmdKCtx.Provider>
  )
}

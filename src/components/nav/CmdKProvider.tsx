'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { BrandMark } from './BrandMark'

type Ctx = { open: () => void; close: () => void }
const CmdKCtx = createContext<Ctx>({ open: () => {}, close: () => {} })
export const useCmdK = () => useContext(CmdKCtx)

type Item = {
  grp: string
  label: string
  hint?: string
  Icon: React.ComponentType<{ size?: number }>
  run: () => void
}

export function CmdKProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isOpen, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])

  const items: Item[] = useMemo(
    () => [
      { grp: 'Navigate', Icon: Home, label: 'Go to Home', hint: 'G H', run: () => router.push('/dashboard') },
      { grp: 'Navigate', Icon: Search, label: 'Go to Discover', hint: 'G D', run: () => router.push('/discover') },
      { grp: 'Navigate', Icon: Kanban, label: 'Go to Pipeline', hint: 'G P', run: () => router.push('/board') },
      { grp: 'Navigate', Icon: FileText, label: 'Go to Resume', hint: 'G R', run: () => router.push('/resume') },
      { grp: 'Navigate', Icon: Settings, label: 'Go to Settings', hint: 'G S', run: () => router.push('/profile') },
      { grp: 'Actions', Icon: Zap, label: 'Run new job search', hint: '⌘J', run: () => router.push('/discover') },
      { grp: 'Actions', Icon: Plus, label: 'Add job to pipeline', hint: '⌘N', run: () => router.push('/board') },
      { grp: 'Actions', Icon: Upload, label: 'Import resume (PDF/DOCX)', hint: '⌘U', run: () => router.push('/resume') },
    ],
    [router]
  )

  const filtered = useMemo(() => {
    if (!q) return items
    const ql = q.toLowerCase()
    return items.filter(
      (i) => i.label.toLowerCase().includes(ql) || i.grp.toLowerCase().includes(ql)
    )
  }, [q, items])

  useEffect(() => {
    setIdx(0)
  }, [q])

  useEffect(() => {
    if (isOpen) {
      setQ('')
      setIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (mod && e.key.toLowerCase() === 'j') {
        e.preventDefault()
        router.push('/discover')
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
  }, [isOpen, filtered, idx, router])

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
                      background: active ? 'rgba(34,211,238,0.10)' : 'transparent',
                      color: active ? 'var(--fg)' : 'var(--fg-2)',
                      cursor: 'pointer',
                      fontSize: 13,
                      border: active
                        ? '1px solid rgba(34,211,238,0.25)'
                        : '1px solid transparent',
                    }}
                  >
                    <IconC size={15} />
                    <span style={{ flex: 1 }}>{it.label}</span>
                    {it.hint && (
                      <span
                        className="mono"
                        style={{ fontSize: 10.5, color: 'var(--fg-4)' }}
                      >
                        {it.hint}
                      </span>
                    )}
                    {active && <ArrowRight size={13} color="var(--cyan)" />}
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

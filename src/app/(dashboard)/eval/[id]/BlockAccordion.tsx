'use client'

import { useState, useMemo } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  reportMd: string
}

interface Block {
  letter: string
  heading: string
  body: string
}

const BLOCK_RE = /(?:^|\n)#{0,3}\s*(?:Block\s+)?([A-G])(?:\s*[—\-:]\s*|\s+)([^\n]+)\n([\s\S]*?)(?=(?:\n#{0,3}\s*(?:Block\s+)?[A-G][—\-:\s])|---SCORE_SUMMARY---|$)/g

function parseBlocks(md: string): Block[] {
  if (!md) return []
  const blocks: Block[] = []
  let m: RegExpExecArray | null
  while ((m = BLOCK_RE.exec(md)) !== null) {
    blocks.push({ letter: m[1], heading: m[2].trim(), body: m[3].trim() })
  }
  return blocks
}

export function BlockAccordion({ reportMd }: Props) {
  const blocks = useMemo(() => parseBlocks(reportMd), [reportMd])
  const [openLetter, setOpenLetter] = useState<string | null>(blocks[0]?.letter ?? null)

  if (blocks.length === 0) {
    return (
      <section aria-label="Evaluation report" className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-xs text-text-2 mb-2">Raw report (block parser found 0 sections):</p>
        <pre className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed font-mono">{reportMd || '(empty)'}</pre>
      </section>
    )
  }

  return (
    <section aria-label="Evaluation report" className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
      {blocks.map((b, i) => {
        const open = openLetter === b.letter
        return (
          <div key={b.letter} className={i > 0 ? 'border-t border-white/5' : ''}>
            <button
              type="button"
              onClick={() => setOpenLetter(open ? null : b.letter)}
              aria-expanded={open}
              className="w-full flex items-center gap-3 px-4 md:px-5 py-3 text-left min-h-[44px] hover:bg-white/[0.02] transition-colors"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/20 text-xs font-semibold text-[color:var(--accent)]">
                {b.letter}
              </span>
              <span className="flex-1 text-sm font-medium text-white truncate">{b.heading}</span>
              <ChevronDown
                aria-hidden="true"
                className={`w-4 h-4 text-text-2 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open && (
              <div className="px-4 md:px-5 pb-5 pt-1">
                <pre className="whitespace-pre-wrap text-[13px] text-white/85 leading-relaxed font-sans">
                  {b.body}
                </pre>
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}

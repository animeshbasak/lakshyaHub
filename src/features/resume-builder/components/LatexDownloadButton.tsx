'use client'

import { useState } from 'react'
import { Download, FileCode, ExternalLink, Loader2 } from 'lucide-react'
import { resumeToLatex } from '@/features/resume-builder/export/latexExporter'
import type { ResumeData } from '@/types'

interface Props {
  data: ResumeData
  className?: string
}

/**
 * Two-action LaTeX export:
 *   - Download .tex file (paste into Overleaf or any LaTeX editor)
 *   - Open Overleaf with the resume pre-loaded (URL-param transport
 *     supported by Overleaf's `?snip_uri=` flow)
 */
export function LatexDownloadButton({ data, className = '' }: Props) {
  const [busy, setBusy] = useState(false)

  function downloadTex() {
    const tex = resumeToLatex(data)
    const blob = new Blob([tex], { type: 'application/x-tex;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(data.header.name || 'Resume').replace(/\s+/g, '_').toLowerCase()}.tex`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Overleaf accepts a snippet URL via `snip_uri` query param. We host the
  // .tex inline via data: URL since the file is small (~5-15KB).
  function openInOverleaf() {
    setBusy(true)
    try {
      const tex = resumeToLatex(data)
      const dataUrl = `data:application/x-tex;base64,${btoa(unescape(encodeURIComponent(tex)))}`
      const overleaf = `https://www.overleaf.com/docs?snip_uri=${encodeURIComponent(dataUrl)}`
      window.open(overleaf, '_blank', 'noopener,noreferrer')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={downloadTex}
        className="min-h-[40px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white hover:bg-white/[0.06]"
        title="Download .tex file"
      >
        <FileCode className="w-4 h-4" aria-hidden="true" />
        Download .tex
      </button>
      <button
        type="button"
        onClick={openInOverleaf}
        disabled={busy}
        className="min-h-[40px] px-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-sm text-white hover:bg-white/[0.06] disabled:opacity-60"
        title="Open this resume in Overleaf"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <ExternalLink className="w-4 h-4" aria-hidden="true" />}
        Open in Overleaf
      </button>
    </div>
  )
}

// Re-exported for sites that want the icon import grouped with the rest
export { Download }

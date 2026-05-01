/**
 * MarkdownLite — minimal markdown renderer for evaluation report bodies.
 *
 * Why not react-markdown: avoids a dep + CSP risk for the narrow set of
 * patterns career-ops prompts produce. Handles:
 *   - Markdown tables (`| col | col |` with separator row `|:--|:--|`)
 *   - Bold (`**text**`)
 *   - Inline code (`` `code` ``)
 *   - Bullet lists (`- ` or `* ` at line start)
 *   - Numbered lists (`1. ` at line start)
 *   - `<br>` → line break (LLMs frequently emit this inside table cells)
 *   - Paragraphs (blank line separator)
 *
 * Anything not matched falls through as plain text. No HTML escaping is needed
 * because React renders text safely by default and we never use `dangerouslySetInnerHTML`.
 */
import React from 'react'

interface Props {
  source: string
}

interface BlockSegment {
  kind: 'table' | 'ul' | 'ol' | 'p'
  lines: string[]
}

function segment(md: string): BlockSegment[] {
  const lines = md.split('\n')
  const out: BlockSegment[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Table: starts with | and is followed by a separator row |:--|:--|
    if (
      line.trim().startsWith('|') &&
      i + 1 < lines.length &&
      /^\s*\|(\s*:?-+:?\s*\|)+\s*$/.test(lines[i + 1])
    ) {
      const tableLines: string[] = [line, lines[i + 1]]
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i += 1
      }
      out.push({ kind: 'table', lines: tableLines })
      continue
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i += 1
      }
      out.push({ kind: 'ul', lines: items })
      continue
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i += 1
      }
      out.push({ kind: 'ol', lines: items })
      continue
    }

    // Paragraph: collect until blank line
    if (line.trim().length > 0) {
      const paraLines: string[] = [line]
      i += 1
      while (i < lines.length && lines[i].trim().length > 0
             && !lines[i].trim().startsWith('|')
             && !/^\s*[-*]\s+/.test(lines[i])
             && !/^\s*\d+\.\s+/.test(lines[i])) {
        paraLines.push(lines[i])
        i += 1
      }
      out.push({ kind: 'p', lines: paraLines })
      continue
    }

    // Blank line — skip
    i += 1
  }

  return out
}

/** Render inline markdown: **bold**, `code`, <br>. */
function renderInline(text: string, key?: string | number): React.ReactNode {
  // Tokenize: split on **bold**, `code`, and <br>.
  const tokens: { kind: 'text' | 'bold' | 'code' | 'br'; value: string }[] = []
  let i = 0
  while (i < text.length) {
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2)
      if (end !== -1) {
        tokens.push({ kind: 'bold', value: text.slice(i + 2, end) })
        i = end + 2
        continue
      }
    }
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1)
      if (end !== -1) {
        tokens.push({ kind: 'code', value: text.slice(i + 1, end) })
        i = end + 1
        continue
      }
    }
    if (text.startsWith('<br>', i) || text.startsWith('<br/>', i) || text.startsWith('<br />', i)) {
      tokens.push({ kind: 'br', value: '' })
      i += text.startsWith('<br>', i) ? 4 : text.startsWith('<br/>', i) ? 5 : 6
      continue
    }
    // Accumulate one char into the trailing text token.
    const last = tokens[tokens.length - 1]
    if (last && last.kind === 'text') last.value += text[i]
    else tokens.push({ kind: 'text', value: text[i] })
    i += 1
  }

  return tokens.map((t, idx) => {
    const k = key != null ? `${key}-${idx}` : idx
    if (t.kind === 'bold') return <strong key={k} className="text-white font-semibold">{t.value}</strong>
    if (t.kind === 'code') return <code key={k} className="px-1 py-0.5 rounded bg-white/[0.06] text-[12px] font-mono text-white/90">{t.value}</code>
    if (t.kind === 'br') return <br key={k} />
    return <React.Fragment key={k}>{t.value}</React.Fragment>
  })
}

function parseTable(lines: string[]): { header: string[]; rows: string[][] } {
  const split = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
  const header = split(lines[0])
  // lines[1] is separator
  const rows = lines.slice(2).map(split)
  return { header, rows }
}

export function MarkdownLite({ source }: Props) {
  const segments = segment(source)
  return (
    <div className="space-y-3 text-[13px] text-white/85 leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.kind === 'table') {
          const { header, rows } = parseTable(seg.lines)
          return (
            <div key={i} className="overflow-x-auto -mx-1 my-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    {header.map((h, hi) => (
                      <th
                        key={hi}
                        className="border-b border-white/10 px-3 py-2 text-[12px] font-semibold text-white/70 align-top"
                      >
                        {renderInline(h, `h-${i}-${hi}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-white/[0.04] last:border-b-0">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 align-top">
                          {renderInline(cell, `c-${i}-${ri}-${ci}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        if (seg.kind === 'ul') {
          return (
            <ul key={i} className="list-disc list-outside pl-5 space-y-1.5">
              {seg.lines.map((item, li) => (
                <li key={li}>{renderInline(item, `ul-${i}-${li}`)}</li>
              ))}
            </ul>
          )
        }
        if (seg.kind === 'ol') {
          return (
            <ol key={i} className="list-decimal list-outside pl-5 space-y-1.5">
              {seg.lines.map((item, li) => (
                <li key={li}>{renderInline(item, `ol-${i}-${li}`)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i} className="whitespace-pre-wrap break-words">
            {seg.lines.map((line, li) => (
              <React.Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(line, `p-${i}-${li}`)}
              </React.Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

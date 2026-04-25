/**
 * Parser logic from BlockAccordion.tsx, extracted to a unit test.
 * Today's eval-pipeline regression (LLM emitted Spanish `## A)` headers
 * which the old regex didn't accept) would have been caught by this test.
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const BLOCK_RE =
  /(?:^|\n)#{1,3}\s*(?:Block\s+)?([A-G])\s*(?:[—\-:.\)]|\s)\s*([^\n]+)\n([\s\S]*?)(?=(?:\n#{1,3}\s*(?:Block\s+)?[A-G]\s*(?:[—\-:.\)]|\s))|---SCORE_SUMMARY---|$)/g

interface Block {
  letter: string
  heading: string
  body: string
}

function parseBlocks(md: string): Block[] {
  if (!md) return []
  const blocks: Block[] = []
  const seen = new Set<string>()
  BLOCK_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = BLOCK_RE.exec(md)) !== null) {
    const letter = m[1].toUpperCase()
    if (seen.has(letter)) continue
    seen.add(letter)
    blocks.push({ letter, heading: m[2].trim(), body: m[3].trim() })
  }
  blocks.sort((a, b) => a.letter.localeCompare(b.letter))
  return blocks
}

const FIXTURES = path.join(process.cwd(), 'tests', 'fixtures', 'eval-responses')

describe('BlockAccordion parser', () => {
  it('parses all 7 blocks from canonical "## Block A —" format', () => {
    const md = fs.readFileSync(path.join(FIXTURES, 'canonical.md'), 'utf8')
    const blocks = parseBlocks(md)
    expect(blocks.map(b => b.letter)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    expect(blocks[0].heading).toBe('Role Summary')
    expect(blocks[6].heading).toBe('Legitimacy')
  })

  it('parses all 7 blocks from "## A)" parens format (career-ops Spanish default)', () => {
    const md = fs.readFileSync(path.join(FIXTURES, 'parens-headers.md'), 'utf8')
    const blocks = parseBlocks(md)
    expect(blocks.map(b => b.letter)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
    expect(blocks.find(b => b.letter === 'D')?.body).toContain('$200-260k')
  })

  it('parses Spanish output with no canonical summary block', () => {
    const md = fs.readFileSync(path.join(FIXTURES, 'spanish-no-summary.md'), 'utf8')
    const blocks = parseBlocks(md)
    expect(blocks.map(b => b.letter)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
  })

  it('stops at ---SCORE_SUMMARY--- marker (no spillover into Block G body)', () => {
    const md = fs.readFileSync(path.join(FIXTURES, 'canonical.md'), 'utf8')
    const blockG = parseBlocks(md).find(b => b.letter === 'G')
    expect(blockG?.body).not.toContain('SCORE_SUMMARY')
    expect(blockG?.body).not.toContain('END_SUMMARY')
  })

  it('returns empty array for empty input', () => {
    expect(parseBlocks('')).toEqual([])
  })

  it('returns empty array for prose with no headers', () => {
    expect(parseBlocks('Just some prose. Nothing matches.')).toEqual([])
  })

  it('dedupes when the same letter appears twice (e.g. body false-positive)', () => {
    const md = `## A — First\nbody one\n\n## A — Second\nbody two`
    const blocks = parseBlocks(md)
    expect(blocks).toHaveLength(1)
    expect(blocks[0].heading).toBe('First')
  })
})

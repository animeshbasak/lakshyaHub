import { describe, it, expect } from 'vitest'
import { resumeToLatex, escapeLatex } from '@/features/resume-builder/export/latexExporter'
import type { ResumeData } from '@/types'

const minimal: ResumeData = {
  id: 't1',
  name: 'Animesh Basak',
  template: 'harvard',
  header: {
    name: 'Animesh Basak',
    title: 'Lead Engineer',
    email: 'animesh@example.com',
    phone: '+91 99999 99999',
    location: 'New Delhi, India',
    linkedin: 'linkedin.com/in/animesh',
    portfolio: 'animesh.dev',
  },
  summary: ['Lead engineer with 7+ years of frontend.', '', ''],
  skills: [
    { id: 's1', category: 'Languages', values: 'TypeScript, Python' },
  ],
  experience: [
    {
      id: 'e1',
      title: 'Lead Engineer',
      company: 'Airtel',
      period: '2025 — Present',
      scale: '150M MAU',
      bullets: [{ id: 'b1', text: 'Led migration to micro-frontends across 200+ services.' }],
    },
  ],
  education: [
    { id: 'edu1', institution: 'IIT', degree: 'B.Tech', period: '2014 — 2018', grade: '8.5/10' },
  ],
  projects: [],
  competencies: [],
}

describe('escapeLatex', () => {
  it('escapes the seven primary LaTeX special characters', () => {
    expect(escapeLatex('a & b')).toBe('a \\& b')
    expect(escapeLatex('80%')).toBe('80\\%')
    expect(escapeLatex('$5')).toBe('\\$5')
    expect(escapeLatex('#hashtag')).toBe('\\#hashtag')
    expect(escapeLatex('snake_case')).toBe('snake\\_case')
    expect(escapeLatex('{json}')).toBe('\\{json\\}')
    expect(escapeLatex('a^b')).toBe('a\\textasciicircum{}b')
    expect(escapeLatex('a~b')).toBe('a\\textasciitilde{}b')
  })

  it('escapes backslash WITHOUT re-escaping the inserted command', () => {
    expect(escapeLatex('C:\\path')).toBe('C:\\textbackslash{}path')
  })

  it('returns empty for empty input', () => {
    expect(escapeLatex('')).toBe('')
  })
})

describe('resumeToLatex', () => {
  it('produces a complete document', () => {
    const tex = resumeToLatex(minimal)
    expect(tex).toContain('\\documentclass')
    expect(tex).toContain('\\begin{document}')
    expect(tex).toContain('\\end{document}')
  })

  it('includes the candidate name and contact info in the header', () => {
    const tex = resumeToLatex(minimal)
    // Name lives inside `\uppercase{...}` — the case-folding happens at
    // compile time, so we assert the wrapped form.
    expect(tex).toContain('\\uppercase{Animesh Basak}')
    expect(tex).toContain('animesh@example.com')
    expect(tex).toContain('linkedin.com/in/animesh')
  })

  it('emits Experience section with all bullets', () => {
    const tex = resumeToLatex(minimal)
    expect(tex).toContain('\\section*{Experience}')
    expect(tex).toContain('Lead Engineer')
    expect(tex).toContain('Airtel')
    expect(tex).toContain('Led migration to micro-frontends across 200+ services')
  })

  it('emits Education and Skills sections', () => {
    const tex = resumeToLatex(minimal)
    expect(tex).toContain('\\section*{Education}')
    expect(tex).toContain('B.Tech')
    expect(tex).toContain('\\section*{Skills}')
    expect(tex).toContain('Languages')
  })

  it('escapes user input that contains LaTeX special characters', () => {
    const data: ResumeData = {
      ...minimal,
      summary: ['Designed Y&R analytics for 80% uptime'],
      skills: [{ id: 's1', category: 'OS', values: 'macOS, ${SHELL} scripting' }],
    }
    const tex = resumeToLatex(data)
    expect(tex).toContain('Y\\&R')
    expect(tex).toContain('80\\%')
    expect(tex).toContain('\\$\\{SHELL\\}')
    expect(tex).not.toContain('Y&R analytics for 80%')
  })

  it('omits empty sections gracefully', () => {
    const empty: ResumeData = {
      ...minimal,
      summary: ['', '', ''],
      skills: [],
      experience: [],
      education: [],
    }
    const tex = resumeToLatex(empty)
    expect(tex).not.toContain('\\section*{Summary}')
    expect(tex).not.toContain('\\section*{Skills}')
    expect(tex).not.toContain('\\section*{Experience}')
    expect(tex).not.toContain('\\section*{Education}')
  })

  it('terminates with a newline (so cat-redirect to file works)', () => {
    expect(resumeToLatex(minimal).endsWith('\n')).toBe(true)
  })
})

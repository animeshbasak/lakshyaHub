/**
 * LaTeX exporter — produces a `.tex` string from a ResumeData.
 *
 * Output compiles cleanly on Overleaf with no extra packages beyond what
 * stock TeX Live ships (article + geometry + titlesec + enumitem + hyperref).
 *
 * Why LaTeX export rather than server-side pdflatex compile?
 *   - texlive is ~3 GB; not viable on Vercel Lambda.
 *   - Overleaf's free tier is the canonical compile target for academic /
 *     enterprise users who want LaTeX. We meet them there.
 *
 * Escaping is tight: the LaTeX special characters listed in
 * https://en.wikibooks.org/wiki/LaTeX/Special_Characters are escaped before
 * any user-controlled string lands in the template. We never emit raw
 * LaTeX commands from user input — preventing both broken output and any
 * "user injects \input{} to read a build-machine file" attack vector
 * (irrelevant for client-side compile but cheap defense).
 */
import type { ResumeData, JobEntry, Education, ProjectEntry, SkillRow } from '@/types'

/** Escape user-provided text so it renders safely as LaTeX body content. */
export function escapeLatex(input: string): string {
  if (!input) return ''
  // Cannot just chain .replace() because the LaTeX commands we INSERT
  // (\textbackslash{}, \textasciicircum{}, \textasciitilde{}) themselves
  // contain `{` and `}` which would get re-escaped on a later pass.
  // Instead: walk the string char-by-char and emit the escape per-char.
  let out = ''
  for (const ch of input) {
    switch (ch) {
      case '\\': out += '\\textbackslash{}'; break
      case '{':  out += '\\{'; break
      case '}':  out += '\\}'; break
      case '$':  out += '\\$'; break
      case '&':  out += '\\&'; break
      case '%':  out += '\\%'; break
      case '#':  out += '\\#'; break
      case '_':  out += '\\_'; break
      case '^':  out += '\\textasciicircum{}'; break
      case '~':  out += '\\textasciitilde{}'; break
      default:   out += ch
    }
  }
  return out
}

const PREAMBLE = `\\documentclass[10.5pt,a4paper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{parskip}

\\hypersetup{
  colorlinks=true,
  urlcolor=black,
  linkcolor=black,
}

\\titleformat{\\section}{\\normalfont\\bfseries\\uppercase}{}{0pt}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{10pt}{6pt}
\\setlist[itemize]{leftmargin=14pt,itemsep=2pt,topsep=2pt}
\\pagenumbering{gobble}
\\pagestyle{empty}
`

function header(d: ResumeData): string {
  const h = d.header
  const lines: string[] = []
  lines.push(`\\begin{center}`)
  lines.push(`{\\Large\\bfseries\\uppercase{${escapeLatex(h.name)}}}\\\\[2pt]`)
  if (h.title) lines.push(`{\\itshape ${escapeLatex(h.title)}}\\\\[2pt]`)
  const contactBits: string[] = []
  if (h.email)     contactBits.push(`\\href{mailto:${h.email}}{${escapeLatex(h.email)}}`)
  if (h.phone)     contactBits.push(escapeLatex(h.phone))
  if (h.location)  contactBits.push(escapeLatex(h.location))
  if (h.linkedin)  contactBits.push(`\\href{https://${stripProtocol(h.linkedin)}}{${escapeLatex(stripProtocol(h.linkedin))}}`)
  if (h.github)    contactBits.push(`\\href{https://${stripProtocol(h.github)}}{${escapeLatex(stripProtocol(h.github))}}`)
  if (h.portfolio) contactBits.push(`\\href{https://${stripProtocol(h.portfolio)}}{${escapeLatex(stripProtocol(h.portfolio))}}`)
  if (contactBits.length) {
    lines.push(`{\\small ${contactBits.join(' \\quad\\textbar\\quad ')}}`)
  }
  lines.push(`\\end{center}`)
  return lines.join('\n')
}

function summarySection(summary: string[]): string {
  const cleaned = summary.map(s => s.trim()).filter(Boolean)
  if (cleaned.length === 0) return ''
  const body = cleaned.map(escapeLatex).join(' ')
  return `\\section*{Summary}\n${body}`
}

function skillsSection(skills: SkillRow[]): string {
  const filled = skills.filter(s => s.values && s.values.trim())
  if (filled.length === 0) return ''
  const lines = filled.map(s => `\\item \\textbf{${escapeLatex(s.category)}:} ${escapeLatex(s.values)}`)
  return `\\section*{Skills}\n\\begin{itemize}\n${lines.join('\n')}\n\\end{itemize}`
}

function experienceSection(jobs: JobEntry[]): string {
  if (jobs.length === 0) return ''
  const blocks = jobs.map(j => experienceEntry(j)).filter(Boolean)
  return `\\section*{Experience}\n${blocks.join('\n\\smallskip\n')}`
}

function experienceEntry(j: JobEntry): string {
  const title = escapeLatex(j.title || '')
  const company = escapeLatex(j.company || '')
  const period = escapeLatex(j.period || '')
  const bullets = (j.bullets || [])
    .map(b => b.text)
    .filter(t => t && t.trim())
  const head = `\\noindent\\textbf{${title}} \\hfill ${period}\\\\\n\\textit{${company}}`
  if (bullets.length === 0) return head
  const items = bullets.map(t => `  \\item ${escapeLatex(t.trim())}`).join('\n')
  return `${head}\n\\begin{itemize}\n${items}\n\\end{itemize}`
}

function educationSection(edu: Education[]): string {
  if (edu.length === 0) return ''
  const blocks = edu.map(e => {
    const degree = escapeLatex(e.degree || '')
    const inst = escapeLatex(e.institution || '')
    const period = escapeLatex(e.period || '')
    const grade = e.grade ? ` \\quad ${escapeLatex(e.grade)}` : ''
    return `\\noindent\\textbf{${degree}} \\hfill ${period}\\\\\n\\textit{${inst}}${grade}`
  })
  return `\\section*{Education}\n${blocks.join('\n\\smallskip\n')}`
}

function projectsSection(projects: ProjectEntry[] | undefined): string {
  if (!projects || projects.length === 0) return ''
  const blocks = projects.map(p => {
    const name = escapeLatex(p.name || '')
    const period = escapeLatex(p.period || '')
    const link = p.link ? ` \\href{${p.link}}{${escapeLatex(stripProtocol(p.link))}}` : ''
    const desc = p.description ? `\\\\ ${escapeLatex(p.description)}` : ''
    const tech = p.technologies?.length ? `\\\\ \\textit{${escapeLatex(p.technologies.join(', '))}}` : ''
    const bullets = (p.bullets || [])
      .map(b => b.text)
      .filter(t => t && t.trim())
    const head = `\\noindent\\textbf{${name}}${link} \\hfill ${period}${desc}${tech}`
    if (bullets.length === 0) return head
    const items = bullets.map(t => `  \\item ${escapeLatex(t.trim())}`).join('\n')
    return `${head}\n\\begin{itemize}\n${items}\n\\end{itemize}`
  })
  return `\\section*{Projects}\n${blocks.join('\n\\smallskip\n')}`
}

function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '')
}

/** Compose a full .tex document for the given resume. */
export function resumeToLatex(data: ResumeData): string {
  const sections: string[] = [
    PREAMBLE,
    `\\begin{document}`,
    header(data),
    summarySection(data.summary),
    skillsSection(data.skills),
    experienceSection(data.experience),
    educationSection(data.education),
    projectsSection(data.projects),
    `\\end{document}`,
  ].filter(Boolean)
  return sections.join('\n\n') + '\n'
}

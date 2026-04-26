#!/usr/bin/env node
/**
 * End-to-end smoke test: feed a real JD + resume into the eval pipeline
 * the same way `/api/ai/evaluate` does, then inspect what BOTH the strict
 * persistence parser and the lenient render-time parser produce.
 *
 * Run from repo root: `npx tsx scripts/smoke-eval-parse.mjs`
 *
 * Requires GROQ_API_KEY in .env.local (already set if eval works in dev).
 * Cost: ~$0 on Groq's free tier.
 */
import fs from 'node:fs'
import { composePrompt } from '../src/lib/careerops/promptLoader.ts'
import { parseScoreSummary, parseEvalDisplay } from '../src/lib/careerops/parseScoreSummary.ts'

// Tiny .env.local loader (avoids the dotenv dep)
try {
  const env = fs.readFileSync('.env.local', 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.+?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch { /* missing .env.local is fine if shell already has the vars */ }

const GROQ_KEY = process.env.GROQ_API_KEY
if (!GROQ_KEY) {
  console.error('GROQ_API_KEY missing — set in .env.local first.')
  process.exit(1)
}

const SPRINKLR_JD = `About the job
Sprinklr is the definitive, AI-native platform for Unified Customer Experience Management (Unified-CXM), empowering brands to deliver extraordinary experiences at scale — across every customer touchpoint.

What You'll Do

Cross-Functional Collaboration:
- Work closely with product managers, UX designers, and backend engineers to ensure seamless integration of features.
- Translate business requirements into clear technical tasks.

Technical Excellence:
- Drive architectural decisions, promote modern best practices, and ensure long-term viability.
- Architect next-generation frontend applications and micro-frontends.

Performance Optimization:
- Continuously monitor application performance across various devices and browsers.
- Profile and debug performance bottlenecks, ensuring optimal load times.

Outbound Evangelism:
- Represent the team at conferences and technical meetups.
- Write and publish technical blog posts.

What Makes You Qualified
- BE/BTech in software engineering, computer science, or related field.
- 3+ years of professional software engineering experience focused on web technologies focusing on React.

Technical Skills:
- Front-End Architecture: advanced JavaScript, TypeScript, Webpack, React.
- CSS Expertise: SCSS, CSS Modules, CSS-in-JS (Styled Components, Emotion).
- Frontend Performance Optimization: React Profiler, Lighthouse, Webpack Bundle Analyzer.
- Micro Frontend Architecture: Next.js for SSR/SSG.
- CI/CD: Jenkins, GitHub Actions, CircleCI.
- Cloud & Containerization: Docker, Kubernetes, AWS/Azure/GCP.

Soft Skills:
- Past Experience speaking at conferences, contributing to open-source projects, or writing technical content.`

const ANIMESH_CV = `Animesh Basak
Frontend Engineering Lead | React | AI Systems
New Delhi, India | +91-9971340719 | animeshsbasak@gmail.com
linkedin.com/in/animeshbasak

PROFESSIONAL SUMMARY
Frontend Engineering Lead with 7+ years architecting consumer platforms at 150M+ MAU, currently leading frontend for Airtel Thanks App. Owns system design, release quality, and cross-team delivery across React and TypeScript; hands-on builder of AI-native products using LLM orchestration, RAG, and model routing. Deep expertise in SSR, Core Web Vitals, and technical leadership at scale.

SKILLS
Languages: JavaScript, TypeScript, Python, HTML5, CSS3
Frontend: React, Next.js, Angular, Tailwind CSS, Zustand, shadcn/ui, Framer Motion
Performance & Architecture: SSR, Core Web Vitals, Micro-frontends, Design Systems, BFF, Bundle Optimization
Testing & DevOps: Vitest, Jest, React Testing Library, Sentry, GitHub Actions, Jenkins, Docker, Vercel
Backend: Node.js, Express, Spring Boot, REST APIs, Supabase, PostgreSQL
AI and LLM: Claude, Gemini, OpenAI, Groq, Ollama, RAG, LangChain, LlamaIndex, Model Routing

WORK EXPERIENCE
Lead Engineer, Full Stack | Airtel Digital Ltd. | June 2025 – Present
- Lead a squad of 5 to 7 engineers owning architecture across prepaid and postpaid acquisition journeys on Airtel Thanks App at 150M+ MAU scale.
- Serve as final review gate before production merge.
- Scaled React and TypeScript architecture across Airtel One, Black, prepaid, postpaid, SKYC flows.
- Authored HLD and LLD with architect sign-off; own GrowthBook experimentation, Superset V2L dashboards, Jenkins CI/CD.

Senior Software Engineer II, Frontend | MakeMyTrip India | July 2024 – May 2025
- Improved Lighthouse scores from 6 to 8-9 through SSR tuning, LCP optimization, on hotels booking PWA serving 5M+ monthly sessions.
- Resolved a systemic defect generating 1,000+ Sentry errors within 48 hours.
- Built reusable component architecture reducing onboarding time by 30% with 90%+ test coverage.

Software Engineer | Paytm | October 2021 – June 2024
- Led migration from legacy merchant workflows to modern React architecture; improved Lighthouse scores from 6 to 8-9 across 3M+ active merchants.
- Optimized Soundbox checkout contributing to 40% increase in EDC device sales.

Frontend Developer | Sparklin Innovations (ICICI Bank Nirvana) | Jan 2021 – Oct 2021
Systems Engineer | Infosys (ANZ Bank, FINACLE) | Dec 2018 – Jan 2021

PROJECTS
Lakshya Hub, AI Job Search OS | Next.js, TypeScript, Supabase, Groq, Gemini | 2025 – Present
- Unified AI job-search platform combining resume builder, Kanban pipeline, job intelligence; multi-model AI routing across Gemini/Groq/OpenRouter with 10 ATS templates, 98-test Vitest suite at 90%+ coverage.

EDUCATION
B.Tech, Computer Science and Engineering | Inderprastha Engineering College | 2014–2018 | 75.4%`

console.log('=== Step 1: composePrompt with mode=oferta ===')
const prompt = await composePrompt({
  mode: 'oferta',
  userProfile: 'Frontend lead, 7y React/TS, performance, AI platform builder.',
  cvMarkdown: ANIMESH_CV,
  jdText: SPRINKLR_JD,
})
console.log(`prompt length: ${prompt.length} chars`)

console.log('\n=== Step 2: call Groq llama-3.3-70b-versatile ===')
const start = Date.now()
const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GROQ_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  }),
})

if (!res.ok) {
  console.error(`Groq returned ${res.status}: ${await res.text()}`)
  process.exit(1)
}

const json = await res.json()
const report = json.choices?.[0]?.message?.content ?? ''
const elapsed = ((Date.now() - start) / 1000).toFixed(1)
console.log(`Groq returned ${report.length} chars in ${elapsed}s`)

console.log('\n=== Step 3: strict parser (what gets persisted to DB) ===')
const strict = parseScoreSummary(report)
console.log(strict)

console.log('\n=== Step 4: lenient parser (render-time fallback) ===')
const lenient = parseEvalDisplay(report)
console.log(lenient)

console.log('\n=== Step 5: report tail (last 800 chars to inspect summary block) ===')
console.log(report.slice(-800))

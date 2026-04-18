/* ───────── Sample data — realistic, varied ───────── */

const SAMPLE_JOBS = [
  { id: "j1", title: "Staff Frontend Engineer", company: "Linear", location: "Remote · Global", source: "Greenhouse", salary: "$180k–$230k", posted: "2d", fit: 92, grade: "A", desc: "Own the architecture of Linear's web client. Shape how millions of teams plan and ship software.", skills: ["React", "TypeScript", "GraphQL", "Performance"], status: "saved" },
  { id: "j2", title: "Senior Software Engineer, Product", company: "Vercel", location: "Remote · US/EU", source: "Lever", salary: "$190k–$240k", posted: "4h", fit: 88, grade: "A", desc: "Build the Vercel dashboard — deployments, analytics, and collaboration for the world's best developers.", skills: ["Next.js", "React", "TypeScript"], status: "applied" },
  { id: "j3", title: "Lead Frontend Engineer", company: "Anthropic", location: "San Francisco, CA", source: "Greenhouse", salary: "$220k–$280k", posted: "1d", fit: 85, grade: "B", desc: "Lead the design and implementation of Claude's interfaces — web, mobile, and partner surfaces.", skills: ["React", "TypeScript", "Design systems"], status: "interview" },
  { id: "j4", title: "Principal Engineer, Web Platform", company: "Figma", location: "San Francisco, CA", source: "Greenhouse", salary: "$260k–$340k", posted: "6h", fit: 81, grade: "B", desc: "Own the web platform infrastructure that powers Figma's multiplayer editor.", skills: ["WebGL", "TypeScript", "Perf"], status: "saved" },
  { id: "j5", title: "Senior Frontend Engineer", company: "Notion", location: "Remote · Americas", source: "Lever", salary: "$170k–$215k", posted: "3d", fit: 78, grade: "B", desc: "Ship features used by 30M+ people. Blocks, collaboration, AI integration across every surface.", skills: ["React", "TypeScript", "Collab"], status: "applied" },
  { id: "j6", title: "Staff Engineer — Developer Tools", company: "Stripe", location: "Bangalore, IN", source: "LinkedIn", salary: "₹90L–₹130L", posted: "1w", fit: 74, grade: "C", desc: "Design and build developer-facing tools for the Stripe API. SDKs, docs, CLI.", skills: ["TypeScript", "Go", "APIs"], status: "offer" },
  { id: "j7", title: "Frontend Engineer II", company: "Retool", location: "Remote · EU", source: "Greenhouse", salary: "$160k–$200k", posted: "12h", fit: 72, grade: "C", desc: "Build the visual editor used by teams at Amazon, DoorDash, NBC to ship internal tools 10× faster.", skills: ["React", "Monaco"], status: "saved" },
  { id: "j8", title: "Software Engineer — AI", company: "OpenAI", location: "San Francisco, CA", source: "Greenhouse", salary: "$250k–$400k", posted: "2d", fit: 68, grade: "C", desc: "Work on ChatGPT and API surfaces. Close loop between research and product.", skills: ["Python", "React"], status: "rejected" },
  { id: "j9", title: "Senior React Developer", company: "JPMorgan Chase", location: "Bangalore, IN", source: "LinkedIn", salary: "₹45L–₹70L", posted: "5d", fit: 65, grade: "D", desc: "Build next-gen banking experiences. Modernize legacy codebases onto React + TypeScript.", skills: ["React", "Redux"], status: "saved" },
  { id: "j10", title: "Full-Stack Engineer", company: "Hirenza", location: "Gurugram, IN", source: "Naukri", salary: "₹18L–₹28L", posted: "3w", fit: 42, grade: "F", desc: "Small startup looking for a generalist. Full remote, flexible hours.", skills: ["Node.js", "React"], status: "saved" },
  { id: "j11", title: "Engineering Manager, Growth", company: "Airtable", location: "Remote · US", source: "Lever", salary: "$230k–$280k", posted: "8h", fit: 70, grade: "C", desc: "Lead a team of 6 on the growth surface — onboarding, activation, conversion.", skills: ["Leadership"], status: "applied" },
  { id: "j12", title: "Software Engineer, Platform", company: "Zapier", location: "Remote · Worldwide", source: "Greenhouse", salary: "$170k–$210k", posted: "1d", fit: 76, grade: "B", desc: "Fully async. Build the automation engine that connects 6,000+ apps.", skills: ["Python", "TypeScript"], status: "interview" },
];

const PIPELINE_COLUMNS = [
  { id: "saved",     label: "Saved",        color: "cyan",    accent: "#22d3ee" },
  { id: "applied",   label: "Applied",      color: "purple",  accent: "#a855f7" },
  { id: "interview", label: "Interviewing", color: "amber",   accent: "#fbbf24" },
  { id: "offer",     label: "Offered",      color: "emerald", accent: "#34d399" },
  { id: "rejected",  label: "Rejected",     color: "red",     accent: "#f87171" },
];

const RECENT_ACTIVITY = [
  { type: "status",   title: "Staff Engineer — Developer Tools", company: "Stripe",  from: "interview", to: "offer",  when: "just now" },
  { type: "added",    title: "Software Engineer, Platform",     company: "Zapier",   status: "interview", when: "2h ago" },
  { type: "applied",  title: "Lead Frontend Engineer",           company: "Anthropic",status: "interview", when: "yesterday" },
  { type: "resume",   title: "ATS score improved",              detail: "67 → 82 after AI rewrite", when: "yesterday" },
  { type: "status",   title: "Software Engineer — AI",           company: "OpenAI",   from: "applied",   to: "rejected",when: "2d ago" },
];

const SOURCES = [
  { id: "linkedin",   label: "LinkedIn",     count: "2.1M",  enabled: true  },
  { id: "naukri",     label: "Naukri",       count: "840k",  enabled: true  },
  { id: "indeed",     label: "Indeed",       count: "1.4M",  enabled: true  },
  { id: "glassdoor",  label: "Glassdoor",    count: "620k",  enabled: false },
  { id: "greenhouse", label: "Greenhouse",   count: "direct",enabled: true  },
  { id: "lever",      label: "Lever",        count: "direct",enabled: true  },
  { id: "remoteok",   label: "RemoteOK",     count: "direct",enabled: true  },
];

const RESUME_TEMPLATES = [
  { id: "minimal",  label: "Minimal",  hint: "Single-column, tight spacing" },
  { id: "modern",   label: "Modern",   hint: "Sidebar accent, generous type" },
  { id: "harvard",  label: "Harvard",  hint: "Classic two-column academic" },
  { id: "faang",    label: "FAANG",    hint: "Tight, quantified, results-first" },
  { id: "executive",label: "Executive",hint: "Summary-led, leadership emphasis" },
  { id: "creative", label: "Creative", hint: "Accent color, portfolio-friendly" },
  { id: "classic",  label: "Classic",  hint: "Serif, traditional layout" },
];

const LOG_SAMPLES = [
  { lvl: "info",    t: "14:22:04", msg: "Starting search for \"Frontend Engineer\" in \"Remote · India\"" },
  { lvl: "info",    t: "14:22:04", msg: "Sources: LinkedIn, Naukri, Indeed, Greenhouse, Lever, RemoteOK" },
  { lvl: "info",    t: "14:22:05", msg: "Spawning 6 actors in parallel..." },
  { lvl: "success", t: "14:22:11", msg: "✓ Greenhouse: 47 jobs from 12 companies" },
  { lvl: "success", t: "14:22:14", msg: "✓ Lever: 38 jobs from 9 companies" },
  { lvl: "success", t: "14:22:17", msg: "✓ RemoteOK: 22 jobs" },
  { lvl: "warn",    t: "14:22:19", msg: "⚠ LinkedIn: rate limited after 18 jobs (retry in 60s)" },
  { lvl: "success", t: "14:22:24", msg: "✓ Naukri: 31 jobs" },
  { lvl: "error",   t: "14:22:28", msg: "✗ Indeed: authentication failed — check API keys" },
  { lvl: "info",    t: "14:22:30", msg: "Deduplicating by (title + company)..." },
  { lvl: "info",    t: "14:22:31", msg: "Computing fit scores against your resume..." },
  { lvl: "success", t: "14:22:36", msg: "Found 118 unique jobs · 42 strong fits (≥80)" },
];

const PROFILE = {
  name: "Animesh Basak",
  email: "animeshbasak@gmail.com",
  initials: "AB",
  titles: ["Lead Frontend Engineer", "Senior Frontend Engineer", "Staff Engineer", "Technical Lead"],
  skills: ["React", "TypeScript", "Next.js", "Node.js", "GraphQL", "Performance", "SSR", "Design Systems", "WebGL", "Testing", "CI/CD", "Docker", "AWS"],
  locations: ["Bangalore", "Hyderabad", "Remote · India", "Delhi NCR", "Remote · Global"],
  years: "5–10",
};

const ATS = {
  overall: 82,
  grade: "B+",
  breakdown: [
    { k: "Keywords",   v: 88, max: 100, detail: "Strong match for React, TypeScript, Performance" },
    { k: "Structure",  v: 74, max: 100, detail: "Consider reordering Education below Experience" },
    { k: "Impact",     v: 85, max: 100, detail: "7 of 12 bullets have quantified metrics" },
    { k: "Length",     v: 90, max: 100, detail: "1.2 pages — well within target for senior roles" },
    { k: "Formatting", v: 72, max: 100, detail: "Avoid tables; ATS parsers struggle with them" },
  ],
  improvements: [
    "Add a 'Technologies' line to your latest role",
    "Quantify the top bullet in your Lakshya role (% or $)",
    "Replace 'worked on' with a stronger action verb in 3 places",
    "Tighten summary to 2 lines — currently 4",
  ],
};

window.SAMPLE_JOBS = SAMPLE_JOBS;
window.PIPELINE_COLUMNS = PIPELINE_COLUMNS;
window.RECENT_ACTIVITY = RECENT_ACTIVITY;
window.SOURCES = SOURCES;
window.RESUME_TEMPLATES = RESUME_TEMPLATES;
window.LOG_SAMPLES = LOG_SAMPLES;
window.PROFILE = PROFILE;
window.ATS = ATS;

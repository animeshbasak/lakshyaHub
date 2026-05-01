(function(){
/* ───────── Resume Hub ───────── */
var Icon = window.Icon;

function PageResume() {
  const [tpl, setTpl] = React.useState("modern");
  const [tab, setTab] = React.useState("ats");
  const [section, setSection] = React.useState("experience");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr 340px", height: "calc(100vh - var(--topbar-h))", overflow: "hidden" }}>
      {/* Left: Form editor */}
      <div style={{ borderRight: "1px solid var(--hair)", overflow: "auto", padding: "16px 18px", background: "var(--bg-1)" }}>
        {/* Title + toolbar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <input defaultValue="India Frontend Engineer · Lead" style={{
              background: "transparent", border: "none", outline: "none",
              fontSize: 14, fontWeight: 600, padding: 0, flex: 1,
            }} />
            <span className="badge emerald" style={{ fontSize: 9 }}><span className="dot" /> Auto-saved</span>
          </div>
          <p className="text-3" style={{ fontSize: 11.5, margin: 0 }}>Last edit 3s ago · version 14</p>
        </div>

        {/* Section nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 14, flexWrap: "wrap" }}>
          {[
            { id: "contact", l: "Contact", i: Icon.User },
            { id: "summary", l: "Summary", i: Icon.Edit },
            { id: "experience", l: "Experience", i: Icon.Briefcase },
            { id: "education", l: "Education", i: Icon.Book },
            { id: "skills", l: "Skills", i: Icon.Zap },
          ].map(s => {
            const IconC = s.i;
            return (
              <button key={s.id} onClick={() => setSection(s.id)} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 9px",
                fontSize: 11.5,
                borderRadius: 6,
                color: section === s.id ? "var(--cyan)" : "var(--fg-3)",
                background: section === s.id ? "var(--cyan-dim)" : "transparent",
                border: section === s.id ? "1px solid rgba(34,211,238,0.25)" : "1px solid transparent",
              }}><IconC size={11} /> {s.l}</button>
            );
          })}
        </div>

        {section === "contact" && <ContactForm />}
        {section === "summary" && <SummaryForm />}
        {section === "experience" && <ExperienceForm />}
        {section === "education" && <EducationForm />}
        {section === "skills" && <SkillsForm />}
      </div>

      {/* Center: Preview */}
      <div style={{ overflow: "auto", background: "var(--bg)", padding: "22px 20px" }}>
        {/* Preview toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, maxWidth: 720, margin: "0 auto 14px" }}>
          <div style={{ display: "flex", gap: 2, padding: 2, background: "var(--bg-2)", border: "1px solid var(--hair)", borderRadius: 8, overflowX: "auto", maxWidth: "100%" }}>
            {window.RESUME_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTpl(t.id)} style={{
                height: 26, padding: "0 10px", fontSize: 11,
                color: tpl === t.id ? "var(--fg)" : "var(--fg-3)",
                background: tpl === t.id ? "var(--bg-3)" : "transparent",
                borderRadius: 5,
                whiteSpace: "nowrap",
                fontWeight: tpl === t.id ? 500 : 400,
              }}>{t.label}</button>
            ))}
          </div>
          <span style={{ flex: 1 }} />
          <button className="btn sm"><Icon.Upload size={11} /> Import</button>
          <button className="btn sm"><Icon.Down size={11} /> PDF</button>
        </div>

        <ResumePreview tpl={tpl} />
      </div>

      {/* Right: AI Panel */}
      <div style={{ borderLeft: "1px solid var(--hair)", overflow: "auto", padding: 0, background: "var(--bg-1)" }}>
        <div style={{ display: "flex", padding: "10px 10px 0", gap: 2, borderBottom: "1px solid var(--hair)" }}>
          {[
            { id: "ats", l: "ATS Score" },
            { id: "rewrite", l: "AI Rewrite" },
            { id: "jd", l: "JD Match" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "8px 12px",
              fontSize: 12,
              color: tab === t.id ? "var(--fg)" : "var(--fg-3)",
              borderBottom: tab === t.id ? "2px solid var(--cyan)" : "2px solid transparent",
              marginBottom: -1,
              fontWeight: tab === t.id ? 500 : 400,
            }}>{t.l}</button>
          ))}
        </div>
        <div style={{ padding: "16px 16px 40px" }}>
          {tab === "ats" && <ATSPanel />}
          {tab === "rewrite" && <RewritePanel />}
          {tab === "jd" && <JDMatchPanel />}
        </div>
      </div>
    </div>
  );
}

/* ── Forms ── */
function FormGroup({ label, children }) {
  return <div style={{ marginBottom: 10 }}>
    <div className="eyebrow" style={{ marginBottom: 5, fontSize: 9.5 }}>{label}</div>
    {children}
  </div>;
}
function ContactForm() {
  return <div className="card card-pad">
    <FormGroup label="Full name"><input className="input" defaultValue="Animesh Basak" /></FormGroup>
    <FormGroup label="Title"><input className="input" defaultValue="Lead Frontend Engineer · React · TypeScript" /></FormGroup>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <FormGroup label="Email"><input className="input" defaultValue="animeshbasak@gmail.com" /></FormGroup>
      <FormGroup label="Phone"><input className="input" defaultValue="+91 99713 40719" /></FormGroup>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <FormGroup label="Location"><input className="input" defaultValue="Bangalore, KA" /></FormGroup>
      <FormGroup label="LinkedIn"><input className="input" defaultValue="linkedin.com/in/animeshbasak" /></FormGroup>
    </div>
    <FormGroup label="Portfolio"><input className="input" defaultValue="animeshbasak.vercel.app" /></FormGroup>
  </div>;
}
function SummaryForm() {
  return <div className="card card-pad">
    <FormGroup label="Professional summary">
      <textarea className="textarea" style={{ minHeight: 140 }} defaultValue="Lead Frontend Engineer with 7+ years building scalable, high-traffic consumer platforms serving 150M+ MAU. Reduced TTI by 62% at Airtel Digital through aggressive code splitting and edge caching. Shipped design systems adopted by 40+ product teams." />
    </FormGroup>
  </div>;
}
function ExperienceForm() {
  return <div>
    <ExperienceItem role="Lead Engineer — Full Stack" company="Airtel Digital Ltd." date="Jul 2024 — Present" open={true} />
    <ExperienceItem role="Senior Software Engineer II — Frontend" company="MakeMyTrip India Pvt. Ltd." date="Jul 2022 — May 2024" open={false} />
    <ExperienceItem role="Software Engineer" company="Greyb Communications Ltd." date="Oct 2021 — Jun 2022" open={false} />
    <button className="btn sm" style={{ width: "100%", marginTop: 4 }}>
      <Icon.Plus size={11} /> Add role
    </button>
  </div>;
}
function ExperienceItem({ role, company, date, open }) {
  const [expanded, setExpanded] = React.useState(open);
  return <div className="card" style={{ padding: expanded ? 14 : "10px 12px", marginBottom: 8 }}>
    <button onClick={() => setExpanded(!expanded)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, textAlign: "left" }}>
      <Icon.ChevR size={12} style={{ color: "var(--fg-3)", transform: expanded ? "rotate(90deg)" : "", transition: "transform 0.15s" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{role}</div>
        <div className="text-4" style={{ fontSize: 11, marginTop: 1 }}>{company} · <span className="mono">{date}</span></div>
      </div>
      <Icon.Grip size={12} style={{ color: "var(--fg-4)" }} />
    </button>
    {expanded && <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
      <BulletRow text="Led performance rewrite cutting TTI by 62% across 14 consumer surfaces." />
      <BulletRow text="Shipped design system adopted by 40+ product teams; 10k+ Figma downloads." />
      <BulletRow text="Mentored 6 engineers to senior level; owned quarterly design review cadence." aiSuggest />
      <button className="btn sm ghost" style={{ alignSelf: "flex-start", color: "var(--fg-3)" }}>
        <Icon.Plus size={11} /> Add bullet
      </button>
    </div>}
  </div>;
}
function BulletRow({ text, aiSuggest }) {
  return <div style={{
    display: "flex", gap: 8,
    padding: "8px 10px",
    background: "var(--bg-2)",
    border: "1px solid var(--hair)",
    borderRadius: 7,
    fontSize: 12,
    lineHeight: 1.45,
  }}>
    <span style={{ color: "var(--fg-4)", flexShrink: 0 }}>•</span>
    <span style={{ flex: 1, color: "var(--fg-2)" }}>{text}</span>
    {aiSuggest && <button className="btn icon sm" style={{ width: 22, height: 22, color: "var(--purple)" }} title="AI suggest"><Icon.Sparkle size={11} /></button>}
  </div>;
}
function EducationForm() {
  return <div className="card card-pad">
    <FormGroup label="Institution"><input className="input" defaultValue="IBM Coursera · AI Engineering" /></FormGroup>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <FormGroup label="Degree"><input className="input" defaultValue="Professional Certificate" /></FormGroup>
      <FormGroup label="Year"><input className="input" defaultValue="2023" /></FormGroup>
    </div>
  </div>;
}
function SkillsForm() {
  return <div className="card card-pad">
    <FormGroup label="Skills">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: 8, border: "1px solid var(--hair)", background: "var(--bg-inset)", borderRadius: 8 }}>
        {window.PROFILE.skills.slice(0, 10).map(s => (
          <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px 3px 9px", fontSize: 11, background: "var(--bg-3)", borderRadius: 5, color: "var(--fg-2)" }}>
            {s}
            <Icon.X size={10} style={{ color: "var(--fg-4)", cursor: "pointer" }} />
          </span>
        ))}
        <input placeholder="+ add skill" style={{ background: "transparent", border: "none", outline: "none", fontSize: 11, color: "var(--fg)", minWidth: 80, padding: "3px 4px" }} />
      </div>
    </FormGroup>
  </div>;
}

/* ── Preview ── */
function ResumePreview({ tpl }) {
  const accent = tpl === "faang" ? "var(--cyan)" : tpl === "modern" ? "var(--purple)" : tpl === "creative" ? "var(--emerald)" : "var(--fg)";
  return <div style={{
    maxWidth: 720,
    margin: "0 auto",
    background: "#fafaf7",
    color: "#18181b",
    borderRadius: 10,
    padding: "44px 52px",
    fontFamily: tpl === "classic" || tpl === "harvard" ? "Georgia, serif" : "var(--font-sans)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    minHeight: "95%",
  }}>
    <div style={{ borderBottom: `2px solid ${accent === "var(--fg)" ? "#111" : accent}`, paddingBottom: 10, marginBottom: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>ANIMESH BASAK</h1>
      <div style={{ fontSize: 12.5, color: "#3f3f46", marginTop: 3 }}>Lead Frontend Engineer · React · TypeScript · SSR · Performance</div>
      <div style={{ fontSize: 10.5, color: "#52525b", marginTop: 6, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span>animeshbasak@gmail.com</span>
        <span>·</span>
        <span>+91 99713 40719</span>
        <span>·</span>
        <span>Bangalore, KA</span>
        <span>·</span>
        <span style={{ color: accent === "var(--fg)" ? "#2563eb" : "#7c3aed" }}>linkedin.com/in/animeshbasak</span>
      </div>
    </div>
    <Sect title="SUMMARY" color={accent}>
      <p style={{ fontSize: 11.5, lineHeight: 1.55, margin: 0 }}>
        Lead Frontend Engineer with 7+ years building scalable, high-traffic consumer platforms serving 150M+ MAU. Proven at reducing TTI by 62% through aggressive code splitting and edge caching. Shipped design systems adopted by 40+ product teams across Airtel, MakeMyTrip, and Greyb.
      </p>
    </Sect>
    <Sect title="EXPERIENCE" color={accent}>
      <ExpRow role="Lead Engineer — Full Stack" company="Airtel Digital Ltd." date="Jul 2024 — Present" bullets={[
        "Led performance rewrite cutting TTI by 62% across 14 consumer surfaces serving 150M+ MAU.",
        "Shipped a design system adopted by 40+ product teams; 10k+ Figma downloads.",
        "Mentored 6 engineers to senior level; owned the quarterly design review cadence.",
      ]} />
      <ExpRow role="Senior Software Engineer II" company="MakeMyTrip India Pvt. Ltd." date="Jul 2022 — May 2024" bullets={[
        "Re-architected booking flow, improving conversion by 18% across mobile web.",
        "Introduced React Query + Suspense patterns reducing boilerplate by ~40%.",
      ]} />
      <ExpRow role="Software Engineer" company="Greyb Communications Ltd." date="Oct 2021 — Jun 2022" bullets={[
        "Built patent-search tooling used by 200+ analysts daily; React + Python backend.",
      ]} />
    </Sect>
    <Sect title="EDUCATION" color={accent}>
      <div style={{ fontSize: 11.5, display: "flex", justifyContent: "space-between" }}>
        <span><strong>B.Tech · Computer Science & Engineering</strong> · Inderprastha Engineering College, Delhi NCR</span>
        <span style={{ color: "#52525b" }}>2014—2018</span>
      </div>
    </Sect>
    <Sect title="SKILLS" color={accent}>
      <div style={{ fontSize: 11, lineHeight: 1.7 }}>
        <div><strong>Languages:</strong> TypeScript, JavaScript, Python, Go</div>
        <div><strong>Frameworks:</strong> React 18, Next.js, Node.js, Express, Spring Boot</div>
        <div><strong>Tools:</strong> Figma, Jira, Jenkins, Docker, GitHub Actions, Kibana, Google Analytics</div>
      </div>
    </Sect>
  </div>;
}
function Sect({ title, color, children }) {
  return <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color, marginBottom: 7 }}>{title}</div>
    {children}
  </div>;
}
function ExpRow({ role, company, date, bullets }) {
  return <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{role}</span>
      <span style={{ fontSize: 10.5, color: "#52525b" }}>{date}</span>
    </div>
    <div style={{ fontSize: 11, color: "#52525b", marginBottom: 5, fontStyle: "italic" }}>{company}</div>
    <ul style={{ margin: 0, paddingLeft: 15, fontSize: 11, lineHeight: 1.5 }}>
      {bullets.map((b, i) => <li key={i} style={{ marginBottom: 2 }}>{b}</li>)}
    </ul>
  </div>;
}

/* ── AI Panels ── */
function ATSPanel() {
  const ats = window.ATS;
  const pct = ats.overall / 100;
  const r = 44, stroke = 6;
  const c = 2 * Math.PI * r;
  return <div>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 10px" }}>
      <div style={{ position: "relative", width: 110, height: 110 }}>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <circle cx="55" cy="55" r={r} fill="none" stroke="var(--bg-3)" strokeWidth={stroke} />
          <defs>
            <linearGradient id="atsGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <circle cx="55" cy="55" r={r} fill="none"
            stroke="url(#atsGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * pct} ${c}`}
            transform="rotate(-90 55 55)"
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "grid", placeItems: "center", textAlign: "center",
        }}>
          <div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 600 }}>{ats.overall}</div>
            <div style={{ fontSize: 10, color: "var(--fg-3)", marginTop: -2 }}>ATS SCORE</div>
          </div>
        </div>
      </div>
      <div className="badge emerald" style={{ marginTop: 8 }}>Grade {ats.grade}</div>
    </div>

    <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>Breakdown</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {ats.breakdown.map(b => (
        <div key={b.k}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 11.5 }}>{b.k}</span>
            <span className="mono" style={{ fontSize: 11, color: b.v >= 80 ? "var(--emerald)" : b.v >= 70 ? "var(--cyan)" : "var(--amber)" }}>{b.v}</span>
          </div>
          <div style={{ height: 4, background: "var(--bg-inset)", borderRadius: 999, marginBottom: 4 }}>
            <div style={{ width: `${b.v}%`, height: "100%", background: b.v >= 80 ? "var(--emerald)" : b.v >= 70 ? "var(--cyan)" : "var(--amber)", borderRadius: 999 }} />
          </div>
          <div className="text-4" style={{ fontSize: 10.5, lineHeight: 1.4 }}>{b.detail}</div>
        </div>
      ))}
    </div>

    <div className="eyebrow" style={{ marginTop: 18, marginBottom: 8 }}>To improve</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {ats.improvements.map((imp, i) => (
        <div key={i} style={{ display: "flex", gap: 7, fontSize: 11.5, padding: "6px 8px", background: "var(--bg-2)", border: "1px solid var(--hair)", borderRadius: 6 }}>
          <Icon.Sparkle size={11} style={{ color: "var(--purple)", marginTop: 2, flexShrink: 0 }} />
          <span style={{ color: "var(--fg-2)", lineHeight: 1.4 }}>{imp}</span>
        </div>
      ))}
    </div>
  </div>;
}

function RewritePanel() {
  return <div>
    <div className="eyebrow" style={{ marginBottom: 8 }}>Select a bullet</div>
    <div style={{
      padding: "10px 12px",
      border: "1px solid rgba(168,85,247,0.25)",
      background: "rgba(168,85,247,0.04)",
      borderRadius: 8,
      marginBottom: 10,
      fontSize: 12,
      color: "var(--fg-2)",
      lineHeight: 1.5,
    }}>
      "Led performance rewrite cutting TTI by 62% across 14 consumer surfaces."
    </div>

    <div className="eyebrow" style={{ marginTop: 14, marginBottom: 8 }}>AI Suggestions</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        "Architected performance overhaul reducing Time-to-Interactive by 62% across 14 surfaces serving 150M+ MAU.",
        "Drove edge-caching + code-splitting initiative that cut TTI 62%, lifting conversion 8%.",
        "Led cross-team performance rewrite; TTI down 62%, bundle size down 41%, CWV passing on all 14 surfaces.",
      ].map((s, i) => (
        <div key={i} className="card" style={{ padding: 11, fontSize: 12, lineHeight: 1.5, color: "var(--fg-2)", cursor: "pointer" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <span className="badge purple">Variant {i + 1}</span>
            <span className="mono text-4" style={{ fontSize: 10, marginLeft: "auto" }}>+{[18, 22, 31][i]} impact</span>
          </div>
          {s}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button className="btn sm" style={{ flex: 1 }}><Icon.Check size={11} /> Apply</button>
            <button className="btn sm ghost"><Icon.X size={11} /></button>
          </div>
        </div>
      ))}
    </div>
  </div>;
}

function JDMatchPanel() {
  return <div>
    <div className="eyebrow" style={{ marginBottom: 8 }}>Paste job description</div>
    <textarea className="textarea" style={{ minHeight: 110 }} placeholder="Paste the JD here — we'll score keyword overlap, seniority match, and missing skills..." />
    <button className="btn primary" style={{ width: "100%", marginTop: 8 }}>
      <Icon.Sparkle size={12} strokeWidth={2} /> Analyze match
    </button>

    <div className="eyebrow" style={{ marginTop: 20, marginBottom: 8 }}>Last analysis · Staff Frontend Eng @ Linear</div>
    <div className="card card-pad">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div className="mono" style={{ fontSize: 28, fontWeight: 600, color: "var(--emerald)" }}>92</div>
        <div>
          <div style={{ fontSize: 11 }}>Strong match</div>
          <div className="text-4" style={{ fontSize: 10 }}>2 minor gaps</div>
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 6, fontSize: 9 }}>Gaps</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        <span className="chip" style={{ color: "var(--amber)", borderColor: "rgba(251,191,36,0.25)" }}>Rust</span>
        <span className="chip" style={{ color: "var(--amber)", borderColor: "rgba(251,191,36,0.25)" }}>WebAssembly</span>
      </div>
    </div>
  </div>;
}

window.PageResume = PageResume;

})();
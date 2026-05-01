(function(){
/* ───────── Profile / Settings ───────── */
var Icon = window.Icon;

function PageProfile() {
  const [tab, setTab] = React.useState("profile");
  const p = window.PROFILE;

  const tabs = [
    { id: "profile", l: "Profile", i: Icon.User },
    { id: "preferences", l: "Job preferences", i: Icon.Target },
    { id: "integrations", l: "Integrations", i: Icon.Link },
    { id: "alerts", l: "Alerts", i: Icon.Bell },
    { id: "account", l: "Account", i: Icon.Settings },
  ];

  return (
    <div style={{ padding: "18px 26px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 className="h1" style={{ marginBottom: 4 }}>Your Profile</h1>
        <p className="text-3" style={{ fontSize: 12.5, margin: 0 }}>
          This is what Lakshya uses to score, rewrite, and match. Keep it fresh.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--hair)", marginBottom: 20, overflowX: "auto" }}>
        {tabs.map(t => {
          const IconC = t.i;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "10px 14px",
              fontSize: 12.5,
              color: tab === t.id ? "var(--fg)" : "var(--fg-3)",
              borderBottom: tab === t.id ? "2px solid var(--cyan)" : "2px solid transparent",
              marginBottom: -1,
              display: "inline-flex", alignItems: "center", gap: 7,
              whiteSpace: "nowrap",
              fontWeight: tab === t.id ? 500 : 400,
            }}><IconC size={12} /> {t.l}</button>
          );
        })}
      </div>

      {tab === "profile" && <ProfileTab p={p} />}
      {tab === "preferences" && <PreferencesTab p={p} />}
      {tab === "integrations" && <IntegrationsTab />}
      {tab === "alerts" && <AlertsTab />}
      {tab === "account" && <AccountTab />}
    </div>
  );
}

function ProfileTab({ p }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
      {/* Left identity card */}
      <div className="card card-pad" style={{ height: "fit-content" }}>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <div style={{
            width: "100%", height: 80,
            borderRadius: 10,
            background: "linear-gradient(135deg, #22d3ee22, #a855f722, #34d39922)",
            marginBottom: -32,
            border: "1px solid var(--hair)",
          }} />
          <div style={{ paddingLeft: 14 }}>
            <div style={{
              width: 68, height: 68,
              borderRadius: 999,
              background: "linear-gradient(135deg, #a855f7, #22d3ee)",
              color: "#fff",
              display: "grid", placeItems: "center",
              fontSize: 24, fontWeight: 600,
              border: "3px solid var(--elev-1)",
              fontFamily: "var(--font-display)",
            }}>{p.initials}</div>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{p.name}</span>
            <span className="badge cyan" style={{ fontSize: 9 }}>PRO</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--fg-3)", marginTop: 2 }}>{p.title}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 11.5 }}>
          <Row icon={Icon.Mail} label={p.email} />
          <Row icon={Icon.Phone} label={p.phone} />
          <Row icon={Icon.MapPin} label={p.location} />
          <Row icon={Icon.Globe} label={p.portfolio} link />
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--hair)" }}>
          <div className="eyebrow" style={{ marginBottom: 7 }}>Profile strength</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1, height: 5, background: "var(--bg-inset)", borderRadius: 999 }}>
              <div style={{ width: "88%", height: "100%", background: "linear-gradient(90deg, #22d3ee, #34d399)", borderRadius: 999 }} />
            </div>
            <span className="mono" style={{ fontSize: 11, color: "var(--emerald)", fontWeight: 600 }}>88</span>
          </div>
          <p className="text-4" style={{ fontSize: 10.5, margin: 0, lineHeight: 1.4 }}>Add a summary line + 2 more skills to cross 90.</p>
        </div>
      </div>

      {/* Right fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FieldCard title="Basic information" actions={<button className="btn sm ghost"><Icon.Edit size={11} /> Edit</button>}>
          <GridFields>
            <Field label="Full name" value={p.name} />
            <Field label="Title" value={p.title} />
            <Field label="Email" value={p.email} />
            <Field label="Phone" value={p.phone} />
            <Field label="Location" value={p.location} />
            <Field label="Years of experience" value="7+ years" />
          </GridFields>
        </FieldCard>

        <FieldCard title="Top skills" sub="Auto-detected from your resume & updated weekly" actions={<button className="btn sm ghost"><Icon.Plus size={11} /> Add</button>}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {p.skills.map((s, i) => (
              <span key={s} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 9px 4px 9px",
                fontSize: 11.5,
                background: i < 3 ? "rgba(34,211,238,0.08)" : "var(--bg-3)",
                border: i < 3 ? "1px solid rgba(34,211,238,0.25)" : "1px solid var(--hair)",
                color: i < 3 ? "var(--cyan)" : "var(--fg-2)",
                borderRadius: 6,
              }}>
                {s}
                {i < 3 && <span className="mono" style={{ fontSize: 9, opacity: 0.7 }}>★</span>}
              </span>
            ))}
          </div>
        </FieldCard>

        <FieldCard title="Links" actions={<button className="btn sm ghost"><Icon.Plus size={11} /> Add link</button>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <LinkRow icon={Icon.Link} label="LinkedIn" val={p.linkedin} />
            <LinkRow icon={Icon.Globe} label="Portfolio" val={p.portfolio} />
            <LinkRow icon={Icon.Code} label="GitHub" val="github.com/animeshbasak" />
          </div>
        </FieldCard>
      </div>
    </div>
  );
}

function Row({ icon: I, label, link }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
    <I size={12} style={{ color: "var(--fg-4)" }} />
    <span style={{ color: link ? "var(--cyan)" : "var(--fg-2)" }}>{label}</span>
  </div>;
}
function FieldCard({ title, sub, actions, children }) {
  return <div className="card card-pad">
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: sub ? 4 : 12, gap: 10 }}>
      <h3 className="h3" style={{ color: "var(--fg)", fontSize: 13 }}>{title}</h3>
      {actions}
    </div>
    {sub && <p className="text-4" style={{ fontSize: 11, margin: "0 0 12px" }}>{sub}</p>}
    {children}
  </div>;
}
function GridFields({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>{children}</div>;
}
function Field({ label, value }) {
  return <div>
    <div className="eyebrow" style={{ marginBottom: 3, fontSize: 9.5 }}>{label}</div>
    <div style={{ fontSize: 12.5, color: "var(--fg)" }}>{value}</div>
  </div>;
}
function LinkRow({ icon: I, label, val }) {
  return <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "8px 10px",
    background: "var(--bg-2)",
    border: "1px solid var(--hair)",
    borderRadius: 7,
  }}>
    <I size={13} style={{ color: "var(--fg-3)" }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{label}</div>
      <div style={{ fontSize: 12, color: "var(--cyan)" }}>{val}</div>
    </div>
    <button className="btn icon sm ghost"><Icon.Ext size={11} /></button>
  </div>;
}

/* ── Job preferences ── */
function PreferencesTab({ p }) {
  const [salary, setSalary] = React.useState([p.preferences.salaryMin, p.preferences.salaryMax]);
  const [remote, setRemote] = React.useState(p.preferences.remote);
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
    <FieldCard title="Target roles">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
        {p.preferences.targetRoles.map(r => (
          <span key={r} className="chip active" style={{ cursor: "default" }}>
            {r} <Icon.X size={10} />
          </span>
        ))}
        <button className="chip" style={{ color: "var(--fg-3)" }}><Icon.Plus size={10} /> Add role</button>
      </div>
    </FieldCard>

    <FieldCard title="Locations">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {p.preferences.locations.map(r => (
          <span key={r} className="chip active" style={{ cursor: "default" }}>
            <Icon.MapPin size={10} /> {r} <Icon.X size={10} />
          </span>
        ))}
      </div>
    </FieldCard>

    <FieldCard title="Salary range" sub="USD · annual base">
      <div style={{ padding: "14px 6px 4px" }}>
        <SalaryRange value={salary} onChange={setSalary} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11.5 }}>
          <span className="mono" style={{ color: "var(--fg-2)" }}>${salary[0]}k</span>
          <span className="text-4" style={{ fontSize: 11 }}>to</span>
          <span className="mono" style={{ color: "var(--fg-2)" }}>${salary[1]}k</span>
        </div>
      </div>
    </FieldCard>

    <FieldCard title="Work mode">
      <div style={{ display: "flex", gap: 6 }}>
        {["Remote", "Hybrid", "Onsite"].map(m => (
          <button key={m} onClick={() => setRemote(m.toLowerCase())} style={{
            flex: 1, padding: "10px 8px",
            border: remote === m.toLowerCase() ? "1px solid var(--cyan)" : "1px solid var(--hair)",
            background: remote === m.toLowerCase() ? "var(--cyan-dim)" : "var(--bg-2)",
            color: remote === m.toLowerCase() ? "var(--cyan)" : "var(--fg-2)",
            borderRadius: 8,
            fontSize: 12,
          }}>{m}</button>
        ))}
      </div>
    </FieldCard>

    <FieldCard title="Seniority & availability" style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Seniority</div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {["Junior", "Mid", "Senior", "Staff", "Principal", "Lead"].map(s => (
              <span key={s} className={`chip ${s === "Senior" || s === "Lead" ? "active" : ""}`} style={{ cursor: "pointer" }}>{s}</span>
            ))}
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Availability</div>
          <div style={{ display: "flex", gap: 5 }}>
            {["Immediate", "2 weeks", "1 month", "3+ months"].map(s => (
              <span key={s} className={`chip ${s === "2 weeks" ? "active" : ""}`} style={{ cursor: "pointer" }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </FieldCard>
  </div>;
}

function SalaryRange({ value, onChange }) {
  // Visual only — show two handles on a track
  const min = 0, max = 300;
  const lPct = (value[0] / max) * 100;
  const rPct = (value[1] / max) * 100;
  return <div style={{ position: "relative", height: 24 }}>
    <div style={{ position: "absolute", top: 10, left: 0, right: 0, height: 4, background: "var(--bg-inset)", borderRadius: 999 }} />
    <div style={{ position: "absolute", top: 10, left: `${lPct}%`, width: `${rPct - lPct}%`, height: 4, background: "linear-gradient(90deg, #22d3ee, #a855f7)", borderRadius: 999 }} />
    <div style={{ position: "absolute", top: 4, left: `calc(${lPct}% - 8px)`, width: 16, height: 16, borderRadius: 999, background: "var(--fg)", border: "3px solid var(--cyan)", cursor: "grab" }} />
    <div style={{ position: "absolute", top: 4, left: `calc(${rPct}% - 8px)`, width: 16, height: 16, borderRadius: 999, background: "var(--fg)", border: "3px solid var(--purple)", cursor: "grab" }} />
  </div>;
}

/* ── Integrations ── */
function IntegrationsTab() {
  const integrations = [
    { name: "LinkedIn", desc: "Apply with saved profile", status: "connected", color: "var(--cyan)" },
    { name: "Greenhouse", desc: "One-click submit to 10k+ companies", status: "connected", color: "var(--emerald)" },
    { name: "Lever", desc: "Direct application API", status: "connected", color: "var(--emerald)" },
    { name: "Indeed", desc: "Bulk scrape & apply", status: "pending", color: "var(--amber)" },
    { name: "Naukri", desc: "India-focused listings", status: "connected", color: "var(--emerald)" },
    { name: "Workday", desc: "Enterprise ATS", status: "disconnected", color: "var(--fg-4)" },
    { name: "Google Calendar", desc: "Sync interview slots", status: "connected", color: "var(--emerald)" },
    { name: "Slack", desc: "Interview reminders & offer alerts", status: "disconnected", color: "var(--fg-4)" },
  ];
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
    {integrations.map(int => (
      <div key={int.name} className="card card-pad" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: 8,
          background: "var(--bg-3)",
          border: "1px solid var(--hair)",
          display: "grid", placeItems: "center",
          fontSize: 13, fontWeight: 600, color: int.color,
          fontFamily: "var(--font-display)",
        }}>{int.name[0]}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{int.name}</div>
          <div className="text-4" style={{ fontSize: 10.5, marginTop: 1 }}>{int.desc}</div>
        </div>
        {int.status === "connected" ? (
          <span className="badge emerald" style={{ fontSize: 9 }}><span className="dot" /> Connected</span>
        ) : int.status === "pending" ? (
          <span className="badge amber" style={{ fontSize: 9 }}>Pending</span>
        ) : (
          <button className="btn sm">Connect</button>
        )}
      </div>
    ))}
  </div>;
}

/* ── Alerts ── */
function AlertsTab() {
  return <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 720 }}>
    {[
      { title: "New high-fit jobs (85+)", desc: "Instant email when a 85+ fit role is scraped", on: true },
      { title: "Daily digest", desc: "9am digest of your top-10 matches", on: true },
      { title: "Interview reminders", desc: "1-hour and 15-min before scheduled interviews", on: true },
      { title: "Application deadlines", desc: "2 days before any saved deadline", on: false },
      { title: "Weekly pipeline summary", desc: "Stats on your applications and conversion", on: true },
      { title: "Resume improvements", desc: "AI finds a way to improve your resume", on: false },
    ].map(a => <AlertRow key={a.title} {...a} />)}
  </div>;
}
function AlertRow({ title, desc, on }) {
  const [v, setV] = React.useState(on);
  return <div className="card" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 14 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</div>
      <div className="text-4" style={{ fontSize: 11, marginTop: 2 }}>{desc}</div>
    </div>
    <Toggle on={v} onChange={setV} />
  </div>;
}
function Toggle({ on, onChange }) {
  return <button onClick={() => onChange(!on)} style={{
    width: 34, height: 20,
    borderRadius: 999,
    background: on ? "var(--cyan)" : "var(--bg-3)",
    border: "1px solid " + (on ? "var(--cyan)" : "var(--hair)"),
    position: "relative",
    transition: "background 0.2s, border 0.2s",
  }}>
    <span style={{
      position: "absolute",
      top: 1, left: on ? 15 : 1,
      width: 16, height: 16,
      borderRadius: 999,
      background: on ? "#06060a" : "var(--fg-3)",
      transition: "left 0.2s",
    }} />
  </button>;
}

/* ── Account ── */
function AccountTab() {
  return <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 720 }}>
    <FieldCard title="Subscription">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          padding: "14px 16px",
          borderRadius: 10,
          background: "linear-gradient(135deg, rgba(34,211,238,0.12), rgba(168,85,247,0.12))",
          border: "1px solid rgba(34,211,238,0.3)",
          flex: 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <Icon.Sparkle size={14} style={{ color: "var(--cyan)" }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Pro — $19/mo</span>
          </div>
          <div className="text-3" style={{ fontSize: 11.5 }}>Unlimited AI rewrites · All 5 sources · Priority support · Next billing Nov 5</div>
        </div>
        <button className="btn">Manage</button>
      </div>
    </FieldCard>

    <FieldCard title="Data & privacy">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button className="card" style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
          <span style={{ fontSize: 12.5 }}>Export your data</span>
          <Icon.Down size={11} style={{ color: "var(--fg-3)" }} />
        </button>
        <button className="card" style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", color: "var(--red)" }}>
          <span style={{ fontSize: 12.5 }}>Delete account</span>
          <Icon.ChevR size={11} />
        </button>
      </div>
    </FieldCard>
  </div>;
}

window.PageProfile = PageProfile;

})();
(function(){
/* ───────── Home (Dashboard) ───────── */
var Icon = window.Icon;

function PageHome({ setRoute, onRunSearch }) {
  const stats = [
    { k: "Applications", v: 12,  delta: "+3", accent: "var(--fg)",      icon: Icon.Briefcase },
    { k: "Interviews",   v: 4,   delta: "+2", accent: "var(--cyan)",    icon: Icon.Phone },
    { k: "Offers",       v: 1,   delta: "new",accent: "var(--emerald)", icon: Icon.Sparkle },
    { k: "Avg fit score",v: 78,  delta: "+5", accent: "var(--purple)",  icon: Icon.Target, mono: true },
  ];

  const pipelineCounts = { saved: 4, applied: 5, interview: 2, offer: 1, rejected: 0 };
  const total = Object.values(pipelineCounts).reduce((a,b)=>a+b,0);

  return (
    <div style={{ padding: "22px 28px 120px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Hero strip */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20,
        marginBottom: 22,
      }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8, color: "var(--cyan)" }}>
            <span className="dot" style={{ color: "var(--emerald)", marginRight: 6 }} />
            Good afternoon, Animesh
          </div>
          <h1 className="h1" style={{ fontSize: 28, marginBottom: 6 }}>
            You have <span className="grad-text">4 interviews</span> this week.
          </h1>
          <p className="text-3" style={{ fontSize: 13.5, margin: 0 }}>
            Last search found <span style={{ color: "var(--fg-2)" }}>118 new matches</span> · Resume ATS score up to <span className="mono" style={{ color: "var(--emerald)" }}>82</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { onRunSearch(); setRoute("discover"); }} className="btn primary lg">
            <Icon.Bolt size={14} fill="currentColor" strokeWidth={2} /> Find jobs
          </button>
          <button onClick={() => setRoute("resume")} className="btn lg">
            <Icon.Resume size={14} /> Build resume
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {stats.map(s => {
          const IconC = s.icon;
          return (
            <div key={s.k} className="card card-pad" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "var(--fg-3)", letterSpacing: "0.02em" }}>{s.k}</span>
                <IconC size={14} style={{ color: "var(--fg-4)" }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span className={s.mono ? "mono" : ""} style={{
                  fontSize: 28,
                  fontWeight: 600,
                  color: s.accent,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>{s.v}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--emerald)" }}>
                  {s.delta}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 12, alignItems: "start" }}>
        {/* Pipeline visualization */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h2 className="h2">Pipeline</h2>
              <p className="text-3" style={{ fontSize: 11.5, margin: "2px 0 0" }}>{total} active applications</p>
            </div>
            <button onClick={() => setRoute("pipeline")} className="btn sm ghost" style={{ color: "var(--fg-3)" }}>
              Open board <Icon.ChevR size={11} />
            </button>
          </div>

          {/* Horizontal stacked bar */}
          <div style={{
            display: "flex", height: 10, borderRadius: 999, overflow: "hidden",
            background: "var(--bg-inset)", marginBottom: 18,
          }}>
            {window.PIPELINE_COLUMNS.map(col => {
              const v = pipelineCounts[col.id] || 0;
              if (v === 0) return null;
              return (
                <div key={col.id} style={{
                  width: `${(v / total) * 100}%`,
                  background: col.accent,
                  opacity: 0.85,
                }} title={`${col.label}: ${v}`} />
              );
            })}
          </div>

          {/* Per-column rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {window.PIPELINE_COLUMNS.map(col => {
              const v = pipelineCounts[col.id] || 0;
              const pct = total ? (v / total) * 100 : 0;
              return (
                <div key={col.id} style={{ display: "grid", gridTemplateColumns: "110px 1fr 40px", gap: 12, alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12 }}>
                    <span className="dot" style={{ color: col.accent }} />
                    <span className="text-2">{col.label}</span>
                  </div>
                  <div style={{ height: 5, background: "var(--bg-inset)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: col.accent, transition: "width 0.6s" }} />
                  </div>
                  <div className="mono" style={{ fontSize: 11.5, color: v ? "var(--fg)" : "var(--fg-4)", textAlign: "right" }}>
                    {v}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 className="h2">Activity</h2>
            <span className="text-4" style={{ fontSize: 10.5 }}>today</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {window.RECENT_ACTIVITY.map((a, i) => (
              <div key={i} style={{
                display: "flex", gap: 10,
                padding: "10px 0",
                borderBottom: i < window.RECENT_ACTIVITY.length - 1 ? "1px solid var(--hair)" : "none",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: "var(--bg-inset)",
                  display: "grid", placeItems: "center",
                  flexShrink: 0,
                  color: a.type === "status" ? "var(--emerald)" : a.type === "resume" ? "var(--purple)" : "var(--cyan)",
                }}>
                  {a.type === "status" ? <Icon.Check size={12} /> : a.type === "resume" ? <Icon.Sparkle size={12} /> : <Icon.Plus size={12} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, lineHeight: 1.35 }}>
                    {a.type === "status" && <>
                      <span className="text-2">{a.title}</span>{" "}
                      <span className="text-4">moved to</span>{" "}
                      <span style={{ color: "var(--emerald)", textTransform: "capitalize" }}>{a.to}</span>
                    </>}
                    {a.type === "added" && <>
                      <span className="text-2">Added</span>{" "}
                      <span>{a.title}</span>
                    </>}
                    {a.type === "applied" && <>
                      <span className="text-2">Applied to</span>{" "}
                      <span>{a.title}</span>
                    </>}
                    {a.type === "resume" && <>
                      <span className="text-2">{a.title}</span>
                    </>}
                  </div>
                  <div className="text-4 mono" style={{ fontSize: 10.5, marginTop: 2 }}>
                    {a.company && <>{a.company} · </>}
                    {a.detail && <>{a.detail} · </>}
                    {a.when}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI insight */}
      <div className="card" style={{
        padding: 18,
        marginTop: 12,
        background: "linear-gradient(135deg, rgba(34,211,238,0.035) 0%, rgba(168,85,247,0.035) 100%)",
        border: "1px solid rgba(34,211,238,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "var(--grad-brand)",
            display: "grid", placeItems: "center",
            color: "#06060a",
            flexShrink: 0,
          }}>
            <Icon.Sparkle size={17} fill="currentColor" strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="h3" style={{ color: "var(--fg)" }}>Weekly insight</span>
              <span className="badge cyan">AI</span>
            </div>
            <p style={{ fontSize: 13, margin: 0, color: "var(--fg-2)", lineHeight: 1.5 }}>
              You're 2× more likely to land an interview at <span style={{ color: "var(--fg)" }}>mid-stage startups with fewer than 200 people</span>. Your fit scores at Linear, Vercel, and Retool are all above 85 — consider prioritizing those next week.
            </p>
          </div>
          <button className="btn sm ghost" style={{ color: "var(--fg-3)" }}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

window.PageHome = PageHome;

})();
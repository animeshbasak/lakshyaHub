(function(){
/* ───────── Discover (Match Jobs) ───────── */
var Icon = window.Icon;

function PageDiscover({ autoRunKey }) {
  const [role, setRole] = React.useState("Senior Frontend Engineer");
  const [loc, setLoc] = React.useState("Remote · India");
  const [sel, setSel] = React.useState(new Set(["linkedin", "naukri", "greenhouse", "lever", "remoteok"]));
  const [state, setState] = React.useState("idle"); // idle | running | done
  const [visibleLogs, setVisibleLogs] = React.useState([]);
  const [sort, setSort] = React.useState("fit");
  const [filter, setFilter] = React.useState("all");

  const toggleSrc = (id) => {
    const n = new Set(sel);
    n.has(id) ? n.delete(id) : n.add(id);
    setSel(n);
  };

  const runSearch = () => {
    setState("running");
    setVisibleLogs([]);
    window.LOG_SAMPLES.forEach((l, i) => {
      setTimeout(() => {
        setVisibleLogs(prev => [...prev, l]);
        if (i === window.LOG_SAMPLES.length - 1) setTimeout(() => setState("done"), 400);
      }, 180 + i * 140);
    });
  };

  React.useEffect(() => { if (autoRunKey) runSearch(); }, [autoRunKey]);

  const jobs = window.SAMPLE_JOBS;
  const filtered = React.useMemo(() => {
    let js = [...jobs];
    if (filter === "90") js = js.filter(j => j.fit >= 90);
    else if (filter === "80") js = js.filter(j => j.fit >= 80 && j.fit < 90);
    else if (filter === "70") js = js.filter(j => j.fit >= 70 && j.fit < 80);
    if (sort === "fit") js.sort((a, b) => b.fit - a.fit);
    else if (sort === "new") js.sort((a, b) => a.posted.localeCompare(b.posted));
    return js;
  }, [sort, filter, jobs]);

  const hasErr = visibleLogs.some(l => l.lvl === "error" || l.lvl === "warn");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", height: "calc(100vh - var(--topbar-h))", overflow: "hidden" }}>
      {/* Left: query panel */}
      <div style={{
        borderRight: "1px solid var(--hair)",
        padding: 22,
        overflow: "auto",
        background: "var(--bg-1)",
      }}>
        <div style={{ marginBottom: 18 }}>
          <h1 className="h1" style={{ fontSize: 19, marginBottom: 4 }}>Discover jobs</h1>
          <p className="text-3" style={{ fontSize: 12, margin: 0 }}>Live scrape · AI-scored against your resume</p>
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>Role / Title</div>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Icon.Search size={14} style={{ position: "absolute", left: 11, top: 10, color: "var(--fg-4)" }} />
          <input className="input" value={role} onChange={e => setRole(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>Location</div>
        <div style={{ position: "relative", marginBottom: 14 }}>
          <Icon.MapPin size={14} style={{ position: "absolute", left: 11, top: 10, color: "var(--fg-4)" }} />
          <input className="input" value={loc} onChange={e => setLoc(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>

        <div className="eyebrow" style={{ marginBottom: 8 }}>Sources</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {window.SOURCES.map(s => (
            <button key={s.id} onClick={() => toggleSrc(s.id)} className={`chip ${sel.has(s.id) ? "active" : ""}`}>
              <span style={{
                width: 6, height: 6, borderRadius: 999,
                background: sel.has(s.id) ? "var(--cyan)" : "var(--fg-4)",
              }} />
              {s.label}
              <span style={{ fontSize: 9.5, color: "var(--fg-4)", marginLeft: 2 }} className="mono">{s.count}</span>
            </button>
          ))}
        </div>

        <button onClick={runSearch} disabled={state === "running"} className="btn primary" style={{ width: "100%", height: 40, marginBottom: 10 }}>
          {state === "running" ? <>
            <span style={{ width: 10, height: 10, borderRadius: 999, border: "1.5px solid rgba(6,6,10,0.3)", borderTopColor: "#06060a", animation: "spin 0.7s linear infinite" }} />
            Scraping...
          </> : <>
            <Icon.Bolt size={14} fill="currentColor" strokeWidth={2} />
            Run search
            <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.5, fontFamily: "var(--font-mono)" }}>⏎</span>
          </>}
        </button>

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 11px",
          border: "1px solid var(--hair)",
          borderRadius: 8,
          background: "rgba(168,85,247,0.04)",
          fontSize: 11.5,
          color: "var(--fg-3)",
        }}>
          <Icon.Globe size={14} style={{ color: "var(--purple)" }} />
          <span>Also searches <span style={{ color: "var(--fg-2)", fontWeight: 500 }}>40+ company portals</span> via Greenhouse & Lever</span>
        </div>

        {/* Recent searches */}
        <div style={{ marginTop: 22 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Recent</div>
          {["Staff Engineer · Remote", "Product Designer · NYC", "Frontend · Bangalore"].map(r => (
            <button key={r} style={{
              display: "flex", alignItems: "center", gap: 8,
              width: "100%", padding: "7px 10px",
              fontSize: 12, color: "var(--fg-2)",
              borderRadius: 7,
              textAlign: "left",
            }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-2)"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
              <Icon.Clock size={12} style={{ color: "var(--fg-4)" }} />
              <span>{r}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: results / logs */}
      <div style={{ overflow: "auto" }}>
        {state === "idle" && <EmptyState onStart={runSearch} />}
        {state === "running" && <LogStream logs={visibleLogs} />}
        {state === "done" && (
          <div style={{ padding: "18px 26px 60px" }}>
            {/* Collapsed log */}
            <details style={{
              padding: "8px 12px",
              marginBottom: 14,
              background: "var(--bg-2)",
              border: "1px solid var(--hair)",
              borderRadius: 8,
              fontSize: 12,
              color: "var(--fg-3)",
            }}>
              <summary style={{ cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon.Check size={12} style={{ color: "var(--emerald)" }} />
                <span>Scrape complete · <span className="mono" style={{ color: "var(--fg-2)" }}>{jobs.length} jobs</span> from 5 sources in 32s</span>
                <Icon.ChevD size={12} style={{ marginLeft: "auto" }} />
              </summary>
              <div style={{ marginTop: 10 }}>
                <LogStream logs={visibleLogs} compact />
              </div>
            </details>

            {hasErr && (
              <div style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "10px 14px",
                background: "rgba(251,191,36,0.05)",
                border: "1px solid rgba(251,191,36,0.2)",
                borderRadius: 10,
                marginBottom: 14,
              }}>
                <Icon.Warn size={14} style={{ color: "var(--amber)", marginTop: 2 }} />
                <div style={{ flex: 1, fontSize: 12 }}>
                  <div style={{ color: "var(--amber)", fontWeight: 600, marginBottom: 2 }}>Some sources had issues</div>
                  <div className="mono text-3" style={{ fontSize: 11 }}>
                    LinkedIn: rate limited · Indeed: authentication failed
                  </div>
                </div>
                <button className="btn sm ghost" style={{ color: "var(--amber)" }}>Retry failed</button>
              </div>
            )}

            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{filtered.length} results</span>
              <span style={{ flex: 1 }} />
              <div style={{ display: "flex", gap: 4, background: "var(--bg-inset)", padding: 2, borderRadius: 8, border: "1px solid var(--hair)" }}>
                {[{id:"all", l:"All"}, {id:"90", l:"90+"}, {id:"80", l:"80–89"}, {id:"70", l:"70–79"}].map(f => (
                  <button key={f.id} onClick={() => setFilter(f.id)} style={{
                    height: 24, padding: "0 10px", fontSize: 11.5,
                    borderRadius: 5,
                    color: filter === f.id ? "var(--fg)" : "var(--fg-3)",
                    background: filter === f.id ? "var(--bg-3)" : "transparent",
                  }}>{f.l}</button>
                ))}
              </div>
              <button className="btn sm ghost" onClick={() => setSort(sort === "fit" ? "new" : "fit")}>
                <Icon.Sort size={12} /> {sort === "fit" ? "By fit" : "By date"}
              </button>
            </div>

            {/* Results list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map(j => <JobResultCard key={j.id} job={j} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onStart }) {
  return (
    <div style={{
      height: "100%",
      display: "grid", placeItems: "center",
      padding: 40,
    }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{
          width: 64, height: 64,
          margin: "0 auto 18px",
          borderRadius: 16,
          background: "var(--bg-2)",
          border: "1px solid var(--hair)",
          display: "grid", placeItems: "center",
          color: "var(--cyan)",
          boxShadow: "inset 0 0 40px rgba(34,211,238,0.06)",
        }}>
          <Icon.Search size={24} />
        </div>
        <h3 className="h2" style={{ marginBottom: 6 }}>Ready when you are</h3>
        <p className="text-3" style={{ fontSize: 13, margin: "0 0 18px" }}>
          Configure your search on the left, or press <span className="kbd">⌘J</span> anywhere.
        </p>
        <button className="btn primary" onClick={onStart}>
          <Icon.Bolt size={13} fill="currentColor" strokeWidth={2} /> Run sample search
        </button>
      </div>
    </div>
  );
}

function LogStream({ logs, compact }) {
  const endRef = React.useRef();
  React.useEffect(() => { endRef.current?.scrollIntoView?.({ block: "nearest" }); }, [logs.length]);
  const colorFor = { info: "var(--fg-3)", success: "var(--emerald)", warn: "var(--amber)", error: "var(--red)" };
  const iconFor = (l) => l === "success" ? Icon.Check : l === "warn" ? Icon.Warn : l === "error" ? Icon.Err : Icon.Info;

  return (
    <div style={{ padding: compact ? 0 : "22px 26px", maxWidth: 900, margin: "0 auto" }}>
      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 10, height: 10, borderRadius: 999, border: "1.5px solid rgba(34,211,238,0.4)", borderTopColor: "var(--cyan)", animation: "spin 0.7s linear infinite" }} />
          <span style={{ fontSize: 13 }}>Scraping live job boards...</span>
        </div>
      )}
      <div style={{
        background: compact ? "transparent" : "var(--bg-1)",
        border: compact ? "none" : "1px solid var(--hair)",
        borderRadius: 10,
        padding: compact ? 0 : "14px 16px",
        fontFamily: "var(--font-mono)",
        fontSize: 11.5,
      }}>
        {logs.map((l, i) => {
          const IconC = iconFor(l.lvl);
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 20px 1fr", gap: 8, alignItems: "center", padding: "3px 0" }}>
              <span style={{ color: "var(--fg-4)" }}>{l.t}</span>
              <IconC size={11} style={{ color: colorFor[l.lvl] }} />
              <span style={{ color: colorFor[l.lvl] }}>{l.msg}</span>
            </div>
          );
        })}
        {!compact && <div ref={endRef} />}
      </div>
    </div>
  );
}

function JobResultCard({ job }) {
  const [saved, setSaved] = React.useState(false);
  const gradeColor = {A:"emerald", B:"cyan", C:"amber", D:"amber", F:"red"}[job.grade];
  return (
    <div className="card" style={{
      padding: 16,
      display: "grid", gridTemplateColumns: "1fr auto", gap: 16,
      transition: "border-color 0.15s",
    }}
    onMouseOver={e => e.currentTarget.style.borderColor = "var(--hair-hover)"}
    onMouseOut={e => e.currentTarget.style.borderColor = "var(--hair)"}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14.5, fontWeight: 500 }}>{job.title}</span>
          <span className="badge">{job.source}</span>
          <span className="text-4" style={{ fontSize: 11 }}>· {job.posted}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, fontSize: 12.5, color: "var(--fg-2)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon.Building size={12} style={{ color: "var(--fg-4)" }} /> {job.company}
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Icon.MapPin size={12} style={{ color: "var(--fg-4)" }} /> {job.location}
          </span>
          <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--emerald)" }}>
            <Icon.DollarSign size={12} /> {job.salary}
          </span>
        </div>
        <p className="text-3" style={{ fontSize: 12.5, margin: "0 0 10px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {job.desc}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {job.skills.map(s => (
            <span key={s} style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 4, background: "var(--bg-3)", color: "var(--fg-3)", border: "1px solid var(--hair)" }}>{s}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, minWidth: 110 }}>
        <FitBadge score={job.fit} grade={job.grade} gradeColor={gradeColor} />
        <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
          <button className="btn sm ghost" title="View original"><Icon.Ext size={12} /></button>
          <button
            onClick={() => setSaved(!saved)}
            className={`btn sm ${saved ? "" : "primary"}`}
            style={saved ? { color: "var(--emerald)" } : {}}
          >
            {saved ? <><Icon.Check size={12} /> Saved</> : <><Icon.Plus size={12} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function FitBadge({ score, grade, gradeColor }) {
  const pct = score / 100;
  const stroke = 4;
  const r = 18;
  const c = 2 * Math.PI * r;
  const colorVar = score >= 85 ? "var(--emerald)" : score >= 75 ? "var(--cyan)" : score >= 60 ? "var(--amber)" : "var(--red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 44, height: 44 }}>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={r} fill="none" stroke="var(--bg-3)" strokeWidth={stroke} />
          <circle cx="22" cy="22" r={r} fill="none"
            stroke={colorVar}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c * pct} ${c}`}
            transform="rotate(-90 22 22)"
          />
        </svg>
        <div className="mono" style={{
          position: "absolute", inset: 0,
          display: "grid", placeItems: "center",
          fontSize: 12, fontWeight: 600, color: colorVar,
        }}>{score}</div>
      </div>
      <div style={{ lineHeight: 1.1 }}>
        <div className={`badge ${gradeColor}`} style={{ fontSize: 10 }}>Grade {grade}</div>
        <div className="text-4" style={{ fontSize: 10, marginTop: 3 }}>fit score</div>
      </div>
    </div>
  );
}

window.PageDiscover = PageDiscover;

})();
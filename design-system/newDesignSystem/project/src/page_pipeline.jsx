(function(){
/* ───────── Pipeline (Kanban Board) ───────── */
var Icon = window.Icon;

function PagePipeline() {
  const [jobs, setJobs] = React.useState(window.SAMPLE_JOBS);
  const [drawerId, setDrawerId] = React.useState(null);
  const [drag, setDrag] = React.useState(null); // {id, from}
  const [view, setView] = React.useState("board"); // board | table

  const drawer = drawerId ? jobs.find(j => j.id === drawerId) : null;

  const moveJob = (id, to) => {
    setJobs(js => js.map(j => j.id === id ? { ...j, status: to } : j));
  };

  const groups = {};
  window.PIPELINE_COLUMNS.forEach(c => groups[c.id] = []);
  jobs.forEach(j => { if (groups[j.status]) groups[j.status].push(j); });

  return (
    <div style={{ padding: "18px 26px 60px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 16, gap: 20, flexWrap: "wrap" }}>
        <div>
          <h1 className="h1" style={{ marginBottom: 4 }}>Pipeline</h1>
          <p className="text-3" style={{ fontSize: 12.5, margin: 0 }}>
            {jobs.length} applications · Drag between columns to update status
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ display: "flex", gap: 2, padding: 2, background: "var(--bg-inset)", border: "1px solid var(--hair)", borderRadius: 8 }}>
            <button onClick={() => setView("board")} style={{
              height: 26, padding: "0 10px", fontSize: 11.5,
              color: view === "board" ? "var(--fg)" : "var(--fg-3)",
              background: view === "board" ? "var(--bg-3)" : "transparent",
              borderRadius: 5,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}><Icon.Board size={12} /> Board</button>
            <button onClick={() => setView("table")} style={{
              height: 26, padding: "0 10px", fontSize: 11.5,
              color: view === "table" ? "var(--fg)" : "var(--fg-3)",
              background: view === "table" ? "var(--bg-3)" : "transparent",
              borderRadius: 5,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}><Icon.List size={12} /> Table</button>
          </div>
          <button className="btn sm ghost"><Icon.Filter size={12} /> Filter</button>
          <button className="btn primary sm"><Icon.Plus size={13} strokeWidth={2.2} /> Add application</button>
        </div>
      </div>

      {/* Board */}
      {view === "board" ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(240px, 1fr))",
          gap: 12,
          minHeight: "60vh",
        }}>
          {window.PIPELINE_COLUMNS.map(col => (
            <div
              key={col.id}
              onDragOver={(e) => { e.preventDefault(); }}
              onDrop={(e) => {
                e.preventDefault();
                if (drag) { moveJob(drag.id, col.id); setDrag(null); }
              }}
              style={{
                display: "flex", flexDirection: "column",
                background: "var(--bg-1)",
                border: "1px solid var(--hair)",
                borderRadius: 12,
                padding: 10,
                minHeight: 300,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 6px 10px" }}>
                <span className="dot" style={{ color: col.accent, width: 8, height: 8 }} />
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>{col.label}</span>
                <span className="mono" style={{
                  fontSize: 10.5,
                  padding: "1px 6px",
                  borderRadius: 5,
                  background: `${col.accent}22`,
                  color: col.accent,
                  fontWeight: 600,
                }}>{groups[col.id].length}</span>
                <button className="btn icon sm ghost" style={{ marginLeft: "auto", width: 22, height: 22, color: "var(--fg-4)" }}><Icon.Plus size={11} /></button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {groups[col.id].map(j => (
                  <KanbanCard
                    key={j.id}
                    job={j}
                    onClick={() => setDrawerId(j.id)}
                    onDragStart={() => setDrag({ id: j.id, from: col.id })}
                    onDragEnd={() => setDrag(null)}
                    dragging={drag?.id === j.id}
                  />
                ))}
                {groups[col.id].length === 0 && (
                  <div style={{
                    padding: 20, textAlign: "center",
                    fontSize: 11.5, color: "var(--fg-4)",
                    border: "1px dashed var(--hair)",
                    borderRadius: 8,
                  }}>
                    Drop jobs here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TableView jobs={jobs} onRowClick={setDrawerId} />
      )}

      {/* Drawer */}
      {drawer && <JobDrawer job={drawer} onClose={() => setDrawerId(null)} />}
    </div>
  );
}

function KanbanCard({ job, onClick, onDragStart, onDragEnd, dragging }) {
  const gradeColor = {A:"var(--emerald)", B:"var(--cyan)", C:"var(--amber)", D:"var(--amber)", F:"var(--red)"}[job.grade];
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        padding: 11,
        background: "var(--elev-1)",
        border: "1px solid var(--hair)",
        borderRadius: 9,
        cursor: "grab",
        transition: "border 0.12s, transform 0.12s",
        opacity: dragging ? 0.4 : 1,
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = "var(--hair-hover)"; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = "var(--hair)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 5 }}>
        <span className="badge" style={{ fontSize: 9 }}>{job.source}</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 10, color: gradeColor, fontWeight: 700 }} className="mono">{job.grade}</span>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-2)", fontWeight: 600 }}>{job.fit}</span>
        </span>
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 500, marginBottom: 3, lineHeight: 1.3 }}>{job.title}</div>
      <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{job.company}</div>
      <div className="text-4" style={{ fontSize: 10.5, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
        <Icon.MapPin size={10} /> {job.location}
      </div>
    </div>
  );
}

function TableView({ jobs, onRowClick }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1fr 100px 80px 90px 70px", padding: "10px 14px", borderBottom: "1px solid var(--hair)", fontSize: 10.5, color: "var(--fg-3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        <span>Role</span><span>Company</span><span>Status</span><span className="mono">Fit</span><span className="mono">Grade</span><span>Source</span><span>Posted</span>
      </div>
      {jobs.map(j => {
        const col = window.PIPELINE_COLUMNS.find(c => c.id === j.status);
        const gradeColor = {A:"var(--emerald)", B:"var(--cyan)", C:"var(--amber)", D:"var(--amber)", F:"var(--red)"}[j.grade];
        return (
          <div key={j.id} onClick={() => onRowClick(j.id)} style={{
            display: "grid", gridTemplateColumns: "2.5fr 1.5fr 1fr 100px 80px 90px 70px",
            padding: "12px 14px", borderBottom: "1px solid var(--hair)",
            alignItems: "center", cursor: "pointer", fontSize: 12.5,
          }}
          onMouseOver={e => e.currentTarget.style.background = "var(--bg-2)"}
          onMouseOut={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontWeight: 500 }}>{j.title}</span>
            <span className="text-2">{j.company}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span className="dot" style={{ color: col.accent }} />
              <span className="text-2" style={{ textTransform: "capitalize" }}>{col.label}</span>
            </span>
            <span className="mono" style={{ color: "var(--fg)" }}>{j.fit}</span>
            <span className="mono" style={{ color: gradeColor, fontWeight: 600 }}>{j.grade}</span>
            <span className="badge" style={{ fontSize: 9 }}>{j.source}</span>
            <span className="text-4 mono" style={{ fontSize: 11 }}>{j.posted}</span>
          </div>
        );
      })}
    </div>
  );
}

function JobDrawer({ job, onClose }) {
  const dims = [
    { k: "Skills",    v: 92 },
    { k: "Title",     v: 85 },
    { k: "Seniority", v: 78 },
    { k: "Location",  v: 95 },
    { k: "Salary",    v: 70 },
  ];
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
      }} />
      <aside style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(520px, 90vw)",
        background: "var(--elev-1)",
        borderLeft: "1px solid var(--hair-strong)",
        zIndex: 51,
        boxShadow: "-16px 0 40px rgba(0,0,0,0.5)",
        overflow: "auto",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 20px",
          borderBottom: "1px solid var(--hair)",
          position: "sticky", top: 0,
          background: "var(--elev-1)",
          zIndex: 2,
        }}>
          <span className="badge">{job.source}</span>
          <span className="mono text-4" style={{ fontSize: 11 }}>· posted {job.posted}</span>
          <span style={{ flex: 1 }} />
          <button className="btn icon sm ghost"><Icon.Ext size={13} /></button>
          <button onClick={onClose} className="btn icon sm ghost"><Icon.X size={13} /></button>
        </div>

        <div style={{ padding: "20px 22px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 6px" }}>{job.title}</h2>
          <div style={{ fontSize: 13.5, color: "var(--fg-2)", marginBottom: 14 }}>
            {job.company} · {job.location}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button className="btn primary"><Icon.Send size={12} strokeWidth={2} /> Apply now</button>
            <button className="btn"><Icon.Wand size={12} /> Cover letter</button>
            <button className="btn"><Icon.Book size={12} /> Interview prep</button>
          </div>

          {/* JD Match */}
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Icon.Target size={14} style={{ color: "var(--cyan)" }} />
              <h3 className="h3" style={{ color: "var(--fg)" }}>JD Match Analysis</h3>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 22, fontWeight: 600, color: "var(--emerald)" }}>{job.fit}</span>
              <span style={{ fontSize: 11, color: "var(--fg-3)" }}>/ 100</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {dims.map(d => (
                <div key={d.k} style={{ display: "grid", gridTemplateColumns: "90px 1fr 40px", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{d.k}</span>
                  <div style={{ height: 5, background: "var(--bg-inset)", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${d.v}%`, height: "100%", background: d.v >= 80 ? "var(--emerald)" : d.v >= 70 ? "var(--cyan)" : "var(--amber)" }} />
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)", textAlign: "right" }}>{d.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="eyebrow" style={{ marginBottom: 8 }}>Description</div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--fg-2)", margin: "0 0 14px" }}>
            {job.desc} We're looking for someone who has led 0→1 projects, enjoys working across design and engineering, and cares deeply about craft. You'll collaborate with a small team of senior engineers and ship to production within your first week.
          </p>

          <div className="eyebrow" style={{ marginBottom: 8 }}>Must-have skills</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
            {job.skills.map(s => <span key={s} className="chip active" style={{ cursor: "default" }}>{s}</span>)}
          </div>

          <div className="eyebrow" style={{ marginBottom: 8 }}>Compensation</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: 14,
            background: "rgba(52,211,153,0.04)",
            border: "1px solid rgba(52,211,153,0.15)",
            borderRadius: 10,
            marginBottom: 18,
          }}>
            <Icon.DollarSign size={18} style={{ color: "var(--emerald)" }} />
            <div style={{ flex: 1 }}>
              <div className="mono" style={{ fontSize: 15, fontWeight: 600, color: "var(--emerald)" }}>{job.salary}</div>
              <div className="text-4" style={{ fontSize: 11, marginTop: 2 }}>Annual · base + equity not specified</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

window.PagePipeline = PagePipeline;

})();
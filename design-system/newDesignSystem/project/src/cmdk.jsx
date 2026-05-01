(function(){
/* ───────── Command Palette (⌘K) — Raycast-style ───────── */

var Icon = window.Icon;

function CmdK({ open, onClose, setRoute, onRunSearch }) {
  const [q, setQ] = React.useState("");
  const [idx, setIdx] = React.useState(0);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const items = React.useMemo(() => {
    const nav = [
      { grp: "Navigate", icon: Icon.Home,   label: "Go to Home",     hint: "G H",  run: () => setRoute("home") },
      { grp: "Navigate", icon: Icon.Search, label: "Go to Discover", hint: "G D",  run: () => setRoute("discover") },
      { grp: "Navigate", icon: Icon.Board,  label: "Go to Pipeline", hint: "G P",  run: () => setRoute("pipeline") },
      { grp: "Navigate", icon: Icon.Resume, label: "Go to Resume",   hint: "G R",  run: () => setRoute("resume") },
      { grp: "Navigate", icon: Icon.Settings, label: "Go to Settings", hint: "G S", run: () => setRoute("settings") },
    ];
    const actions = [
      { grp: "Actions", icon: Icon.Bolt,    label: "Run new job search", hint: "⌘J", kbd: true, run: () => { onRunSearch(); setRoute("discover"); } },
      { grp: "Actions", icon: Icon.Plus,    label: "Add job to pipeline",   hint: "⌘N",  run: () => setRoute("pipeline") },
      { grp: "Actions", icon: Icon.Upload,  label: "Import resume (PDF/DOCX)", hint: "⌘U", run: () => setRoute("resume") },
      { grp: "Actions", icon: Icon.Down,    label: "Download resume as PDF", run: () => {} },
      { grp: "Actions", icon: Icon.Sparkle, label: "AI rewrite selected bullets", run: () => setRoute("resume") },
      { grp: "Actions", icon: Icon.Wand,    label: "Generate cover letter",  run: () => {} },
    ];
    const templates = window.RESUME_TEMPLATES.map(t => ({
      grp: "Resume Templates", icon: Icon.Layout,
      label: `Switch to ${t.label}`,
      sub: t.hint,
      run: () => setRoute("resume"),
    }));
    const jobs = window.SAMPLE_JOBS.slice(0, 5).map(j => ({
      grp: "Recent jobs", icon: Icon.Briefcase,
      label: j.title,
      sub: `${j.company} · ${j.location}`,
      trailing: <span className="mono" style={{ fontSize: 10.5, color: "var(--fg-3)" }}>fit {j.fit}</span>,
      run: () => setRoute("pipeline"),
    }));
    return [...nav, ...actions, ...templates, ...jobs];
  }, []);

  const filtered = React.useMemo(() => {
    if (!q) return items;
    const ql = q.toLowerCase();
    return items.filter(i =>
      i.label.toLowerCase().includes(ql) ||
      (i.sub && i.sub.toLowerCase().includes(ql)) ||
      i.grp.toLowerCase().includes(ql)
    );
  }, [q, items]);

  React.useEffect(() => { setIdx(0); }, [q]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { onClose(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === "ArrowUp")   { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
      else if (e.key === "Enter" && filtered[idx]) {
        filtered[idx].run();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, idx, onClose]);

  if (!open) return null;

  // group items for rendering
  const grouped = [];
  let lastGrp = null;
  filtered.forEach(item => {
    if (item.grp !== lastGrp) {
      grouped.push({ grp: item.grp });
      lastGrp = item.grp;
    }
    grouped.push({ item });
  });

  let flatIdx = -1;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "start center",
        paddingTop: "10vh",
        animation: "fadein 0.12s",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(640px, 92vw)",
          maxHeight: "70vh",
          background: "var(--elev-2)",
          border: "1px solid var(--hair-strong)",
          borderRadius: 14,
          boxShadow: "0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)",
          overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px",
          borderBottom: "1px solid var(--hair)",
        }}>
          <Icon.Search size={16} className="text-3" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a command, search a job, or paste a URL..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 15,
              color: "var(--fg)",
            }}
          />
          <span className="kbd">esc</span>
        </div>

        {/* Results */}
        <div style={{ overflow: "auto", padding: "6px 6px 10px" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "28px 16px", textAlign: "center", color: "var(--fg-3)", fontSize: 13 }}>
              No results for "<span style={{ color: "var(--fg-2)" }}>{q}</span>"
            </div>
          )}
          {grouped.map((row, i) => {
            if (row.grp) return (
              <div key={"g"+i} className="eyebrow" style={{
                padding: "10px 12px 4px", fontSize: 9.5, color: "var(--fg-4)",
              }}>{row.grp}</div>
            );
            flatIdx++;
            const active = flatIdx === idx;
            const IconComp = row.item.icon;
            const cur = flatIdx;
            return (
              <div
                key={i}
                onMouseEnter={() => setIdx(cur)}
                onClick={() => { row.item.run(); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px",
                  borderRadius: 7,
                  background: active ? "rgba(34,211,238,0.10)" : "transparent",
                  color: active ? "var(--fg)" : "var(--fg-2)",
                  cursor: "pointer",
                  fontSize: 13,
                  border: active ? "1px solid rgba(34,211,238,0.25)" : "1px solid transparent",
                }}
              >
                <IconComp size={15} style={{ color: active ? "var(--cyan)" : "var(--fg-3)" }} />
                <span style={{ flex: 1, minWidth: 0, display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.item.label}</span>
                  {row.item.sub && (
                    <span style={{ fontSize: 11.5, color: "var(--fg-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.item.sub}</span>
                  )}
                </span>
                {row.item.trailing}
                {row.item.hint && (
                  <span className={row.item.kbd ? "mono" : "mono"} style={{ fontSize: 10.5, color: "var(--fg-4)", letterSpacing: "0.05em" }}>
                    {row.item.hint}
                  </span>
                )}
                {active && <Icon.Arrow size={13} style={{ color: "var(--cyan)" }} />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "9px 14px",
          borderTop: "1px solid var(--hair)",
          background: "var(--bg-1)",
          fontSize: 11,
          color: "var(--fg-3)",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="kbd">↵</span> to run
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <span className="kbd">↑</span><span className="kbd">↓</span> navigate
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <BrandMark size={14} />
            <span>Lakshya Hub</span>
          </span>
        </div>
      </div>
    </div>
  );
}

window.CmdK = CmdK;

})();
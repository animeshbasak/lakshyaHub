(function(){
/* ───────── App root: routing + shell + state ───────── */
var Sidebar = window.Sidebar, Topbar = window.Topbar, MobileTabBar = window.MobileTabBar, CmdK = window.CmdK, TweaksPanel = window.TweaksPanel, TWEAK_DEFAULTS = window.TWEAK_DEFAULTS;
var PageHome = window.PageHome, PageDiscover = window.PageDiscover, PagePipeline = window.PagePipeline, PageResume = window.PageResume, PageProfile = window.PageProfile, Icon = window.Icon;

function App() {
  // Persisted route
  const [route, setRoute] = React.useState(() => {
    try { return localStorage.getItem("lk_route") || "home"; } catch { return "home"; }
  });
  React.useEffect(() => { try { localStorage.setItem("lk_route", route); } catch {} }, [route]);

  // Tweaks state — persisted
  const [tweaks, setTweaks] = React.useState(() => {
    try {
      const raw = localStorage.getItem("lk_tweaks");
      return raw ? { ...TWEAK_DEFAULTS, ...JSON.parse(raw) } : TWEAK_DEFAULTS;
    } catch { return TWEAK_DEFAULTS; }
  });
  React.useEffect(() => { try { localStorage.setItem("lk_tweaks", JSON.stringify(tweaks)); } catch {} }, [tweaks]);

  // Sidebar collapsed
  const [collapsed, setCollapsed] = React.useState(tweaks.collapsedDefault);
  React.useEffect(() => { setCollapsed(tweaks.collapsedDefault); }, [tweaks.collapsedDefault]);

  // Mobile nav open
  const [mobileNav, setMobileNav] = React.useState(false);

  // CmdK
  const [cmdOpen, setCmdOpen] = React.useState(false);

  // Tweaks panel
  const [tweaksOpen, setTweaksOpen] = React.useState(false);

  // Discover auto-run key (bumped to trigger searches)
  const [runKey, setRunKey] = React.useState(0);
  const runSearch = () => setRunKey(k => k + 1);

  // Global keybinds
  React.useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") { e.preventDefault(); setCmdOpen(true); }
      else if (mod && e.key.toLowerCase() === "j") { e.preventDefault(); setRoute("discover"); runSearch(); }
      else if (e.key === "Escape") { setCmdOpen(false); setMobileNav(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Tweaks host protocol — register listener first, then announce
  React.useEffect(() => {
    const onMsg = (e) => {
      if (e.data?.type === "__activate_edit_mode") setTweaksOpen(true);
      else if (e.data?.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}
    return () => window.removeEventListener("message", onMsg);
  }, []);

  // Apply accent hue as CSS custom prop
  React.useEffect(() => {
    const hueMap = {
      cyan:    "#22d3ee",
      purple:  "#a855f7",
      emerald: "#34d399",
      amber:   "#fbbf24",
      mono:    "#d4d4d8",
    };
    document.documentElement.style.setProperty("--accent", hueMap[tweaks.accentHue] || hueMap.cyan);
    document.documentElement.style.setProperty("--grad-brand",
      tweaks.gradientIntensity === "flat"
        ? hueMap[tweaks.accentHue]
        : tweaks.gradientIntensity === "full"
          ? `linear-gradient(135deg, ${hueMap[tweaks.accentHue]} 0%, #a855f7 50%, #34d399 100%)`
          : `linear-gradient(135deg, ${hueMap[tweaks.accentHue]} 0%, #a855f7 100%)`
    );
    document.documentElement.setAttribute("data-density", tweaks.density);
    document.documentElement.setAttribute("data-nav", tweaks.navPattern);
  }, [tweaks.accentHue, tweaks.gradientIntensity, tweaks.density, tweaks.navPattern]);

  const PageComp = {
    home: PageHome,
    discover: PageDiscover,
    pipeline: PagePipeline,
    resume: PageResume,
    settings: PageProfile,
  }[route] || PageHome;

  const showSidebar = tweaks.navPattern !== "topbar";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: showSidebar
          ? (collapsed ? "var(--rail-w-collapsed) 1fr" : "var(--rail-w) 1fr")
          : "1fr",
        minHeight: "100vh",
        transition: "grid-template-columns 0.22s",
      }} className={`app-shell ${mobileNav ? "mobile-open" : ""}`}>

        {showSidebar && (
          <div className="sidebar-wrap">
            <Sidebar
              route={route}
              setRoute={(r) => { setRoute(r); setMobileNav(false); }}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              openCmdK={() => setCmdOpen(true)}
              onNewSearch={runSearch}
            />
          </div>
        )}

        <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar
            route={route}
            onToggleMobile={() => setMobileNav(!mobileNav)}
            openCmdK={() => setCmdOpen(true)}
            openTweaks={() => setTweaksOpen(!tweaksOpen)}
            autosave={route === "resume"}
          />
          <main style={{ flex: 1, minWidth: 0, overflow: "hidden", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <PageComp autoRunKey={runKey} />
          </main>
        </div>
      </div>

      {/* Mobile scrim */}
      {mobileNav && <div onClick={() => setMobileNav(false)} style={{
        position: "fixed", inset: 0, zIndex: 25,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
      }} />}

      {/* Mobile bottom tabs */}
      <MobileTabBar route={route} setRoute={setRoute} openCmdK={() => setCmdOpen(true)} />

      {/* CmdK */}
      <CmdK open={cmdOpen} onClose={() => setCmdOpen(false)} setRoute={setRoute} onRunSearch={runSearch} />

      {/* Tweaks */}
      <TweaksPanel open={tweaksOpen} onClose={() => setTweaksOpen(false)} tweaks={tweaks} setTweaks={setTweaks} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

})();
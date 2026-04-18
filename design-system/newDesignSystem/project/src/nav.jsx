(function(){
/* ───────── Nav Shell — sidebar + topbar + mobile tab bar ───────── */

var Icon = window.Icon;

const NAV_ITEMS = [
  { id: "home",     label: "Home",     icon: Icon.Home,      hint: "Overview" },
  { id: "discover", label: "Discover", icon: Icon.Search,    hint: "Find & match jobs", badge: { kind: "new", text: "LIVE" } },
  { id: "pipeline", label: "Pipeline", icon: Icon.Board,     hint: "Track applications", count: 12 },
  { id: "resume",   label: "Resume",   icon: Icon.Resume,    hint: "Builder + AI", status: "saved" },
];

const NAV_SECONDARY = [
  { id: "settings", label: "Settings", icon: Icon.Settings,  hint: "Profile & preferences" },
];

/* ───────── Brand logo — the ल-in-a-square mark, redrawn ───────── */
function BrandMark({ size = 28 }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: size * 0.28,
      background: "var(--grad-brand)",
      display: "grid", placeItems: "center",
      boxShadow: "0 2px 8px rgba(34,211,238,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <span style={{
        color: "#06060a",
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: size * 0.58,
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}>ल</span>
    </div>
  );
}

/* ───────── Sidebar rail ───────── */
function Sidebar({ route, setRoute, collapsed, setCollapsed, openCmdK, onNewSearch }) {
  return (
    <aside style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "var(--bg-1)",
      borderRight: "1px solid var(--hair)",
      padding: collapsed ? "12px 8px" : "12px 14px",
      transition: "padding 0.22s",
    }}>
      {/* Brand row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        height: 44, marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
          <BrandMark size={30} />
          {!collapsed && (
            <div style={{ lineHeight: 1.1, whiteSpace: "nowrap" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Lakshya</div>
              <div className="mono" style={{ fontSize: 9.5, color: "var(--fg-3)", letterSpacing: "0.12em" }}>HUB · v2</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            className="btn icon sm ghost"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            style={{ color: "var(--fg-3)" }}
          >
            <Icon.ChevsL size={14} />
          </button>
        )}
      </div>

      {/* Cmd+K trigger — feels like a real search, not a fake one */}
      <button
        onClick={openCmdK}
        title="Quick actions — ⌘K"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          height: 34,
          padding: collapsed ? 0 : "0 10px",
          justifyContent: collapsed ? "center" : "flex-start",
          width: "100%",
          borderRadius: 8,
          background: "var(--bg-inset)",
          border: "1px solid var(--hair)",
          color: "var(--fg-3)",
          fontSize: 12.5,
          transition: "all 0.15s",
          marginBottom: 6,
        }}
        onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--hair-hover)"; e.currentTarget.style.color = "var(--fg-2)"; }}
        onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--hair)"; e.currentTarget.style.color = "var(--fg-3)"; }}
      >
        <Icon.Search size={14} />
        {!collapsed && <>
          <span style={{ flex: 1, textAlign: "left" }}>Quick search...</span>
          <span style={{ display: "flex", gap: 3 }}>
            <span className="kbd">⌘</span>
            <span className="kbd">K</span>
          </span>
        </>}
      </button>

      {/* Primary CTA — pinned, gradient. 'Find Jobs' is the hero action */}
      <button
        onClick={() => { onNewSearch(); setRoute("discover"); }}
        className="btn primary"
        style={{
          width: "100%",
          height: 36,
          marginTop: 4,
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 12px",
          gap: 9,
        }}
      >
        <Icon.Bolt size={14} strokeWidth={2} fill="currentColor" />
        {!collapsed && <span>Find Jobs</span>}
        {!collapsed && <span style={{ marginLeft: "auto", fontSize: 10, opacity: 0.6, fontFamily: "var(--font-mono)" }}>⌘J</span>}
      </button>

      {/* Secondary CTA */}
      <button
        onClick={() => setRoute("resume")}
        className="btn ghost"
        style={{
          width: "100%",
          height: 32,
          marginTop: 6,
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 12px",
          gap: 9,
          color: "var(--fg-2)",
        }}
      >
        <Icon.Resume size={14} />
        {!collapsed && <span>Build Resume</span>}
      </button>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--hair)", margin: "14px 0 10px" }} />

      {/* Primary nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {!collapsed && <div className="eyebrow" style={{ padding: "0 10px 4px", fontSize: 10 }}>Workspace</div>}
        {NAV_ITEMS.map(item => (
          <NavItem key={item.id} item={item} active={route === item.id} collapsed={collapsed} onClick={() => setRoute(item.id)} />
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Secondary */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 10 }}>
        {NAV_SECONDARY.map(item => (
          <NavItem key={item.id} item={item} active={route === item.id} collapsed={collapsed} onClick={() => setRoute(item.id)} />
        ))}
      </div>

      {/* User card */}
      <UserCard collapsed={collapsed} onOpenSettings={() => setRoute("settings")} />

      {/* Collapsed: expand toggle pinned at bottom */}
      {collapsed && (
        <button
          className="btn icon sm ghost"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
          style={{ color: "var(--fg-3)", marginTop: 8, width: 32, alignSelf: "center" }}
        >
          <Icon.ChevsR size={14} />
        </button>
      )}
    </aside>
  );
}

function NavItem({ item, active, collapsed, onClick }) {
  const IconComp = item.icon;
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : ""}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 32,
        padding: collapsed ? 0 : "0 10px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 7,
        color: active ? "var(--fg)" : "var(--fg-2)",
        background: active ? "var(--bg-3)" : "transparent",
        border: active ? "1px solid var(--hair-strong)" : "1px solid transparent",
        transition: "all 0.12s",
        position: "relative",
        fontSize: 13,
        fontWeight: active ? 500 : 400,
      }}
      onMouseOver={(e) => { if (!active) { e.currentTarget.style.background = "var(--bg-2)"; e.currentTarget.style.color = "var(--fg)"; } }}
      onMouseOut={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--fg-2)"; } }}
    >
      {active && !collapsed && (
        <span style={{
          position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)",
          width: 2, height: 16, borderRadius: 2,
          background: "var(--grad-brand)",
        }} />
      )}
      <IconComp size={15} />
      {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>}
      {!collapsed && item.count != null && (
        <span className="mono" style={{
          fontSize: 10.5,
          color: "var(--fg-3)",
          padding: "1px 6px",
          borderRadius: 4,
          background: "var(--bg-3)",
          minWidth: 20,
          textAlign: "center",
        }}>{item.count}</span>
      )}
      {!collapsed && item.badge && (
        <span className="mono" style={{
          fontSize: 9, letterSpacing: "0.08em",
          color: "var(--emerald)",
          padding: "1px 5px",
          borderRadius: 4,
          background: "var(--emerald-dim)",
          fontWeight: 600,
        }}>{item.badge.text}</span>
      )}
      {!collapsed && item.status === "saved" && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--fg-3)" }}>
          <span className="dot" style={{ color: "var(--emerald)" }} />
          <span>saved</span>
        </span>
      )}
      {collapsed && item.count != null && (
        <span style={{
          position: "absolute", top: 2, right: 2,
          minWidth: 14, height: 14, padding: "0 4px",
          fontSize: 9, fontWeight: 600,
          borderRadius: 7,
          background: "var(--cyan)",
          color: "#06060a",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{item.count}</span>
      )}
    </button>
  );
}

function UserCard({ collapsed, onOpenSettings }) {
  return (
    <button
      onClick={onOpenSettings}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: collapsed ? 4 : 8,
        width: "100%",
        borderRadius: 8,
        border: "1px solid var(--hair)",
        background: "var(--bg-2)",
        transition: "all 0.15s",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      onMouseOver={(e) => { e.currentTarget.style.borderColor = "var(--hair-hover)"; }}
      onMouseOut={(e) => { e.currentTarget.style.borderColor = "var(--hair)"; }}
    >
      <div style={{
        width: 28, height: 28,
        borderRadius: 7,
        background: "linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)",
        display: "grid", placeItems: "center",
        color: "#06060a", fontWeight: 600, fontSize: 12,
        flexShrink: 0,
      }}>{window.PROFILE.initials}</div>
      {!collapsed && (
        <div style={{ flex: 1, minWidth: 0, textAlign: "left", lineHeight: 1.25 }}>
          <div style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{window.PROFILE.name}</div>
          <div style={{ fontSize: 10.5, color: "var(--fg-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Pro · 5 searches today</div>
        </div>
      )}
      {!collapsed && <Icon.ChevR size={13} style={{ color: "var(--fg-4)" }} />}
    </button>
  );
}

/* ───────── Topbar — contextual header ───────── */
function Topbar({ route, onToggleMobile, openCmdK, openTweaks, notifCount = 2, autosave }) {
  const routeLabels = {
    home: { title: "Home", crumb: "Overview" },
    discover: { title: "Discover", crumb: "Find jobs" },
    pipeline: { title: "Pipeline", crumb: "Applications" },
    resume: { title: "Resume", crumb: "Builder" },
    settings: { title: "Settings", crumb: "Profile" },
  };
  const r = routeLabels[route] || routeLabels.home;

  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      height: "var(--topbar-h)",
      padding: "0 18px",
      borderBottom: "1px solid var(--hair)",
      background: "rgba(11,11,18,0.7)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 20,
    }}>
      {/* Mobile menu */}
      <button
        className="btn icon sm ghost mobile-only"
        onClick={onToggleMobile}
        style={{ color: "var(--fg-2)" }}
      >
        <Icon.Menu size={16} />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{r.title}</span>
        <Icon.ChevR size={12} style={{ color: "var(--fg-4)" }} />
        <span style={{ fontSize: 12.5, color: "var(--fg-3)" }}>{r.crumb}</span>
      </div>

      {/* Context-specific status */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, minWidth: 0 }}>
        {route === "resume" && autosave && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--fg-3)" }}>
            <span className="dot" style={{ color: "var(--emerald)" }} />
            <span className="mono">auto-saved · 3s ago</span>
          </span>
        )}
        {route === "discover" && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--fg-3)" }}>
            <Icon.Globe size={12} />
            <span>Searching 47 sources in real-time</span>
          </span>
        )}
      </div>

      <button onClick={openCmdK} className="btn sm ghost" style={{ color: "var(--fg-3)" }}>
        <Icon.Cmd size={12} />
        <span>Command</span>
        <span style={{ display: "flex", gap: 3, marginLeft: 3 }}>
          <span className="kbd">⌘K</span>
        </span>
      </button>

      <button className="btn icon sm ghost" style={{ color: "var(--fg-3)", position: "relative" }} title="Notifications">
        <Icon.Bell size={15} />
        {notifCount > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            width: 7, height: 7, borderRadius: 999,
            background: "var(--cyan)",
            boxShadow: "0 0 0 2px var(--bg-1)",
          }} />
        )}
      </button>

      <button onClick={openTweaks} className="btn icon sm ghost" style={{ color: "var(--fg-3)" }} title="Tweaks">
        <Icon.Palette size={15} />
      </button>
    </header>
  );
}

/* ───────── Mobile bottom tab bar ───────── */
function MobileTabBar({ route, setRoute, openCmdK }) {
  const tabs = [
    { id: "home",     label: "Home",     icon: Icon.Home },
    { id: "discover", label: "Discover", icon: Icon.Search },
    { id: "_cta",     label: "Find",     icon: Icon.Bolt, cta: true },
    { id: "pipeline", label: "Pipeline", icon: Icon.Board },
    { id: "resume",   label: "Resume",   icon: Icon.Resume },
  ];

  return (
    <nav className="mobile-tabbar" style={{
      display: "none",
      position: "fixed",
      left: 0, right: 0, bottom: 0,
      height: 64,
      padding: "6px 8px calc(6px + env(safe-area-inset-bottom))",
      background: "rgba(11,11,18,0.92)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderTop: "1px solid var(--hair)",
      zIndex: 30,
      alignItems: "center",
      justifyContent: "space-around",
    }}>
      {tabs.map(tab => {
        const IconComp = tab.icon;
        if (tab.cta) return (
          <button
            key={tab.id}
            onClick={openCmdK}
            style={{
              width: 48, height: 48,
              borderRadius: 14,
              background: "var(--grad-brand)",
              display: "grid", placeItems: "center",
              color: "#06060a",
              boxShadow: "0 8px 20px rgba(34,211,238,0.35)",
              transform: "translateY(-10px)",
            }}
          ><IconComp size={20} fill="currentColor" strokeWidth={1.5} /></button>
        );
        const active = route === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setRoute(tab.id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "4px 10px",
              color: active ? "var(--cyan)" : "var(--fg-3)",
              minWidth: 50,
            }}
          >
            <IconComp size={18} strokeWidth={active ? 2 : 1.6} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

window.Sidebar = Sidebar;
window.Topbar = Topbar;
window.MobileTabBar = MobileTabBar;
window.BrandMark = BrandMark;

})();
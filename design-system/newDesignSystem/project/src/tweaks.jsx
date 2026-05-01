(function(){
/* ───────── Tweaks panel — in-prototype controls ───────── */
var Icon = window.Icon;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "navPattern": "sidebar",
  "gradientIntensity": "signature",
  "accentHue": "cyan",
  "density": "cozy",
  "collapsedDefault": false,
  "showBadges": true,
  "dimLandmark": false
}/*EDITMODE-END*/;

function TweaksPanel({ open, onClose, tweaks, setTweaks }) {
  if (!open) return null;

  const set = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    try {
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
    } catch {}
  };

  return (
    <div style={{
      position: "fixed",
      right: 16, bottom: 16,
      width: 320,
      maxHeight: "80vh",
      zIndex: 90,
      background: "var(--elev-2)",
      border: "1px solid var(--hair-strong)",
      borderRadius: 14,
      boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
      overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 14px",
        borderBottom: "1px solid var(--hair)",
      }}>
        <Icon.Palette size={14} style={{ color: "var(--cyan)" }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Tweaks</span>
        <span className="mono" style={{ fontSize: 10, color: "var(--fg-4)", marginLeft: 4 }}>
          try different design directions
        </span>
        <button onClick={onClose} className="btn icon sm ghost" style={{ marginLeft: "auto", color: "var(--fg-3)" }}>
          <Icon.X size={13} />
        </button>
      </div>

      <div style={{ overflow: "auto", padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
        <TweakGroup label="Nav pattern">
          <SegOpts
            value={tweaks.navPattern}
            onChange={(v) => set("navPattern", v)}
            opts={[
              { id: "sidebar", label: "Sidebar" },
              { id: "topbar",  label: "Top bar" },
              { id: "dock",    label: "Dock" },
            ]}
          />
        </TweakGroup>

        <TweakGroup label="Accent hue">
          <div style={{ display: "flex", gap: 6 }}>
            {["cyan", "purple", "emerald", "amber", "mono"].map(h => (
              <button
                key={h}
                onClick={() => set("accentHue", h)}
                title={h}
                style={{
                  width: 30, height: 30, borderRadius: 7,
                  background: h === "mono" ? "#d4d4d8" : `var(--${h})`,
                  border: tweaks.accentHue === h ? "2px solid var(--fg)" : "2px solid transparent",
                  boxShadow: "0 0 0 1px var(--hair)",
                }}
              />
            ))}
          </div>
        </TweakGroup>

        <TweakGroup label="Gradient intensity">
          <SegOpts
            value={tweaks.gradientIntensity}
            onChange={(v) => set("gradientIntensity", v)}
            opts={[
              { id: "full",      label: "Full" },
              { id: "signature", label: "Signature" },
              { id: "flat",      label: "Flat" },
            ]}
          />
        </TweakGroup>

        <TweakGroup label="Density">
          <SegOpts
            value={tweaks.density}
            onChange={(v) => set("density", v)}
            opts={[
              { id: "compact", label: "Compact" },
              { id: "cozy",    label: "Cozy" },
              { id: "roomy",   label: "Roomy" },
            ]}
          />
        </TweakGroup>

        <TweakGroup label="Behavior">
          <Toggle
            label="Sidebar collapsed by default"
            on={tweaks.collapsedDefault}
            onChange={(v) => set("collapsedDefault", v)}
          />
          <Toggle
            label="Show live status badges"
            on={tweaks.showBadges}
            onChange={(v) => set("showBadges", v)}
          />
          <Toggle
            label="Show landmark (dark haze)"
            on={tweaks.dimLandmark}
            onChange={(v) => set("dimLandmark", v)}
          />
        </TweakGroup>

        <div style={{ fontSize: 10.5, color: "var(--fg-4)", borderTop: "1px solid var(--hair)", paddingTop: 10 }}>
          Changes persist via localStorage. Press <span className="kbd">⌘K</span> anytime to explore actions.
        </div>
      </div>
    </div>
  );
}

function TweakGroup({ label, children }) {
  return (
    <div>
      <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 7 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{children}</div>
    </div>
  );
}

function SegOpts({ value, onChange, opts }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${opts.length}, 1fr)`,
      gap: 2,
      padding: 2,
      background: "var(--bg-inset)",
      border: "1px solid var(--hair)",
      borderRadius: 8,
    }}>
      {opts.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            height: 26,
            fontSize: 11.5,
            borderRadius: 6,
            color: value === o.id ? "var(--fg)" : "var(--fg-3)",
            background: value === o.id ? "var(--bg-3)" : "transparent",
            fontWeight: value === o.id ? 500 : 400,
            border: value === o.id ? "1px solid var(--hair-hover)" : "1px solid transparent",
          }}
        >{o.label}</button>
      ))}
    </div>
  );
}

function Toggle({ label, on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 2px",
        color: "var(--fg-2)",
        fontSize: 12,
      }}
    >
      <span style={{
        width: 28, height: 16, borderRadius: 999,
        background: on ? "var(--cyan)" : "var(--bg-3)",
        border: "1px solid var(--hair)",
        position: "relative",
        transition: "all 0.15s",
      }}>
        <span style={{
          position: "absolute",
          top: 1, left: on ? 13 : 1,
          width: 12, height: 12, borderRadius: 999,
          background: "#06060a",
          transition: "left 0.15s",
        }} />
      </span>
      <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
    </button>
  );
}

window.TweaksPanel = TweaksPanel;
window.TWEAK_DEFAULTS = TWEAK_DEFAULTS;

})();
'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Palette, X } from 'lucide-react'
import { toast } from 'sonner'

type AccentHue = 'cyan' | 'purple' | 'emerald' | 'amber' | 'mono'
type GradientIntensity = 'full' | 'signature' | 'flat'
type Density = 'compact' | 'cozy' | 'roomy'
export type NavPattern = 'sidebar' | 'topbar' | 'dock'

type Tweaks = {
  accentHue: AccentHue
  gradientIntensity: GradientIntensity
  density: Density
  navPattern: NavPattern
  sidebarCollapsedDefault: boolean
  showBadges: boolean
}

const DEFAULTS: Tweaks = {
  accentHue: 'cyan',
  gradientIntensity: 'signature',
  density: 'cozy',
  navPattern: 'sidebar',
  sidebarCollapsedDefault: false,
  showBadges: true,
}

const HUE_MAP: Record<AccentHue, string> = {
  cyan: '#22d3ee',
  purple: '#a855f7',
  emerald: '#34d399',
  amber: '#fbbf24',
  mono: '#d4d4d8',
}

const DENSITY_SCALE: Record<Density, string> = {
  compact: '0.88',
  cozy: '1',
  roomy: '1.1',
}

type Ctx = {
  tweaks: Tweaks
  set: <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => void
  open: () => void
  close: () => void
}
const TweaksCtx = createContext<Ctx>({
  tweaks: DEFAULTS,
  set: () => {},
  open: () => {},
  close: () => {},
})
export const useTweaks = () => useContext(TweaksCtx)

function applyTweaks(t: Tweaks) {
  const root = document.documentElement
  const hue = HUE_MAP[t.accentHue]

  root.style.setProperty('--accent', hue)
  root.style.setProperty('--cyan', hue)
  root.style.setProperty(
    '--cyan-dim',
    hue === HUE_MAP.mono ? 'rgba(212,212,216,0.14)' : hexToRgba(hue, 0.14)
  )
  root.style.setProperty('--cyan-border', hexToRgba(hue, 0.3))

  const grad =
    t.gradientIntensity === 'flat'
      ? hue
      : t.gradientIntensity === 'full'
        ? `linear-gradient(135deg, ${hue} 0%, #a855f7 50%, #34d399 100%)`
        : `linear-gradient(135deg, ${hue} 0%, #a855f7 100%)`
  root.style.setProperty('--grad-brand', grad)
  root.style.setProperty('--gradient-primary', grad)

  root.setAttribute('data-density', t.density)
  root.style.setProperty('--density-scale', DENSITY_SCALE[t.density])

  root.setAttribute('data-nav-pattern', t.navPattern)
}

function hexToRgba(hex: string, a: number) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}

export function TweaksProvider({ children }: { children: React.ReactNode }) {
  const [tweaks, setTweaks] = useState<Tweaks>(DEFAULTS)
  const [isOpen, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lk_tweaks')
      if (raw) setTweaks({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    applyTweaks(tweaks)
    try {
      localStorage.setItem('lk_tweaks', JSON.stringify(tweaks))
    } catch {}
  }, [tweaks, hydrated])

  const ctx = useMemo<Ctx>(
    () => ({
      tweaks,
      set: (k, v) => setTweaks((t) => ({ ...t, [k]: v })),
      open: () => setOpen(true),
      close: () => setOpen(false),
    }),
    [tweaks]
  )

  return (
    <TweaksCtx.Provider value={ctx}>
      {children}
      {isOpen && <TweaksPanel onClose={() => setOpen(false)} />}
    </TweaksCtx.Provider>
  )
}

function TweaksPanel({ onClose }: { onClose: () => void }) {
  const { tweaks, set } = useTweaks()
  const setNavPattern = (v: NavPattern) => {
    if (v === 'dock') {
      toast('Dock nav — coming soon. Falling back to sidebar.')
      set('navPattern', 'sidebar')
      return
    }
    set('navPattern', v)
  }
  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        width: 320,
        maxHeight: '80vh',
        zIndex: 90,
        background: 'var(--elev-2)',
        border: '1px solid var(--hair-strong)',
        borderRadius: 14,
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 14px',
          borderBottom: '1px solid var(--hair)',
        }}
      >
        <Palette size={14} color="var(--cyan)" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Tweaks</span>
        <span
          className="mono"
          style={{ fontSize: 10, color: 'var(--fg-4)', marginLeft: 4 }}
        >
          try different design directions
        </span>
        <button
          onClick={onClose}
          className="btn icon sm ghost"
          style={{ marginLeft: 'auto', color: 'var(--fg-3)' }}
        >
          <X size={13} />
        </button>
      </div>

      <div
        style={{
          overflow: 'auto',
          padding: '10px 14px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <Group label="Nav pattern">
          <Seg
            value={tweaks.navPattern}
            onChange={(v) => setNavPattern(v as NavPattern)}
            opts={[
              { id: 'sidebar', label: 'Sidebar' },
              { id: 'topbar', label: 'Top bar' },
              { id: 'dock', label: 'Dock' },
            ]}
          />
        </Group>

        <Group label="Accent hue">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['cyan', 'purple', 'emerald', 'amber', 'mono'] as AccentHue[]).map((h) => (
              <button
                key={h}
                onClick={() => set('accentHue', h)}
                title={h}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  background: HUE_MAP[h],
                  border:
                    tweaks.accentHue === h
                      ? '2px solid var(--fg)'
                      : '2px solid transparent',
                  boxShadow: '0 0 0 1px var(--hair)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </Group>

        <Group label="Gradient intensity">
          <Seg
            value={tweaks.gradientIntensity}
            onChange={(v) => set('gradientIntensity', v as GradientIntensity)}
            opts={[
              { id: 'full', label: 'Full' },
              { id: 'signature', label: 'Signature' },
              { id: 'flat', label: 'Flat' },
            ]}
          />
        </Group>

        <Group label="Density">
          <Seg
            value={tweaks.density}
            onChange={(v) => set('density', v as Density)}
            opts={[
              { id: 'compact', label: 'Compact' },
              { id: 'cozy', label: 'Cozy' },
              { id: 'roomy', label: 'Roomy' },
            ]}
          />
        </Group>

        <Group label="Behavior">
          <Toggle
            label="Sidebar collapsed by default"
            on={tweaks.sidebarCollapsedDefault}
            onChange={(v) => set('sidebarCollapsedDefault', v)}
          />
          <Toggle
            label="Show live status badges"
            on={tweaks.showBadges}
            onChange={(v) => set('showBadges', v)}
          />
        </Group>

        <div
          style={{
            fontSize: 10.5,
            color: 'var(--fg-4)',
            borderTop: '1px solid var(--hair)',
            paddingTop: 10,
          }}
        >
          Changes persist locally. Press <span className="kbd">⌘K</span> for actions.
        </div>
      </div>
    </div>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow" style={{ fontSize: 9.5, marginBottom: 7 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  )
}

function Seg({
  value,
  onChange,
  opts,
}: {
  value: string
  onChange: (v: string) => void
  opts: Array<{ id: string; label: string }>
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${opts.length}, 1fr)`,
        gap: 2,
        padding: 2,
        background: 'var(--bg-inset)',
        border: '1px solid var(--hair)',
        borderRadius: 8,
      }}
    >
      {opts.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            height: 26,
            fontSize: 11.5,
            borderRadius: 6,
            color: value === o.id ? 'var(--fg)' : 'var(--fg-3)',
            background: value === o.id ? 'var(--bg-3)' : 'transparent',
            fontWeight: value === o.id ? 500 : 400,
            border:
              value === o.id ? '1px solid var(--hair-hover)' : '1px solid transparent',
            cursor: 'pointer',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string
  on: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 2px',
        color: 'var(--fg-2)',
        fontSize: 12,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          width: 28,
          height: 16,
          borderRadius: 999,
          background: on ? 'var(--cyan)' : 'var(--bg-3)',
          border: '1px solid var(--hair)',
          position: 'relative',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 1,
            left: on ? 13 : 1,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: '#06060a',
            transition: 'left 0.15s',
          }}
        />
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  )
}

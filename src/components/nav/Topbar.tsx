'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, ChevronRight, Command, Home, Search, Kanban, FileText, Palette, Target } from 'lucide-react'
import { useCmdK } from './CmdKProvider'
import { useTweaks } from './TweaksProvider'
import { BrandMark } from './BrandMark'

const ROUTE_META: Record<string, { title: string; crumb: string }> = {
  '/dashboard': { title: 'Home', crumb: 'Overview' },
  '/evaluate': { title: 'Evaluate', crumb: 'JD eval' },
  '/discover': { title: 'Discover', crumb: 'Find jobs' },
  '/board': { title: 'Pipeline', crumb: 'Applications' },
  '/resume': { title: 'Resume', crumb: 'Builder' },
  '/profile': { title: 'Profile', crumb: 'Account' },
}

const TOPBAR_NAV = [
  { href: '/dashboard', label: 'Home', Icon: Home },
  { href: '/evaluate', label: 'Evaluate', Icon: Target },
  { href: '/discover', label: 'Discover', Icon: Search },
  { href: '/board', label: 'Pipeline', Icon: Kanban },
  { href: '/resume', label: 'Resume', Icon: FileText },
]

export function Topbar() {
  const pathname = usePathname()
  const { open } = useCmdK()
  const { open: openTweaks } = useTweaks()
  const key =
    Object.keys(ROUTE_META).find((k) => pathname === k || pathname.startsWith(k + '/')) ??
    '/dashboard'
  const meta = ROUTE_META[key]

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 'var(--topbar-h)',
        padding: '0 18px',
        borderBottom: '1px solid var(--hair)',
        background: 'rgba(11,11,18,0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Brand + nav links — only visible in topbar nav pattern */}
      <div
        data-topbar-nav
        style={{
          display: 'none',
          alignItems: 'center',
          gap: 14,
          minWidth: 0,
        }}
      >
        <Link
          href="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <BrandMark size={22} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Lakshya</span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {TOPBAR_NAV.map((it) => {
            const active = pathname === it.href || pathname.startsWith(it.href + '/')
            const I = it.Icon
            return (
              <Link
                key={it.href}
                href={it.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '0 10px',
                  height: 28,
                  borderRadius: 7,
                  fontSize: 12.5,
                  color: active ? 'var(--fg)' : 'var(--fg-2)',
                  background: active ? 'var(--bg-3)' : 'transparent',
                  border: active ? '1px solid var(--hair-strong)' : '1px solid transparent',
                  fontWeight: active ? 500 : 400,
                }}
              >
                <I size={13} />
                <span>{it.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div
        data-topbar-crumb
        style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}
      >
        <span style={{ fontSize: 13, fontWeight: 500 }}>{meta.title}</span>
        <ChevronRight size={12} color="var(--fg-4)" />
        <span style={{ fontSize: 12.5, color: 'var(--fg-3)' }}>{meta.crumb}</span>
      </div>

      <div style={{ flex: 1 }} />

      <button onClick={open} className="btn sm ghost" style={{ color: 'var(--fg-3)' }}>
        <Command size={12} />
        <span>Command</span>
        <span className="kbd" style={{ marginLeft: 3 }}>
          ⌘K
        </span>
      </button>

      <button
        className="btn icon sm ghost"
        style={{ color: 'var(--fg-3)', position: 'relative' }}
        title="Notifications"
      >
        <Bell size={15} />
      </button>

      <button
        onClick={openTweaks}
        className="btn icon sm ghost"
        style={{ color: 'var(--fg-3)' }}
        title="Tweaks — accent, gradient, density"
      >
        <Palette size={15} />
      </button>
    </header>
  )
}

'use client'
import { usePathname } from 'next/navigation'
import { Bell, ChevronRight, Command } from 'lucide-react'
import { useCmdK } from './CmdKProvider'

const ROUTE_META: Record<string, { title: string; crumb: string }> = {
  '/dashboard': { title: 'Home', crumb: 'Overview' },
  '/discover': { title: 'Discover', crumb: 'Find jobs' },
  '/board': { title: 'Pipeline', crumb: 'Applications' },
  '/resume': { title: 'Resume', crumb: 'Builder' },
  '/profile': { title: 'Settings', crumb: 'Profile' },
}

export function Topbar() {
  const pathname = usePathname()
  const { open } = useCmdK()
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
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
    </header>
  )
}

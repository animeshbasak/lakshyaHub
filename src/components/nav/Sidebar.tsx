'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Home,
  Search,
  Kanban,
  FileText,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { BrandMark } from './BrandMark'
import { useCmdK } from './CmdKProvider'
import { useTweaks } from './TweaksProvider'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/discover', label: 'Discover', icon: Search, badge: 'LIVE' },
  { href: '/board', label: 'Pipeline', icon: Kanban },
  { href: '/resume', label: 'Resume', icon: FileText },
]

const NAV_SECONDARY = [{ href: '/profile', label: 'Profile', icon: Settings }]

function getInitials(user: User): string {
  const name = user.user_metadata?.full_name as string | undefined
  if (name) return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return (user.email?.[0] ?? '?').toUpperCase()
}
function getDisplayName(user: User): string {
  return (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'User'
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { open: openCmdK } = useCmdK()
  const { tweaks } = useTweaks()
  const [user, setUser] = useState<User | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    try {
      const v = localStorage.getItem('lk_sidebar_collapsed')
      if (v === '1') setCollapsed(true)
    } catch {}
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem('lk_sidebar_collapsed', collapsed ? '1' : '0')
    } catch {}
  }, [collapsed])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await createClient().auth.signOut()
    } finally {
      router.push('/login')
    }
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <aside
      data-nav-role="sidebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: collapsed ? 'var(--rail-w-collapsed)' : 'var(--rail-w)',
        background: 'var(--bg-1)',
        borderRight: '1px solid var(--hair)',
        padding: collapsed ? '12px 8px' : '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'width 0.22s, padding 0.22s',
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          height: 44,
          marginBottom: 14,
        }}
      >
        <Link
          href="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}
        >
          <BrandMark size={30} />
          {!collapsed && (
            <div style={{ lineHeight: 1.1, whiteSpace: 'nowrap' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Lakshya</div>
              <div
                className="mono"
                style={{ fontSize: 9.5, color: 'var(--fg-3)', letterSpacing: '0.12em' }}
              >
                HUB · v2
              </div>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            className="btn icon sm ghost"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            style={{ color: 'var(--fg-3)' }}
          >
            <ChevronsLeft size={14} />
          </button>
        )}
      </div>

      {/* CmdK trigger */}
      <button
        onClick={openCmdK}
        title="Quick actions — ⌘K"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          height: 34,
          padding: collapsed ? 0 : '0 10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          width: '100%',
          borderRadius: 8,
          background: 'var(--bg-inset)',
          border: '1px solid var(--hair)',
          color: 'var(--fg-3)',
          fontSize: 12.5,
          marginBottom: 6,
          cursor: 'pointer',
        }}
      >
        <Search size={14} />
        {!collapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left' }}>Quick search...</span>
            <span style={{ display: 'flex', gap: 3 }}>
              <span className="kbd">⌘</span>
              <span className="kbd">K</span>
            </span>
          </>
        )}
      </button>

      {/* Primary CTA */}
      <Link
        href="/discover"
        className="btn primary"
        style={{
          width: '100%',
          height: 36,
          marginTop: 4,
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 12px',
          gap: 9,
        }}
      >
        <Zap size={14} fill="currentColor" />
        {!collapsed && <span>Find Jobs</span>}
        {!collapsed && (
          <span
            style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.6 }}
            className="mono"
          >
            ⌘J
          </span>
        )}
      </Link>

      <div style={{ height: 1, background: 'var(--hair)', margin: '14px 0 10px' }} />

      {/* Primary nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!collapsed && (
          <div
            className="eyebrow"
            style={{ padding: '0 10px 4px', fontSize: 10 }}
          >
            Workspace
          </div>
        )}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            Icon={item.icon}
            badge={tweaks.showBadges ? item.badge : undefined}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 10 }}>
        {NAV_SECONDARY.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            Icon={item.icon}
            active={isActive(item.href)}
            collapsed={collapsed}
          />
        ))}
      </div>

      {/* User card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: collapsed ? 4 : 8,
          width: '100%',
          borderRadius: 8,
          border: '1px solid var(--hair)',
          background: 'var(--bg-2)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: 'var(--bg-3)',
            border: '1px solid var(--hair)',
            display: 'grid',
            placeItems: 'center',
            color: 'var(--fg)',
            fontWeight: 600,
            fontSize: 12,
            flexShrink: 0,
          }}
        >
          {user ? getInitials(user) : '…'}
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left', lineHeight: 1.25 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user ? getDisplayName(user) : '—'}
            </div>
            <div
              style={{
                fontSize: 10.5,
                color: 'var(--fg-3)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email ?? 'loading…'}
            </div>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn icon sm ghost"
            title="Sign out"
            style={{ color: 'var(--fg-3)' }}
          >
            <LogOut size={13} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          className="btn icon sm ghost"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
          style={{ color: 'var(--fg-3)', marginTop: 8, alignSelf: 'center' }}
        >
          <ChevronsRight size={14} />
        </button>
      )}
    </aside>
  )
}

type NavLinkProps = {
  href: string
  label: string
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  badge?: string
  active: boolean
  collapsed: boolean
}

function NavLink({ href, label, Icon, badge, active, collapsed }: NavLinkProps) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={twMerge(
        'group',
        'transition-all'
      )}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: 32,
        padding: collapsed ? 0 : '0 10px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        borderRadius: 7,
        color: active ? 'var(--fg)' : 'var(--fg-2)',
        background: active ? 'var(--bg-3)' : 'transparent',
        border: active
          ? '1px solid var(--hair-strong)'
          : '1px solid transparent',
        position: 'relative',
        fontSize: 13,
        fontWeight: active ? 500 : 400,
      }}
    >
      {active && !collapsed && (
        <span
          style={{
            position: 'absolute',
            left: -14,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 2,
            height: 16,
            borderRadius: 2,
            background: 'var(--grad-brand)',
          }}
        />
      )}
      <Icon size={15} />
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && badge && (
        <span
          className="mono"
          style={{
            fontSize: 9,
            letterSpacing: '0.08em',
            color: 'var(--emerald)',
            padding: '1px 5px',
            borderRadius: 4,
            background: 'var(--emerald-dim)',
            fontWeight: 600,
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  )
}

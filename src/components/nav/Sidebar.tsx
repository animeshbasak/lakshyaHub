'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Compass, Kanban, FileText, UserCircle, LogOut } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/discover',  label: 'Match Jobs', icon: Compass },
  { href: '/board',     label: 'Job Board',  icon: Kanban },
  { href: '/resume',    label: 'Resume Hub', icon: FileText },
  { href: '/profile',   label: 'Profile',    icon: UserCircle },
]

function getInitials(user: User): string {
  const name = user.user_metadata?.full_name as string | undefined
  if (name) {
    return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  }
  return (user.email?.[0] ?? '?').toUpperCase()
}

function getDisplayName(user: User): string {
  return (user.user_metadata?.full_name as string | undefined)
    ?? user.email
    ?? 'User'
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[logout] signOut failed:', err)
    } finally {
      router.push('/login')
    }
  }

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-bg-card border-r border-white/5 flex flex-col z-50">
      {/* Logo */}
      <Link href="/dashboard" className="p-6 block hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-white font-bold text-xl">ल</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight leading-none">Lakshya</span>
            <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Hub</span>
          </div>
        </div>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {NAV_LINKS.map((link) => {
          const Icon = link.icon
          const active = pathname === link.href ||
            (link.href !== '/dashboard' && pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              href={link.href}
              className={twMerge(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium',
                active
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]'
                  : 'text-text-2 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className={twMerge(
                'w-5 h-5 transition-colors',
                active ? 'text-cyan-400' : 'text-text-muted group-hover:text-text-2'
              )} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer — real user */}
      <div className="p-4 mt-auto border-t border-white/5">
        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold shrink-0 text-sm">
              {user ? getInitials(user) : '…'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">
                {user ? getDisplayName(user) : '—'}
              </span>
              <span className="text-[10px] text-text-muted truncate uppercase tracking-wider">
                {user?.email ?? 'loading…'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all text-xs border border-transparent hover:border-red-500/20 disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </div>
    </aside>
  )
}

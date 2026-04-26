import { AuthGate } from '@/components/layout/AuthGate'
import { Sidebar } from '@/components/nav/Sidebar'
import { Topbar } from '@/components/nav/Topbar'
import { CmdKProvider } from '@/components/nav/CmdKProvider'
import { TweaksProvider } from '@/components/nav/TweaksProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <TweaksProvider>
      <CmdKProvider>
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
          <Sidebar />
          <div
            data-nav-shell="content"
            style={{
              marginLeft: 'var(--nav-shell-ml)',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Topbar />
            <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
          </div>
        </div>
      </CmdKProvider>
      </TweaksProvider>
    </AuthGate>
  )
}

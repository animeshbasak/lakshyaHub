import { AuthGate } from '@/components/layout/AuthGate'
import { Sidebar } from '@/components/nav/Sidebar'
import { Topbar } from '@/components/nav/Topbar'
import { CmdKProvider } from '@/components/nav/CmdKProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <CmdKProvider>
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
          <Sidebar />
          <div
            style={{
              marginLeft: 'var(--rail-w)',
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
    </AuthGate>
  )
}

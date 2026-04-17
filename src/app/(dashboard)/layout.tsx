// src/app/(dashboard)/layout.tsx
import { AuthGate } from '@/components/layout/AuthGate'
import { Sidebar } from '@/components/nav/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGate>
  )
}

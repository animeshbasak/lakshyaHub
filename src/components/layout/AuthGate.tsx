'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'

const OnboardingModal = dynamic(
  () => import('@/components/onboarding/OnboardingModal'),
  { ssr: false }
)

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    let supabase: ReturnType<typeof createClient>

    try {
      supabase = createClient()
    } catch {
      // Supabase env vars missing — redirect to login
      router.push('/login')
      return
    }

    // Use getUser() not getSession() — getSession returns the locally cached
    // JWT without re-validating with Supabase Auth. Per Supabase docs, never
    // make security decisions on getSession() output. Real enforcement is the
    // server middleware (src/middleware.ts); this is a UX guard.
    supabase.auth.getUser()
      .then(async ({ data: { user } }) => {
        if (!user) {
          router.push('/login')
          return
        }
        setAuthenticated(true)
        setLoading(false)

        // Check if user has a resume_profile; show onboarding if not
        try {
          const { count } = await supabase
            .from('resume_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('id', user.id)

          if ((count ?? 0) === 0) {
            setShowOnboarding(true)
          }
        } catch {
          // Non-fatal: silently skip onboarding check on error
        }
      })
      .catch(() => {
        router.push('/login')
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/login')
          return
        }
        setAuthenticated(true)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg text-text-muted font-mono">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-white/60 mb-4 animate-spin shadow-lg shadow-black/30" />
      <span className="text-xs uppercase tracking-widest animate-pulse">Initialising Lakshya...</span>
    </div>
  )

  if (!authenticated) return null

  return (
    <>
      {children}
      <OnboardingModal isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />
    </>
  )
}

// src/app/login/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Sparkles, ArrowRight, GitBranch, Mail } from 'lucide-react'

type LoginPhase = 'email' | 'code'

export default function LoginPage() {
  const [phase, setPhase] = useState<LoginPhase>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  // Resend cooldown — Supabase rate-limits OTP sends to 1 per email per 60s
  // by default. We mirror that on the client so spam-clicks don't trigger
  // a confusing `over_email_send_rate_limit` toast.
  const [cooldownEndsAt, setCooldownEndsAt] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (cooldownEndsAt === 0) return
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((cooldownEndsAt - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) setCooldownEndsAt(0)
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [cooldownEndsAt])
  // Lazy-init: @supabase/ssr's createBrowserClient touches document.cookie,
  // undefined during SSR. Calling at the top of the component body throws
  // on the server pass under Next.js 16 + Turbopack and the page renders
  // as the Suspense fallback (null → blank page). useState's lazy
  // initializer runs once on client mount only.
  const [supabase] = useState(() => createClient())

  // Send OTP to email. We send WITHOUT emailRedirectTo so the email
  // template's {{ .Token }} (6-digit code) path is the user's expected
  // affordance. The link path still works if the user clicks it
  // (Supabase emails include both unless the dashboard template is
  // overridden), but the code path is the one we instruct them to use —
  // bypasses Gmail / Outlook link-prefetcher consuming the OTP before
  // the user clicks (the otp_expired error users were hitting).
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // shouldCreateUser default is true — first-time emails create the user.
        // No emailRedirectTo: forces the email template's code path to be the
        // primary user-facing instruction.
      },
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Code sent — check your email.')
      setPhase('code')
    }
    setLoading(false)
  }

  // Verify the 6-digit code. type: 'email' is the standard for email-OTP
  // (vs 'magiclink' which is for the URL-click flow we're moving away from).
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 6) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Signed in.')
      // refresh BEFORE push so the layout's RSC cache invalidates first;
      // /dashboard's AuthGate then sees the just-set sb-*-auth-token cookie
      // when it does its server-side getUser().
      router.refresh()
      router.push('/dashboard')
    } finally {
      // Always reset loading — covers happy-path (button unfreezes if user
      // hits Back from /dashboard) and error path symmetrically.
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    // Race + rate-limit guard: don't fire while a request is already in
    // flight, and don't fire while the 60s Supabase cooldown is active.
    if (loading || secondsLeft > 0) return
    setCode('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('New code sent.')
      setCooldownEndsAt(Date.now() + 60_000)
    }
    setLoading(false)
  }

  const handleBackToEmail = () => {
    setPhase('email')
    setCode('')
    setCooldownEndsAt(0)
  }

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-white to-white/60 shadow-xl shadow-black/30 mx-auto mb-6 flex items-center justify-center text-white">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
          <p className="text-text-muted">Sign in to your unified career dashboard</p>
        </div>

        <div className="p-8 rounded-[32px] bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-2xl">
          <div className="space-y-4 mb-8">
            <button 
              onClick={() => handleSocialLogin('github')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white text-bg font-bold hover:scale-[1.02] transition-all"
            >
              <GitBranch className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <span className="relative px-4 text-[10px] font-black uppercase tracking-widest text-white/30 bg-[#0A0A0B]">
              {phase === 'email' ? 'Or Email Code' : 'Enter Your Code'}
            </span>
          </div>

          {phase === 'email' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:border-white/25 outline-none transition-all"
                />
              </div>
              <button
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Email me a code
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] pl-1">
                  6-digit code sent to {email}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-center text-2xl tracking-[0.6em] font-mono text-white focus:border-white/25 outline-none transition-all"
                />
              </div>
              <button
                disabled={loading || code.length < 6}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white animate-spin rounded-full" />
                ) : (
                  <>
                    Verify code
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </>
                )}
              </button>
              <div className="flex items-center justify-between text-[11px] text-text-muted pt-2">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="hover:text-white transition-colors"
                >
                  ← Use a different email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || secondsLeft > 0}
                  className="hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center mt-8 text-[11px] text-text-muted font-medium uppercase tracking-widest">
          Secure Authentication by <span className="text-white">Supabase</span>
        </p>
      </motion.div>
    </div>
  )
}

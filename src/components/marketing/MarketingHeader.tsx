import Link from 'next/link'

interface Props {
  /** Highlight the current page in the nav. */
  active?: 'home' | 'pricing' | 'about' | null
}

const NAV: { href: string; label: string; key: NonNullable<Props['active']> }[] = [
  { href: '/pricing', label: 'Pricing', key: 'pricing' },
  { href: '/about',   label: 'About',   key: 'about'   },
]

/**
 * Unified header for all public marketing pages (/, /pricing, /about, future /guides).
 *
 * Goals:
 *   - Always-on path to Pricing, About, Sign in, Start free.
 *   - No authenticated-only routes exposed (those go in /dashboard sidebar).
 *   - Mobile: condensed but still shows all 4 destinations.
 *   - Highlight the current page so users know where they are.
 */
export function MarketingHeader({ active = null }: Props) {
  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-[#07070b]/85 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto max-w-5xl h-14 px-4 md:px-6 flex items-center justify-between gap-4">
        <Link
          href="/"
          aria-label="Lakshya home"
          aria-current={active === 'home' ? 'page' : undefined}
          className="flex items-center gap-2 group min-h-[44px]"
        >
          <span
            aria-hidden="true"
            className="inline-flex w-7 h-7 rounded-md items-center justify-center text-[14px] font-bold text-[#0b0b14]"
            style={{ background: 'linear-gradient(135deg, #a68aff 0%, #5d9fff 100%)' }}
          >
            ल
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-white">Lakshya</span>
        </Link>

        <nav aria-label="Marketing navigation" className="flex items-center gap-1 sm:gap-3">
          {NAV.map((item) => {
            const isActive = active === item.key
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`px-2 sm:px-3 py-2 text-[13px] rounded-md transition-colors min-h-[36px] inline-flex items-center ${
                  isActive ? 'text-white font-medium' : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
          <span aria-hidden="true" className="hidden sm:block w-px h-5 bg-white/10 mx-1" />
          <Link
            href="/login"
            className="px-2 sm:px-3 py-2 text-[13px] text-white/60 hover:text-white transition-colors min-h-[36px] inline-flex items-center"
          >
            Sign in
          </Link>
          <Link
            href="/login?ref=marketing-cta"
            className="ml-1 inline-flex items-center px-3 py-2 text-[13px] font-medium bg-white text-[#07070b] rounded-md hover:bg-white/90 transition-colors min-h-[36px]"
          >
            Start free
          </Link>
        </nav>
      </div>
    </header>
  )
}

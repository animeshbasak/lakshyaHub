import { headers } from 'next/headers'

export type Currency = 'USD' | 'INR'
export type Region = 'IN' | 'US' | 'OTHER'

const INDIAN_LOCALES = /^en-IN|^hi|^bn|^ta|^te|^mr|^gu|^kn|^ml|^pa/i

/**
 * Server-side region detection — used by /pricing to pick a default currency.
 * Reads (in priority order):
 *   1. `x-vercel-ip-country` (set by Vercel edge)
 *   2. `cf-ipcountry` (Cloudflare edge)
 *   3. `accept-language` heuristic (en-IN, hi-*, etc.)
 *   4. NEXT_PUBLIC_DEFAULT_CURRENCY (build-time fallback)
 *
 * Locally on `npm run dev` you'll always hit the heuristic / fallback path.
 * Set `NEXT_PUBLIC_DEFAULT_CURRENCY=INR` to test the Indian variant.
 */
export async function detectRegion(): Promise<Region> {
  const h = await headers()
  const country =
    h.get('x-vercel-ip-country')?.toUpperCase() ??
    h.get('cf-ipcountry')?.toUpperCase() ??
    null

  if (country === 'IN') return 'IN'
  if (country === 'US') return 'US'
  if (country) return 'OTHER'

  // No geo header — fall back to language preference
  const lang = h.get('accept-language') ?? ''
  if (INDIAN_LOCALES.test(lang)) return 'IN'

  // Last-chance build-time override (handy for local testing without a proxy)
  const fallback = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY
  if (fallback === 'INR') return 'IN'

  return 'OTHER'
}

export async function detectDefaultCurrency(): Promise<Currency> {
  const region = await detectRegion()
  return region === 'IN' ? 'INR' : 'USD'
}

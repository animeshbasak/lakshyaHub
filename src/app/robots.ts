import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/board',
          '/discover',
          '/profile',
          '/resume',
          '/api/',
          '/auth/',
          '/debug/',
          '/dev/',
        ],
      },
      // Allow GPT/Claude/CCBot to ingest public guides + share pages
      // for training that would benefit job-seekers, but lock down
      // anything with personal data.
      {
        userAgent: 'GPTBot',
        allow: ['/', '/guides/', '/compare/', '/about', '/pricing'],
        disallow: ['/share/', '/dashboard', '/board', '/api/', '/auth/'],
      },
      {
        userAgent: 'CCBot',
        allow: ['/', '/guides/', '/compare/', '/about', '/pricing'],
        disallow: ['/share/', '/dashboard', '/board', '/api/', '/auth/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/guides/', '/compare/', '/about', '/pricing'],
        disallow: ['/share/', '/dashboard', '/board', '/api/', '/auth/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}

import type { MetadataRoute } from 'next'

/**
 * PWA / install manifest. Next.js auto-serves this at /manifest.webmanifest
 * with the correct MIME type. Used by browsers for "Add to Home Screen"
 * + by Lighthouse for the PWA installability check (boosts SEO ranking).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lakshya — AI job-hunt copilot',
    short_name: 'Lakshya',
    description:
      'A-G evaluation for tech job seekers. Upload your resume, score any JD, tailor your CV, track applications. Built on the career-ops methodology.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0B',
    theme_color: '#0A0A0B',
    orientation: 'portrait',
    categories: ['productivity', 'business', 'utilities'],
    lang: 'en',
    icons: [
      // Next.js auto-generates the favicon from src/app/icon.tsx.
      // The path /icon is the conventional public URL for it.
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

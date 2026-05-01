import type { MetadataRoute } from 'next'
import { ARCHETYPES } from '@/lib/careerops/archetypes'
import { listCompetitors } from '@/content/compare'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lakshya.app'

/**
 * Lakshya sitemap — partitioned by content type.
 *
 * Static (this file): home, pricing, about, login, archetype guides.
 * Dynamic public-share entries (/share/:evalId) will be added as a separate
 * sitemap partition (`/sitemap/shares.xml`) when count exceeds 100.
 *
 * Programmatic /jobs/:portal/:slug pages will get their own partition
 * (`/sitemap/jobs.xml`) when Phase 2 scan ships and live job count > 50.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const statics: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,        lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/about`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.6 },
    { url: `${BASE}/guides`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/compare`, lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/login`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.4 },
  ]

  const guides: MetadataRoute.Sitemap = ARCHETYPES.map(archetype => ({
    url: `${BASE}/guides/${archetype}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.85,
  }))

  // Only include compare pages with actual content (skip coming-soon stubs).
  // Indexing thin coming-soon pages dilutes ranking; let them populate later.
  const compares: MetadataRoute.Sitemap = listCompetitors()
    .filter((c) => c.status === 'published')
    .map((c) => ({
      url: `${BASE}/compare/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

  return [...statics, ...guides, ...compares]
}

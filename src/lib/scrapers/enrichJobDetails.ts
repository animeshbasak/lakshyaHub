// src/lib/scrapers/enrichJobDetails.ts
import type { RawJobPartial } from '@/lib/scrapers/types'

export async function enrichJobDetails(
  job: RawJobPartial,
  apifyToken: string
): Promise<RawJobPartial> {
  // If we already have a reasonably long description, skip enrichment
  if (job.description && job.description.length > 300) return job
  if (!job.url) return job

  try {
    console.log(`[enrichJobDetails] Enriching: ${job.title} at ${job.company}`)

    // Use RAG web browser to fetch full JD from job URL
    const response = await fetch(
      `https://api.apify.com/v2/acts/apify~rag-web-browser/run-sync-get-dataset-items?token=${apifyToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: job.url,
          maxResults: 1,
          scrapingTool: 'raw-http',
        }),
      }
    )

    if (!response.ok) return job

    const data = await response.json()
    const text = data?.[0]?.text ?? ''

    if (text.length > 100) {
      console.log(`[enrichJobDetails] Successfully enriched: ${job.title}`)
      return {
        ...job,
        description: text.slice(0, 5000) // Keep it manageable
      }
    }
  } catch (err) {
    console.warn(`[enrichJobDetails] Failed to enrich ${job.url}:`, err)
  }

  return job
}

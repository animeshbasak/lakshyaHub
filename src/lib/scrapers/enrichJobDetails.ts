// src/lib/scrapers/enrichJobDetails.ts
import type { RawJobPartial } from '@/lib/scrapers/types'
import { checkLiveness } from '@/lib/scrapers/liveness'

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
      // Lite liveness check — gated. When flag off, skip the regex pass
      // entirely so behaviour matches pre-wire-in. Persistence reads
      // `liveness_status` from the returned object.
      const liveness_status =
        process.env.JOB_LIVENESS_FILTER === 'true'
          ? checkLiveness(text, job.url).status
          : undefined
      return {
        ...job,
        description: text.slice(0, 5000), // Keep it manageable
        liveness_status,
      }
    }
  } catch (err) {
    console.warn(`[enrichJobDetails] Failed to enrich ${job.url}:`, err)
  }

  return job
}

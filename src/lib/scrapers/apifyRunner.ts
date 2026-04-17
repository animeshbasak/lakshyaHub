// src/lib/scrapers/apifyRunner.ts
import type { RawJob } from '@/lib/scrapers/types'
import type { ActorConfig } from '@/lib/scrapers/actorIds'

const BASE = 'https://api.apify.com/v2'

export async function runActor(
  actor: ActorConfig,
  query: string,
  location: string,
  limit: number,
  token: string,
): Promise<{ jobs: RawJob[]; error?: string }> {
  const urlSafeId = actor.id.replace('/', '~')
  const input = actor.buildInput(query, location, limit)

  console.log(`[runActor] Starting: ${actor.id}`)
  console.log(`[runActor] URL: POST ${BASE}/acts/${urlSafeId}/runs`)
  console.log(`[runActor] Input:`, JSON.stringify(input))

  // Start run
  let runId: string
  try {
    const res = await fetch(`${BASE}/acts/${urlSafeId}/runs?token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    console.log(`[runActor] Start response status: ${res.status}`)

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      console.error(`[runActor] Start failed:`, errBody)
      return {
        jobs: [],
        error: `${res.status}: ${errBody?.error?.message ?? errBody?.message ?? 'Actor not found or access denied'}`
      }
    }
    const data = await res.json()
    runId = data?.data?.id
    console.log(`[runActor] Run started: ${runId}`)

    if (!runId) return { jobs: [], error: 'No run ID returned from Apify' }
  } catch (e) {
    console.error(`[runActor] Network error starting actor:`, e)
    return { jobs: [], error: `Network error: ${String(e)}` }
  }

  // Poll
  let datasetId: string | undefined
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 3000))
    try {
      const res = await fetch(`${BASE}/actor-runs/${runId}?token=${token}`)
      if (!res.ok) {
        console.warn(`[runActor] Poll ${i + 1} status fallback: ${res.status}`)
        continue
      }
      const data = await res.json()
      const status = data?.data?.status
      console.log(`[runActor] Poll ${i + 1}/60: status=${status}`)

      if (status === 'SUCCEEDED') {
        datasetId = data.data.defaultDatasetId
        console.log(`[runActor] Succeeded. Dataset: ${datasetId}`)
        break
      }
      if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
        console.error(`[runActor] Run ended with status: ${status}`)
        return { jobs: [], error: `Run ${status.toLowerCase()}` }
      }
    } catch (e) {
      console.warn(`[runActor] Poll error (will retry):`, e)
    }
  }

  if (!datasetId) return { jobs: [], error: 'Timed out after 3 minutes' }

  // Fetch results
  try {
    const res = await fetch(`${BASE}/datasets/${datasetId}/items?token=${token}&limit=200`)
    if (!res.ok) {
      console.error(`[runActor] Dataset fetch failed status: ${res.status}`)
      return { jobs: [], error: 'Failed to fetch results' }
    }
    const items: Record<string, unknown>[] = await res.json()
    console.log(`[runActor] Raw items received: ${items.length}`)
    const jobs = items
      .map(item => actor.normalizeJob(item))
      .filter(j => j.title.trim() && j.company.trim())
    console.log(`[runActor] Valid jobs after filter: ${jobs.length}`)
    return { jobs }
  } catch (e) {
    console.error(`[runActor] Dataset fetch error:`, e)
    return { jobs: [], error: `Dataset fetch failed: ${String(e)}` }
  }
}

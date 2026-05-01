import { ACTORS, SOURCE_ACTORS } from '@/lib/scrapers/actorIds'
import { runActor } from '@/lib/scrapers/apifyRunner'
import { searchDirectSources } from '@/lib/scrapers/directSources'
import type { ScrapeConfig, RawJob, LogCallback, UserSource } from '@/lib/scrapers/types'

export type { ScrapeConfig, RawJob, UserSource }

/**
 * SCRAPER DECISION MAKER V2
 *
 * Strategy:
 * 1. Run all user-selected sources IN PARALLEL (not sequential)
 * 2. Within each source, try actors in order until one succeeds
 * 3. Combine all results, deduplicate by title+company
 * 4. If total < limit after selected sources, auto-append Google Jobs
 * 5. Never hard-fail — return whatever was collected
 */
export async function scrapeJobsWithFallback(
  config: ScrapeConfig,
  token: string,
  log: LogCallback,
): Promise<{ jobs: RawJob[]; summary: string; errors: string[] }> {

  const perSourceLimit = config.limit
  const allJobs: RawJob[] = []
  const seen = new Set<string>()  // dedup by lower(title)+lower(company)
  const collectedErrors: string[] = []

  function addJobs(jobs: RawJob[]) {
    for (const job of jobs) {
      const key = `${job.title.toLowerCase().trim()}::${job.company.toLowerCase().trim()}`
      if (!seen.has(key)) {
        seen.add(key)
        allJobs.push(job)
      }
    }
  }

  // Run selected sources in parallel
  const selectedSources = config.sources.filter(s => s !== 'web')  // web runs last
  const hasWebSource = config.sources.includes('web')

  if (selectedSources.length > 0) {
    log('info', `Running ${selectedSources.length} sources in parallel: ${selectedSources.join(', ')}...`)

    const sourcePromises = selectedSources.map(async (source) => {
      const actorKeys = SOURCE_ACTORS[source]
      if (!actorKeys) return []

      for (const actorKey of actorKeys) {
        const actor = ACTORS[actorKey]
        log('info', `Trying ${actor.label}...`)
        const { jobs, error } = await runActor(actor, config.query, config.location, perSourceLimit, token)

        if (error) {
          // Gracefully skip paid-only actors (e.g. Glassdoor "rent required" 403)
          // surface a clean warning instead of a scary stack-like error
          const isPaidOnly = /requires paid actor/i.test(error)
          if (isPaidOnly) {
            log('warn', `${actor.label} skipped — requires paid actor`)
            collectedErrors.push(error)
            continue
          }
          log('warn', `✗ ${actor.label} failed: ${error}`)
          collectedErrors.push(`${actor.label}: ${error}`)
          continue  // try next actor for this source
        }

        if (jobs.length === 0) {
          log('warn', `✗ ${actor.label} returned 0 results`)
          continue
        }

        log('success', `✓ ${actor.label}: ${jobs.length} jobs found`)
        return jobs
      }
      log('error', `All ${source} actors failed — no results found`)
      collectedErrors.push(`${source}: all actors failed`)
      return []
    })

    const results = await Promise.allSettled(sourcePromises)
    for (const result of results) {
      if (result.status === 'fulfilled') addJobs(result.value)
    }

    log('info', `After parallel run: ${allJobs.length} unique jobs collected`)
  }

  // Google Jobs (Tier 3) — always run if:
  //   (a) user selected 'web', OR
  //   (b) we still have fewer jobs than requested
  const needsMoreJobs = allJobs.length < config.limit
  if (hasWebSource || needsMoreJobs) {
    const reason = hasWebSource ? 'Web / Company Sites selected' : `only ${allJobs.length}/${config.limit} jobs found — expanding via Google Jobs`
    log('info', `Running Google Jobs (${reason})...`)
    const googleActor = ACTORS['google_jobs']
    const { jobs, error } = await runActor(
      googleActor,
      config.query,
      config.location,
      Math.max(10, config.limit - allJobs.length),
      token,
    )
    if (error) {
      log('warn', `Google Jobs failed: ${error}`)
    } else {
      const before = allJobs.length
      addJobs(jobs)
      log('success', `Google Jobs: +${allJobs.length - before} new unique jobs (covers company career portals)`)
    }
  }

  // Always run direct sources (Greenhouse/Lever/RemoteOK) — free, no Apify
  log('info', 'Running direct company portals (Greenhouse, Lever, RemoteOK)...')
  const { jobs: directJobs, errors: directErrors } = await searchDirectSources(
    config.query,
    config.location,
    config.limit,
  )
  collectedErrors.push(...directErrors)
  const directBefore = allJobs.length
  addJobs(directJobs)
  if (directJobs.length > 0) {
    log('success', `Direct portals: +${allJobs.length - directBefore} jobs (Greenhouse, Lever, RemoteOK)`)
  }

  const summary = allJobs.length === 0
    ? 'No jobs found from any source'
    : `${allJobs.length} unique jobs from: ${[...new Set(allJobs.map(j => j.source))].join(', ')}`

  log(allJobs.length > 0 ? 'success' : 'error', summary)
  return { jobs: allJobs, summary, errors: collectedErrors }
}

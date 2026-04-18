'use server'
import { createClient } from '@/lib/supabase/server'
import { computeDedupHash } from '@/lib/dedup'
import { scrapeJobsWithFallback } from '@/lib/scrapers'
import { buildSearchQueries } from '@/lib/scrapers/buildSearchQuery'
import { enrichJobDetails } from '@/lib/scrapers/enrichJobDetails'
import { runJdMatch5dTask, runJobStructureTask } from '@/lib/ai/taskRunner'
import { applyPostScrapeFilters } from '@/lib/filters/jobFilters'
import type { ScrapeConfig } from '@/lib/scrapers/types'
import type { ResumeProfile } from '@/types'

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
console.log('[scrapeJobs] APIFY_API_TOKEN present:', !!APIFY_API_TOKEN)

export async function scrapeJobs(config: ScrapeConfig) {
  if (!APIFY_API_TOKEN) {
    return { error: 'APIFY_API_TOKEN is not configured.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // 1. Fetch user profile
  const { data: profile } = await supabase
    .from('resume_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // 2. Expand queries if LinkedIn is selected
  if (config.sources.includes('linkedin' as any)) {
    const expanded = buildSearchQueries(config.query, config.location)
    console.log(`[scrapeJobs] Expanded into ${expanded.length} LinkedIn search variants.`)
    // scrapeJobsWithFallback uses actorIds.ts buildInput — expansion noted for future use
  }

  // 3. Create scrape session
  const { data: session, error: sessionError } = await supabase
    .from('scrape_sessions')
    .insert({
      user_id: user.id,
      source: config.sources.join(','),
      query: config.query,
      status: 'running',
    })
    .select()
    .single()

  if (sessionError) return { error: sessionError.message }

  const log = async (type: 'info' | 'success' | 'warn' | 'error', message: string) => {
    console.log(`[ScrapeLog] ${type.toUpperCase()}: ${message}`)
    await supabase.from('scrape_logs').insert({ session_id: session.id, type, message })
  }

  try {
    // 4. Run Scraper
    const { jobs: rawJobsUnfiltered, summary, errors: scrapeErrors } = await scrapeJobsWithFallback(config, APIFY_API_TOKEN, log)
    const rawJobs = applyPostScrapeFilters(rawJobsUnfiltered)
    await log('info', `Filtered to ${rawJobs.length} India-relevant jobs (from ${rawJobsUnfiltered.length} raw).`)

    // 5. Enrich and Score (Top 50 only for cost/speed)
    await log('info', `Processing ${rawJobs.length} jobs... Enriching top 50 with full details.`)

    const jobsToProcess = rawJobs.slice(0, 50)
    const otherJobs = rawJobs.slice(50)

    const processedJobs = await Promise.all(
      jobsToProcess.map(async (raw) => {
        const enriched = await enrichJobDetails(raw, APIFY_API_TOKEN!)
        const dedup_hash = await computeDedupHash(raw.title, raw.company)

        let fit_score = 0
        let fit_breakdown = null

        if (profile) {
          // Use runJdMatch5dTask instead of direct AI SDK / Groq calls
          const resumeText = (profile as ResumeProfile).full_resume_text ?? ''
          const jdText = enriched.description ?? ''
          const prompt = buildJdMatch5dPrompt(resumeText, enriched.title, enriched.company, jdText)
          const result = await runJdMatch5dTask(prompt)
          if (result.success && result.output) {
            const out = result.output as Record<string, unknown>
            fit_score = typeof out.overall_score === 'number' ? out.overall_score : 0
            fit_breakdown = out
          }
        }

        // Extract structured metadata (seniority, remote_type, tech_stack, salary)
        let structured: Record<string, unknown> | null = null
        if (enriched.description) {
          const structResult = await runJobStructureTask(enriched.title, enriched.company, enriched.description)
          if (structResult.success && structResult.output) {
            structured = structResult.output as Record<string, unknown>
          }
        }

        return {
          user_id: user.id,
          session_id: session.id,
          source: raw.source,
          title: raw.title,
          company: raw.company,
          location: raw.location || null,
          description: enriched.description || null,
          url: raw.url || null,
          salary_range: raw.salary || null,
          fit_score,
          fit_breakdown,
          raw_data: { ...raw, structured },
          dedup_hash,
          scraped_at: new Date().toISOString(),
        }
      })
    )

    const otherProcessed = await Promise.all(
      otherJobs.map(async (raw) => ({
        user_id: user.id,
        session_id: session.id,
        source: raw.source,
        title: raw.title,
        company: raw.company,
        location: raw.location || null,
        description: raw.description || null,
        url: raw.url || null,
        salary_range: raw.salary || null,
        fit_score: 0,
        fit_breakdown: null,
        raw_data: raw,
        dedup_hash: await computeDedupHash(raw.title, raw.company),
        scraped_at: new Date().toISOString(),
      }))
    )

    const finalBatch = [...processedJobs, ...otherProcessed]

    // 6. Batch Insert
    const { error: upsertError } = await supabase
      .from('jobs')
      .insert(finalBatch)

    if (upsertError) {
      console.error('[scrapeJobs] Batch upsert failed:', upsertError)
      await log('error', `Failed to save jobs: ${upsertError.message}`)
    }

    // 7. Complete Session
    await supabase
      .from('scrape_sessions')
      .update({
        status: 'completed',
        jobs_found: rawJobs.length,
        jobs_saved: finalBatch.length,
        completed_at: new Date().toISOString(),
      })
      .eq('id', session.id)

    return {
      success: true,
      jobsFound: rawJobs.length,
      jobsSaved: finalBatch.length,
      sessionId: session.id,
      summary,
      errors: scrapeErrors,
    }

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown failure'
    await log('error', `Critical failure: ${message}`)
    await supabase
      .from('scrape_sessions')
      .update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() })
      .eq('id', session.id)
    return { error: message, sessionId: session.id }
  }
}

function buildJdMatch5dPrompt(
  resumeText: string,
  jobTitle: string,
  company: string,
  jdText: string,
): string {
  return `You are an expert recruiter evaluating a candidate's fit for a job.

## Job
Title: ${jobTitle}
Company: ${company}
Description:
${jdText.slice(0, 3000)}

## Candidate Resume
${resumeText.slice(0, 3000)}

Evaluate the fit across 5 dimensions: skills, title, seniority, location, salary.
Return a JSON object with this exact structure:
{
  "overall_score": <0-100 number>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "verdict": <one sentence summary>,
  "dimensions": {
    "skills":    { "score": <0-100>, "note": "<brief note>" },
    "title":     { "score": <0-100>, "note": "<brief note>" },
    "seniority": { "score": <0-100>, "note": "<brief note>" },
    "location":  { "score": <0-100>, "note": "<brief note>" },
    "salary":    { "score": <0-100>, "note": "<brief note>" }
  },
  "top_gaps": ["<gap1>", "<gap2>", "<gap3>"]
}`
}

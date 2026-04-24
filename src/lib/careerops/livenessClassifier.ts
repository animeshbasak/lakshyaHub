export type LivenessStatus = 'active' | 'expired' | 'uncertain'

export interface LivenessInput {
  httpStatus: number
  finalUrl: string
  bodyText: string
  hasApplyControl: boolean
}

export interface LivenessResult {
  status: LivenessStatus
  reason: string
}

const HARD_EXPIRED_PATTERNS = [
  /job no longer available/i,
  /position (has been|is) filled/i,
  /no longer (accepting|open|available)/i,
  /job expired/i,
  /application closed/i,
  /bereits besetzt/i,           // German
  /nicht mehr verf[uü]gbar/i,   // German
  /offre.*expir[ée]e?/i,        // French
  /poste.*pourvu/i,              // French
  /募集は終了/,                   // Japanese
]

const LISTING_REDIRECT_PATTERNS = [
  /\d+ jobs? found/i,
  /search results loaded/i,
  /filter by (location|role|level)/i,
]

const MIN_CONTENT_CHARS = 300

export function classifyLiveness(input: LivenessInput): LivenessResult {
  const { httpStatus, finalUrl, bodyText, hasApplyControl } = input

  if (httpStatus === 404 || httpStatus === 410) {
    return { status: 'expired', reason: `http ${httpStatus}` }
  }

  if (/[?&]error=true/i.test(finalUrl)) {
    return { status: 'expired', reason: 'url error param' }
  }

  for (const pattern of HARD_EXPIRED_PATTERNS) {
    if (pattern.test(bodyText)) {
      return { status: 'expired', reason: `hard pattern: ${pattern.source}` }
    }
  }

  for (const pattern of LISTING_REDIRECT_PATTERNS) {
    if (pattern.test(bodyText)) {
      return { status: 'expired', reason: 'redirected to listing page' }
    }
  }

  if (hasApplyControl) {
    return { status: 'active', reason: 'apply control visible' }
  }

  if (bodyText.length < MIN_CONTENT_CHARS) {
    return { status: 'expired', reason: `content under ${MIN_CONTENT_CHARS} chars` }
  }

  return { status: 'uncertain', reason: 'content present, no apply control detected' }
}

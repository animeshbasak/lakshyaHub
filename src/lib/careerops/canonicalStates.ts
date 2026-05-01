export const CANONICAL_STATES = [
  'Evaluated',
  'Applied',
  'Responded',
  'Interview',
  'Offer',
  'Rejected',
  'Discarded',
  'SKIP',
] as const

export type CanonicalState = typeof CANONICAL_STATES[number]

export const STATUS_ALIASES: Record<string, CanonicalState> = {
  // Spanish
  'evaluada': 'Evaluated',
  'evaluado': 'Evaluated',
  'aplicado': 'Applied',
  'aplicada': 'Applied',
  'respondido': 'Responded',
  'respondida': 'Responded',
  'entrevista': 'Interview',
  'oferta': 'Offer',
  'rechazado': 'Rejected',
  'rechazada': 'Rejected',
  'descartado': 'Discarded',
  'descartada': 'Discarded',
  // English
  'evaluated': 'Evaluated',
  'applied': 'Applied',
  'responded': 'Responded',
  'interview': 'Interview',
  'offer': 'Offer',
  'rejected': 'Rejected',
  'discarded': 'Discarded',
  'skip': 'SKIP',
}

const RANK: Record<CanonicalState, number> = {
  SKIP: 0,
  Evaluated: 1,
  Discarded: 1,
  Applied: 2,
  Responded: 3,
  Interview: 4,
  Rejected: 5,
  Offer: 6,
}

export function normalizeStatus(raw: string | null | undefined): CanonicalState {
  if (!raw) return 'SKIP'
  const key = raw.trim().toLowerCase()
  return STATUS_ALIASES[key] ?? 'SKIP'
}

export function statusRank(state: CanonicalState): number {
  return RANK[state]
}

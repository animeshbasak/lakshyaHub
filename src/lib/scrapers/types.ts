// src/lib/scrapers/types.ts

export type UserSource = 'linkedin' | 'naukri' | 'indeed' | 'glassdoor' | 'wellfound' | 'web'

export interface ScrapeConfig {
  query: string
  location: string
  sources: UserSource[]
  limit: number
}

export interface RawJobPartial {
  title: string
  company: string
  location: string
  description: string
  url: string
  salary?: string
  source: string
  [key: string]: unknown
}

export type RawJob = RawJobPartial

export type LogCallback = (
  type: 'info' | 'success' | 'warn' | 'error',
  message: string
) => void

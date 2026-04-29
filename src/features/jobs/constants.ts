export const STORAGE_KEYS = {
  PENDING_DESCRIPTION: 'pendingDescription',
  PENDING_TITLE: 'pendingTitle',
  PENDING_COMPANY: 'pendingCompany',
} as const

export const CACHE_KEYS = {
  JOBS: 'destacai_jobs_cache',
  JOBS_TS: 'destacai_jobs_cache_ts',
} as const

export const QUERY_KEYS = {
  JOBS: 'jobs',
  GENERATION_STATUS: 'generation-status',
  ATS_SCORE: 'ats-score',
} as const

export const POLLING_INTERVAL_MS = 5_000

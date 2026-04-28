// CV Upload
export const MAX_SIZE_BYTES = 10 * 1024 * 1024
export const MAX_SIZE_MB = MAX_SIZE_BYTES / (1024 * 1024)

// Free tier
export const FREE_TIER_LIMIT = 5

// Polling
export const POLLING_INTERVAL_MS = 5_000

// Chrome storage keys
export const STORAGE_KEYS = {
  AUTH: 'destacai_auth',
  PENDING_VERIFICATION: 'destacai_pending_verification',
  PENDING_SIGNUP: 'destacai_pending_signup',
  PENDING_DESCRIPTION: 'pendingDescription',
  PENDING_TITLE: 'pendingTitle',
  PENDING_COMPANY: 'pendingCompany',
  GUEST_ID: 'destacai_guest_id',
  GUEST_JOBS: 'destacai_guest_jobs',
  GUEST_GENERATIONS_USED: 'destacai_guest_generations_used',
  GUEST_CV_R2_KEY: 'destacai_guest_cv_r2_key',
} as const

// React Query cache keys
export const QUERY_KEYS = {
  JOBS: 'jobs',
  USER: 'user',
  GENERATION_STATUS: 'generation-status',
  ATS_SCORE: 'ats-score',
} as const

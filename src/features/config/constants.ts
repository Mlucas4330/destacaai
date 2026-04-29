export const STORAGE_KEYS = {
  GUEST_ID: 'destacai_guest_id',
  GUEST_JOBS: 'destacai_guest_jobs',
  GUEST_GENERATIONS_USED: 'destacai_guest_generations_used',
  GUEST_CV_R2_KEY: 'destacai_guest_cv_r2_key',
} as const

export const FREE_TIER_LIMIT = 5
export const ADMIN_BYPASS = import.meta.env.VITE_ADMIN_BYPASS === 'true'

export const CACHE_KEYS = {
  USER: 'destacai_user_cache',
  USER_TS: 'destacai_user_cache_ts',
} as const

export const QUERY_KEYS = {
  USER: 'user',
} as const

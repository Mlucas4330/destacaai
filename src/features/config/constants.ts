export const FREE_TIER_LIMIT = 5
export const ADMIN_BYPASS = import.meta.env.VITE_ADMIN_BYPASS === 'true'

export const CACHE_KEYS = {
  USER: 'destacai_user_cache',
  USER_TS: 'destacai_user_cache_ts',
} as const

export const QUERY_KEYS = {
  USER: 'user',
} as const

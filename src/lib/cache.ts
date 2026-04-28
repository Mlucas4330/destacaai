export const CACHE_KEYS = {
  JOBS: 'destacai_jobs_cache',
  JOBS_TS: 'destacai_jobs_cache_ts',
  USER: 'destacai_user_cache',
  USER_TS: 'destacai_user_cache_ts',
}

export function clearAppCache() {
  Object.values(CACHE_KEYS).forEach((key) => localStorage.removeItem(key))
}

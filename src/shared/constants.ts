// CV Upload
export const MAX_SIZE_BYTES = 10 * 1024 * 1024
export const MAX_SIZE_MB = MAX_SIZE_BYTES / (1024 * 1024)

// Free tier
export const FREE_TIER_LIMIT = 5

// Polling
export const POLLING_INTERVAL_MS = 5_000

// Chrome storage keys
export const STORAGE_KEYS = {
  PENDING_DESCRIPTION: 'pendingDescription',
  PENDING_TITLE: 'pendingTitle',
  PENDING_COMPANY: 'pendingCompany',
} as const

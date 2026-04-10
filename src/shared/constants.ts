import type { Config, LLMProvider } from '@shared/types'

// Jobs
export const MAX_JOBS = 5

// CV Upload
export const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

// IndexedDB
export const DB_NAME = 'destacaai'
export const STORE_NAME = 'cv'
export const DB_VERSION = 1

// LLM Providers
export const PROVIDERS: { value: LLMProvider; label: string }[] = [
  { value: 'openai', label: 'ChatGPT' },
  { value: 'anthropic', label: 'Claude' },
  { value: 'gemini', label: 'Gemini' },
]

// Default Config
export const DEFAULT_CONFIG: Config = { apiKey: '', provider: 'openai' }

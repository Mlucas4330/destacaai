export interface Job {
  id: string
  title: string
  company: string
  description: string
  createdAt: number
}

export type LLMProvider = 'openai' | 'anthropic' | 'gemini'

export interface Config {
  apiKey: string
  provider: LLMProvider
}

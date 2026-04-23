import { createOpenAI } from '@ai-sdk/openai'

const openaiClient = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export function getModelForTier(tier: 'free' | 'paid') {
  if (tier === 'paid') return openaiClient('gpt-4o')
  return openaiClient('gpt-4o-mini')
}

export function getLightweightModel() {
  return openaiClient('gpt-4o-mini')
}

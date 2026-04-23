import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

export const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
})

export const cvQueue = new Queue('cv-generation', { connection })
export const atsQueue = new Queue('ats-scoring', { connection })

export interface CVGenerationJobData {
  jobId: string
  userId: string
  userTier: 'free' | 'paid'
  jobDescription: string
  cvR2Key: string
}

export interface ATSScoringJobData {
  jobId: string
  userId: string
  jobDescription: string
  cvR2Key: string
}

import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/client.js'
import { jobs, users } from '../db/schema.js'
import { cvQueue } from '../lib/queue.js'
import { getPresignedDownloadUrl } from '../lib/r2.js'
import { authMiddleware } from '../middleware/auth.js'
import type { CVGenerationJobData } from '../lib/queue.js'

type Variables = { userId: string }

const FREE_TIER_LIMIT = 5

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

app.post('/:jobId', async (c) => {
  const userId = c.get('userId')
  const jobId = c.req.param('jobId')

  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  })
  if (!job) return c.json({ error: 'Job not found' }, 404)

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })
  if (!user) return c.json({ error: 'User not found' }, 404)
  if (!user.cvR2Key) return c.json({ error: 'No CV uploaded. Please upload your CV in Settings.' }, 400)

  const now = new Date()
  const resetDate = new Date(user.generationsResetAt)
  resetDate.setDate(resetDate.getDate() + 30)

  if (now > resetDate) {
    await db
      .update(users)
      .set({ generationsUsedThisMonth: 0, generationsResetAt: now })
      .where(eq(users.id, userId))
    user.generationsUsedThisMonth = 0
  }

  if (user.tier === 'free' && user.generationsUsedThisMonth >= FREE_TIER_LIMIT) {
    return c.json(
      { error: 'Free tier limit reached', generationsUsed: user.generationsUsedThisMonth, limit: FREE_TIER_LIMIT },
      402,
    )
  }

  const bullmqJob = await cvQueue.add('generate-cv', {
    jobId,
    userId,
    userTier: user.tier,
    jobDescription: job.description,
    cvR2Key: user.cvR2Key,
  } satisfies CVGenerationJobData)

  await db
    .update(jobs)
    .set({ cvGenerationStatus: 'queued', bullmqJobId: bullmqJob.id })
    .where(eq(jobs.id, jobId))

  return c.json({ status: 'queued' }, 202)
})

app.get('/:jobId/status', async (c) => {
  const userId = c.get('userId')
  const jobId = c.req.param('jobId')

  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  })
  if (!job) return c.json({ error: 'Job not found' }, 404)

  if (job.cvGenerationStatus === 'done' && job.cvR2Key) {
    const downloadUrl = await getPresignedDownloadUrl(job.cvR2Key)
    return c.json({ status: 'done', downloadUrl })
  }

  return c.json({
    status: job.cvGenerationStatus,
    ...(job.cvGenerationError ? { error: job.cvGenerationError } : {}),
  })
})

export default app

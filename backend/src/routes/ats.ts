import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/client.js'
import { jobs } from '../db/schema.js'
import { authMiddleware } from '../middleware/auth.js'

type Variables = { userId: string }

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

app.get('/:jobId', async (c) => {
  const userId = c.get('userId')
  const jobId = c.req.param('jobId')

  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
  })
  if (!job) return c.json({ error: 'Job not found' }, 404)

  return c.json({
    jobId: job.id,
    atsStatus: job.atsStatus,
    score: job.atsScore ?? null,
    explanation: job.atsExplanation ?? null,
  })
})

export default app

import { Hono } from 'hono'
import { eq, and } from 'drizzle-orm'
import { db } from '../db/client.js'
import { users, jobs } from '../db/schema.js'
import { uploadToR2, deleteFromR2 } from '../lib/r2.js'
import { atsQueue } from '../lib/queue.js'
import { authMiddleware } from '../middleware/auth.js'
import type { ATSScoringJobData } from '../lib/queue.js'

type Variables = { userId: string }

const MAX_SIZE_BYTES = 10 * 1024 * 1024

const app = new Hono<{ Variables: Variables }>()

app.use('*', authMiddleware)

app.post('/upload', async (c) => {
  const userId = c.get('userId')
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return c.json({ error: 'No file provided.' }, 400)
  }
  if (file.type !== 'application/pdf') {
    return c.json({ error: 'Only PDF files are supported.' }, 400)
  }
  if (file.size > MAX_SIZE_BYTES) {
    return c.json({ error: 'File size must be 10 MB or less.' }, 400)
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const r2Key = `cv/${userId}/cv.pdf`

  await uploadToR2(r2Key, buffer, 'application/pdf')

  await db
    .update(users)
    .set({ cvR2Key: r2Key, cvFileName: file.name })
    .where(eq(users.id, userId))

  const idleJobs = await db.query.jobs.findMany({
    where: and(eq(jobs.userId, userId), eq(jobs.atsStatus, 'idle')),
  })
  for (const job of idleJobs) {
    await atsQueue.add('score-ats', {
      jobId: job.id,
      userId,
      jobDescription: job.description,
      cvR2Key: r2Key,
    } satisfies ATSScoringJobData)
    await db.update(jobs).set({ atsStatus: 'queued' }).where(eq(jobs.id, job.id))
  }

  return c.json({ cvFileName: file.name, cvR2Key: r2Key })
})

app.delete('/', async (c) => {
  const userId = c.get('userId')
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) })

  if (user?.cvR2Key) {
    await deleteFromR2(user.cvR2Key)
    await db.update(users).set({ cvR2Key: null, cvFileName: null }).where(eq(users.id, userId))
  }

  return c.json({ success: true })
})

export default app
